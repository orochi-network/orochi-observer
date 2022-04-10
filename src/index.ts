import { ethers } from 'ethers';
import { OneForAll, QueueLoop } from 'noqueue';
import { Connector } from '@dkdao/framework';
import { AppConf, AppEvent, AppState, AppLogger } from './helper';
import ModelSync from './model/model-sync';
import { eventSync, safeConfirmation } from './tasks/event-sync';
import ModelToken, { IToken } from './model/model-token';
import updateOwnership from './tasks/update-ownership';
import updateOwnershipLegacy from './tasks/update-ownership-legacy';

Connector.connectByUrl(AppConf.mariadbConnectUrl);

const defaultStartBlock = new Map<number, number>([
  [250, 25007080],
  [137, 17869937],
  [4002, 5229640],
]);

(async () => {
  // Init queue loop
  AppState.queue = new QueueLoop();

  // Knex instance
  AppState.knex = Connector.getInstance();

  // Init RPC provider
  AppState.provider = new ethers.providers.StaticJsonRpcProvider(AppConf.fullNodeRpc);

  AppState.targetBlock = (await AppState.provider.getBlockNumber()) - safeConfirmation;

  // Get chainId data
  const network = await AppState.provider.getNetwork();
  AppLogger.info('Connected to chain ID:', network.chainId);
  AppState.chainId = network.chainId;

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
    // If sync data is missing we going to create or clone existing record
    if (typeof token.syncId === 'undefined' || token.syncId === null) {
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
    AppState.token = token;
    const newSync = new ModelSync();
    await newSync.load(token.id);
    AppState.setSync(token.id, newSync);

    // Init token data
    AppState.queue.add(`Syncing events for ${token.address} (${token.name}) blockchain`, async () => eventSync(token));
  });

  if (network.chainId === 250 || network.chainId === 4002) {
    // Fantom and fantom testnet
    AppState.queue.add('Update ownership and card issuance', updateOwnership);
  } else {
    AppState.queue.add('Update ownership and card issuance', updateOwnershipLegacy);
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
