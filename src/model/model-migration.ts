import { Knex } from 'knex';
import { ModelMysqlBasic } from '@dkdao/framework';

export enum EMigrationStatus {
  NewMigration = 0,
  Processing = 1,
  Success = 254,
  Error = 255,
}

export interface IMigration {
  id: number;
  fromChainId: number;
  owner: string;
  tokenId: string;
  status: number;
  createdDate: string;
  updatedDate: string;
}

export class ModelMigration extends ModelMysqlBasic<IMigration> {
  constructor() {
    super('Migration');
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }
}

export default ModelMigration;
