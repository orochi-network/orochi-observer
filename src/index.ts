import { ethers } from 'ethers';
import { QueueLoop } from 'noqueue';
import { Connector } from '@dkdao/framework';
import { AppConf, AppEvent, AppState, AppLogger } from './helper';
import ModelSync from './model/model-sync';
import { eventSync, safeConfirmation } from './tasks/event-sync';
import ModelToken from './model/model-token';
import updateOwnership from './tasks/update-ownership';
import updateOwnershipLegacy from './tasks/update-ownership-legacy';

Connector.connectByUrl(AppConf.mariadbConnectUrl);

const startBlock = new Map<number, number>([
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

  // Get chainId data
  const { chainId } = await AppState.provider.getNetwork();
  AppLogger.info('Connected to chain ID:', chainId);
  AppState.chainId = chainId;

  // Default padding time
  AppState.paddingTime = 1000;

  // Init syncing status
  AppState.syncing = new ModelSync();
  if (await AppState.syncing.isNotExist('chainId', chainId)) {
    AppLogger.info('Init syncing data for the first time', chainId);
    AppState.syncing.chainId = chainId;
    AppState.syncing.startBlock = startBlock.get(chainId) || 0;
    AppState.syncing.syncedBlock = startBlock.get(chainId) || 0;
    AppState.syncing.targetBlock = (await AppState.provider.getBlockNumber()) - safeConfirmation;
    await AppState.syncing.init();
  } else {
    await AppState.syncing.load(chainId);
    AppState.syncing.targetBlock = (await AppState.provider.getBlockNumber()) - safeConfirmation;
    AppLogger.info('Load syncing status for:', chainId);
  }

  // Get watching token list
  const imToken = new ModelToken();
  const tokens = await imToken.getNft(chainId);
  for (let i = 0; i < tokens.length; i += 1) {
    AppState.token = tokens[i];
  }

  AppState.queue.on('error', (name: string, err: Error) => AppLogger.error(name, err));

  // Init token data
  AppState.queue.add('Syncing event from blockchain', eventSync);

  if (chainId === 250 || chainId === 4002) {
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
