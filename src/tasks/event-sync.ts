/* eslint-disable no-await-in-loop */
import { Transaction } from '@dkdao/framework';
import { ethers, utils } from 'ethers';
import { Knex } from 'knex';
import { OneForAll, TillSuccess } from 'noqueue';
import { AppLogger, parseEvent } from '../helper';
import { AppState } from '../helper/state';
import { ETransferStatus } from '../model/model-transfer';

const numberOfBlockToBeFastSync = 200;

export const safeConfirmation = 20;

const slowSyncTime = 5000;

const fastSyncTime = 100;

const numberOfBlockToSync = 20;

const syncLimit = Math.floor(numberOfBlockToBeFastSync / numberOfBlockToSync);

const rpcRetries = 10;

const rpcRetryTimeout = 5000;

const eventTransfer = utils.id('Transfer(address,address,uint256)');

interface IPayload {
  fromBlock: number;
  toBlock: number;
  topics: string[];
}

interface ISyncingSchedule {
  fromBlock: number;
  toBlock: number;
  payload: IPayload[];
}

function calculateSyncingSchedule(fBlock: number, tBlock: number): ISyncingSchedule {
  const payload: IPayload[] = [];
  const diff = tBlock - fBlock;
  if (diff <= 1) return { fromBlock: fBlock, toBlock: tBlock, payload };
  let syncTimes = Math.floor(diff / numberOfBlockToSync);
  if (syncTimes >= syncLimit) {
    syncTimes = syncLimit;
  }
  const carry = diff % numberOfBlockToSync;
  let syncingBlock = fBlock;
  const fromBlock = fBlock + 1;
  for (let i = 0; i < syncTimes; i += 1) {
    syncingBlock = fBlock + (i + 1) * numberOfBlockToSync;
    payload.push({
      fromBlock: fBlock + i * numberOfBlockToSync + 1,
      toBlock: syncingBlock,
      topics: [eventTransfer],
    });
  }
  if (carry > 1) {
    payload.push({
      fromBlock: syncingBlock + 1,
      toBlock: syncingBlock + carry,
      topics: [eventTransfer],
    });
    syncingBlock += +carry;
  }
  return { fromBlock, toBlock: syncingBlock, payload };
}

export const eventSync = async () => {
  let startTime = 0;
  const { syncing, provider, queue } = AppState;

  // Adjust target block and padding time
  if (syncing.targetBlock - syncing.syncedBlock < numberOfBlockToBeFastSync) {
    syncing.targetBlock = (await AppState.provider.getBlockNumber()) - safeConfirmation;
  }

  // Can't adjust padding time due to missing sync
  if (syncing.targetBlock - syncing.syncedBlock < numberOfBlockToBeFastSync && AppState.paddingTime !== slowSyncTime) {
    // We need to slow down since the number of to sync is small than numberOfBlockToBeSync
    AppLogger.info('Adjust padding time to', slowSyncTime, 'ms');
    queue.setPaddingTime(slowSyncTime);
    AppState.paddingTime = slowSyncTime;
  }

  if (syncing.targetBlock - syncing.syncedBlock > numberOfBlockToBeFastSync && AppState.paddingTime !== fastSyncTime) {
    // We need to speed up to catch up
    AppLogger.info('Adjust padding time to', fastSyncTime, 'ms');
    queue.setPaddingTime(fastSyncTime);
    AppState.paddingTime = fastSyncTime;
  }

  const { fromBlock, toBlock, payload } = calculateSyncingSchedule(syncing.syncedBlock, syncing.targetBlock);
  if (payload.length > 0) {
    startTime = Date.now();
    const result = await OneForAll<IPayload>(payload, async (filter: IPayload) => {
      return TillSuccess<IPayload>(
        async () => {
          const ret = await provider.getLogs(filter);
          return ret.filter((log) => AppState.hasToken(log.address.toLowerCase()));
        },
        rpcRetryTimeout,
        rpcRetries,
      );
    });
    let count = 0;
    const allLogs = result.filter((e) => e.length > 0);
    AppLogger.info('Get data from RPC found:', allLogs.length, 'records, cost:', Date.now() - startTime, 'ms');
    startTime = Date.now();
    let isTxSuccess = true;
    await Transaction.getInstance()
      .process(async (tx: Knex.Transaction) => {
        for (let i = 0; i < allLogs.length; i += 1) {
          count += allLogs[i].length;
          const transferRecords = allLogs[i].map((log: ethers.providers.Log) => {
            const { from, to, value, transactionHash, blockNumber, contractAddress, eventId } = parseEvent(log);
            return {
              chainId: AppState.chainId,
              tokenId: AppState.getToken(contractAddress).id,
              status: ETransferStatus.NewTransfer,
              eventId,
              from,
              to,
              value,
              blockNumber,
              transactionHash,
            };
          });
          if (transferRecords.length > 0) {
            await tx.raw(
              tx('transfer')
                .insert(transferRecords)
                .toString()
                .replace(/insert/i, 'insert ignore'),
            );
          }
        }
      })
      .catch(async (err: Error) => {
        AppLogger.error(err);
        isTxSuccess = false;
      })
      .exec();
    if (isTxSuccess) {
      AppLogger.info(`Insert ${count} event records cost:`, Date.now() - startTime, 'ms');
      const percent = (toBlock * 100) / syncing.targetBlock;
      AppLogger.info(
        `Completed sync ${toBlock - fromBlock} blocks:`,
        `${fromBlock} - ${toBlock} [${percent.toFixed(4)}%] target: ${syncing.targetBlock}`,
      );
      syncing.syncedBlock = toBlock;
      await syncing.save();
    } else {
      AppLogger.error('Can not save transfer data');
    }
  } else {
    AppLogger.info('Skip syncing due to no diff');
  }
};

export default eventSync;
