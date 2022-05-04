/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { Transaction } from '@dkdao/framework';
import { ethers, utils } from 'ethers';
import { Knex } from 'knex';
import { OneForAll, TillSuccess } from 'noqueue';
import {
  AppLogger,
  calculateSyncingSchedule,
  IPayload,
  rpcRetryTimeout,
  rpcRetries,
  eventEncoder,
  eventPurchase,
} from '../helper';
import { AppState } from '../helper/state';
import { IContract } from '../model/model-contract';
import ModelSync from '../model/model-sync';

export const contractSync = async (contract: IContract, syncing: ModelSync) => {
  let startTime = 0;
  const { provider, targetBlock, chainId } = AppState;
  if (typeof syncing === 'undefined') {
    throw new Error(`Can not load the syncing data for ${contract.name}`);
  }

  // Adjust target block and padding time
  if (syncing.targetBlock < targetBlock) {
    syncing.targetBlock = targetBlock;
  }

  const { fromBlock, toBlock, payload } = calculateSyncingSchedule(
    syncing.syncedBlock,
    syncing.targetBlock,
    contract.address,
    [eventPurchase],
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
            const {
              args: { owner, phaseId, numberOfBoxes, code },
            } = eventEncoder.parseLog(log);
            return {
              chainId,
              buyerAddress: owner.toLowerCase(),
              phaseId: phaseId.toNumber(),
              numberOfBoxes: numberOfBoxes.toNumber(),
              discountCode: utils.toUtf8String(code),
              transactionHash: log.transactionHash,
            };
          });
          if (transferRecords.length > 0) {
            await tx.raw(
              tx('purchase_history')
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
        `${fromBlock} - ${toBlock} [${percent.toFixed(4)}%] target: ${syncing.targetBlock} (${contract.name})`,
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

export default contractSync;
