import { OneForAll } from 'noqueue';
import { Connector } from '@dkdao/framework';
import { AppConf, AppEvent, AppState, AppLogger, safeConfirmation } from './helper';
import ModelSync from './model/model-sync';
import { eventSync } from './tasks/event-sync';
import ModelToken, { IToken } from './model/model-token';
import updateOwnership from './tasks/update-ownership';
import updateOwnershipLegacy from './tasks/update-ownership-legacy';
import ModelContract, { IContract } from './model/model-contract';
import contractSync from './tasks/contract-sync';
import migrateNft from './tasks/migrate-nft';
import syncMigration from './tasks/sync-migration';

Connector.connectByUrl(AppConf.mariadbConnectUrl);

if (AppConf.mariadbFantom) {
  Connector.connectByUrl(AppConf.mariadbFantom, 'fantom');
}

if (AppConf.mariadbPolygon) {
  Connector.connectByUrl(AppConf.mariadbPolygon, 'polygon');
}

const defaultStartBlock = new Map<number, number>([
  [56, 17516750],
  [250, 25007080],
  [137, 17869937],
  [4002, 8904610],
]);

(async () => {
  // Init all data for the early stage
  await AppState.init();

  // Knex instance
  AppState.knex = Connector.getInstance();

  // Get chainId data
  AppLogger.info('Connected to chain ID:', AppState.chainId);

  // Default padding time
  AppState.paddingTime = 1000;

  AppState.queue.on('error', (name: string, err: Error) => AppLogger.error(name, err));

  // Get watching token list
  const imToken = new ModelToken();
  const tokens = await imToken.getAllToken();

  AppState.queue.add('Update target block for syncing', async () => {
    const newValue = (await AppState.provider.getBlockNumber()) - safeConfirmation;
    if (newValue > AppState.targetBlock) {
      AppState.targetBlock = newValue;
      AppLogger.info('Update target block to', AppState.targetBlock);
    }
  });

  await OneForAll(tokens, async (token: IToken) => {
    AppState.token = token;
    // We're only sync the current chain
    if (token.chainId === AppState.chainId) {
      if (typeof token.syncId === 'undefined' || token.syncId === null) {
        // If sync data is missing we going to create or clone existing record
        // Syncing record was not exist, we will clone existing one or create a new one
        const imSync = new ModelSync();
        const syncs = await imSync.get();
        let newRecord;
        if (syncs.length > 0) {
          // Clone no jutsu
          const { chainId, startBlock, syncedBlock, targetBlock } = syncs[0];
          newRecord = await imSync.create({
            chainId,
            startBlock,
            syncedBlock,
            targetBlock,
          });
        } else {
          // Init with default value
          newRecord = await imSync.create({
            chainId: token.chainId,
            startBlock: defaultStartBlock.get(token.chainId) || 0,
            syncedBlock: defaultStartBlock.get(token.chainId) || 0,
            targetBlock: (await AppState.provider.getBlockNumber()) - safeConfirmation,
          });
        }
        if (typeof newRecord !== 'undefined') {
          // Link the token with the sync data
          await imToken.update(
            {
              syncId: newRecord.id,
            },
            [{ field: 'id', value: token.id }],
          );
        }
      }

      // Set token and loading sync data
      AppState.setSync(token.id, await ModelSync.quickLoadToken(token.id));

      // Init token data
      AppState.queue.add(`Syncing events for ${token.address} (${token.name}) blockchain`, async () =>
        eventSync(token),
      );
    }
  });

  const imContract = new ModelContract();
  const contracts = await imContract.getAllContract(AppState.chainId);
  if (contracts.length > 0) {
    await OneForAll(contracts, async (contract: IContract) => {
      const imSync = new ModelSync();
      if (typeof contract.syncId === 'undefined' || contract.syncId === null) {
        const newRecord = await imSync.create({
          chainId: contract.chainId,
          startBlock: defaultStartBlock.get(contract.chainId) || 0,
          syncedBlock: defaultStartBlock.get(contract.chainId) || 0,
          targetBlock: (await AppState.provider.getBlockNumber()) - safeConfirmation,
        });
        if (typeof newRecord !== 'undefined') {
          // Link the token with the sync data
          await imContract.update(
            {
              syncId: newRecord.id,
            },
            [{ field: 'id', value: contract.id }],
          );
        }
      }
      AppState.queue.add(`Syncing events for ${contract.address} (${contract.name}) blockchain`, async () =>
        contractSync(contract, await ModelSync.quickLoadContract(contract.id)),
      );
    });
  }

  if (AppState.chainId === 137) {
    AppState.queue.add('Update ownership and card issuance', updateOwnershipLegacy);
  } else {
    AppState.queue.add('Update ownership and card issuance', updateOwnership);
  }

  const networkCfg = AppState.constantNetwork.get(AppState.chainId);
  if (typeof networkCfg !== 'undefined') {
    // Syncing all migration transfers
    if (networkCfg.migration) {
      AppLogger.info(`Watching migration contract: ${networkCfg.migration}`);
      AppState.queue.add('Syncing migration transfer', syncMigration);
    }
    // Migrate the migration record on target blockchain
    if (networkCfg.migratorProxy) {
      if (AppConf.mariadbFantom) {
        AppState.queue.add('Migrate NFTs from Fantom', async () => {
          await migrateNft('fantom', networkCfg);
        });
      }
      if (AppConf.mariadbPolygon) {
        AppState.queue.add('Migrate NFTs from Polygon', async () => {
          await migrateNft('polygon', networkCfg);
        });
      }
    }
  }

  AppState.queue.start();
})();

// Grateful shutdown handler
function gratefulShutDown(exitSignal: string) {
  // A waiting for feed back from no-queue
  AppEvent.once('exit', (signal: string) => {
    Connector.getInstance()
      .destroy()
      .then(() => {
        AppLogger.info('Grateful shutdown with signal:', signal);
        process.exit(0);
      })
      .catch((error) => {
        AppLogger.error('Can not perform grateful shutdown', error);
        process.exit(1);
      });
  });

  // Schedule shutdown
  AppLogger.info('Scheduling shutdown, asking for working progress to be completed');
  AppState.queue.scheduleShutdown(() => AppEvent.emit('exit', exitSignal));
}

// Listen on SIGTERM and SIGINT
process.on('SIGTERM', gratefulShutDown);
process.on('SIGINT', gratefulShutDown);
