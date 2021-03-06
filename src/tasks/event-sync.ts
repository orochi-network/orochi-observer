/* eslint-disable no-await-in-loop */
import { Transaction } from '@dkdao/framework';
import { ethers } from 'ethers';
import { Knex } from 'knex';
import { OneForAll, TillSuccess } from 'noqueue';
import { AppLogger, parseEvent, calculateSyncingSchedule, IPayload, rpcRetryTimeout, rpcRetries } from '../helper';
import { AppState } from '../helper/state';
import { IToken } from '../model/model-token';
import { ETransferStatus } from '../model/model-transfer';

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
