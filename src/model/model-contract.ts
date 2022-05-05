import { Knex } from 'knex';
import { ModelMysqlBasic } from '@dkdao/framework';

export interface IContract {
  id: number;
  chainId: number;
  syncId: number;
  name: string;
  address: string;
  createdDate: string;
  updatedDate: string;
}

export class ModelContract extends ModelMysqlBasic<IContract> {
  constructor() {
    super('contract');
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }

  public getAllContract(chainId?: number) {
    if (typeof chainId !== 'undefined' && Number.isInteger(chainId)) {
      return this.get([
        {
          field: 'chainId',
          value: chainId,
        },
      ]);
    }
    return this.get();
  }
}

export default ModelContract;
