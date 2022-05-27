/* eslint-disable no-await-in-loop */
import { AppLogger } from '../helper';
import ModelMigration from '../model/model-migration';

export const syncMigration = async () => {
  const imMigration = new ModelMigration();
  AppLogger.info(`Found ${await imMigration.syncingMigration()} migrating records`);
};

export default syncMigration;
