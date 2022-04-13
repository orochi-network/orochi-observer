import { Knex } from 'knex';
import { ModelMysqlBasic } from '@dkdao/framework';

export enum ETransactionStatus {
  NewTransaction = 0,
  Processing = 1,
  Success = 254,
  Error = 255,
}

export interface ITransaction {
  id: number;
  chainId: number;
  status: number;
  transactionHash: string;
  from: string;
  to: string;
  value: string;
  data: string;
  nonce: number;
  gasPrice: number;
  gasLimit: number;
  signedTransaction: string;
  createdDate: string;
  updatedDate: string;
}

export class ModelTransaction extends ModelMysqlBasic<ITransaction> {
  constructor() {
    super('transaction');
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }
}

export default ModelTransaction;
