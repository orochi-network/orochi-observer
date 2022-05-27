import { Knex } from 'knex';
import { ModelMysqlBasic } from '@dkdao/framework';
import { AppState } from '../helper';

export enum ETransactionStatus {
  NewTransaction = 0,
  Processing = 1,
  Success = 254,
  Error = 255,
}

export interface ITransaction {
  id: number;
  chainId: number;
  status: ETransactionStatus;
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

interface INonce {
  nonce: null | number;
  createdDate: null | number;
}

export class ModelTransaction extends ModelMysqlBasic<ITransaction> {
  constructor(instanceName?: string) {
    super('transaction', instanceName);
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }

  public async getNonce(address: string) {
    const [[record]]: [INonce][] = await this.getKnex().raw(
      'SELECT MAX(`nonce`) AS `nonce`' +
        ',UNIX_TIMESTAMP(MAX(createdDate)) AS createdDate FROM `transaction` WHERE `from`=? AND `status`=? LIMIT 1',
      [address, ETransactionStatus.Success],
    );

    // If several records are existing and these records weren't too old
    if (record.nonce !== null && record.createdDate !== null && Date.now() - record.createdDate * 1000 < 120000) {
      return record.nonce + 1;
    }
    return AppState.provider.getTransactionCount(address);
  }
}

export default ModelTransaction;
