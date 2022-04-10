/* eslint-disable no-await-in-loop */
import { Transaction } from '@dkdao/framework';
import { ethers, utils } from 'ethers';
import { Knex } from 'knex';
import { OneForAll, TillSuccess } from 'noqueue';
import { AppLogger, parseEvent } from '../helper';
import { AppState } from '../helper/state';
import { IToken } from '../model/model-token';
import { ETransferStatus } from '../model/model-transfer';

export const numberOfBlockToBeFastSync = 1999;

export const safeConfirmation = 20;

export const slowSyncTime = 5000;

export const fastSyncTime = 100;

export const numberOfBlockToSync = 100;

const syncLimit = Math.floor(numberOfBlockToBeFastSync / numberOfBlockToSync);

const rpcRetries = 10;

const rpcRetryTimeout = 5000;

const eventTransfer = utils.id('Transfer(address,address,uint256)');

interface IPayload {
  fromBlock: number;
  toBlock: number;
  topics: string[];
  address: string;
}

interface ISyncingSchedule {
  fromBlock: number;
  toBlock: number;
  payload: IPayload[];
}

function calculateSyncingSchedule(fBlock: number, tBlock: number, address: string): ISyncingSchedule {
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
      address,
    });
  }
  if (carry > 1) {
    payload.push({
      fromBlock: syncingBlock + 1,
      toBlock: syncingBlock + carry,
      topics: [eventTransfer],
      address,
    });
    syncingBlock += +carry;
  }
  return { fromBlock, toBlock: syncingBlock, payload };
}

export const eventSync = async (token: IToken) => {
  let startTime = 0;
  const { provider, targetBlock } = AppState;
  const syncing = AppState.getSync(token.id);
  if (typeof syncing === 'undefined') {
    throw new Error(`Can not load the syncing data for ${token.name}`);
  }

  // Adjust target block and padding time
  if (syncing.targetBlock < targetBlock) {
    syncing.targetBlock = targetBlock;
  }

  const { fromBlock, toBlock, payload } = calculateSyncingSchedule(
    syncing.syncedBlock,
    syncing.targetBlock,
    token.address,
  );

  if (payload.length > 0) {
    startTime = Date.now();
    const result = await OneForAll<IPayload>(payload, async (filter: IPayload) => {
      return TillSuccess<IPayload>(async () => provider.getLogs(filter), rpcRetryTimeout, rpcRetries);
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
            const { from, to, value, transactionHash, blockNumber, eventId } = parseEvent(log);
            return {
              chainId: AppState.chainId,
              tokenId: token.id,
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
        `${fromBlock} - ${toBlock} [${percent.toFixed(4)}%] target: ${syncing.targetBlock} (${token.name})`,
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
