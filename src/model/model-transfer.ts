import { Knex } from 'knex';
import { ModelMysqlBasic } from '@dkdao/framework';
import { AppState } from '../helper';

export enum ETransferStatus {
  NewTransfer = 0,
  Processing = 1,
  Success = 254,
  Error = 255,
}

export interface ITransfer {
  id: number;
  chainId: number;
  tokenId: number;
  status: number;
  eventId: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  transactionHash: string;
  createdDate: string;
  updatedDate: string;
}

export interface ITransferDetail extends ITransfer {
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: number;
  tokenAddress: string;
}

export class ModelTransfer extends ModelMysqlBasic<ITransfer> {
  constructor() {
    super('transfer');
  }

  public async getMinSyncedBlock(): Promise<Number> {
    const knex = this.getKnex();
    const result = await knex('token as t')
      .select(knex.raw('MIN(`s`.`syncedBlock`) AS `syncedBlock`'))
      .join('sync as s', 't.syncId', `s.id`)
      .whereIn('t.symbol', ['DKI', 'DKC'])
      .first();
    if (typeof result === 'undefined' || result === null) {
      return AppState.targetBlock;
    }
    return result.syncedBlock;
  }

  public async getNewArriveTransaction(): Promise<{ transactionHash: string; transfer: ITransferDetail[] }> {
    const ret = await this.getDefaultKnex()
      .select('transactionHash')
      .where({ status: ETransferStatus.NewTransfer })
      .where('blockNumber', '<', await this.getMinSyncedBlock())
      .orderBy('id', 'asc')
      .limit(1)
      .first();
    if (typeof ret !== 'undefined') {
      const { transactionHash } = ret;
      const transfer = await this.getDetailQuery().where({ transactionHash });
      await this.getDefaultKnex().update({ status: ETransferStatus.Processing }).where({
        transactionHash,
      });
      return { transactionHash, transfer };
    }
    return { transactionHash: '', transfer: [] };
  }

  public async getNewArriveTransactionLegacy(): Promise<{ transactionHash: string; transfer: ITransferDetail[] }> {
    const ret = await this.getDefaultKnex()
      .select('transactionHash')
      .where({ status: ETransferStatus.NewTransfer })
      .orderBy('id', 'asc')
      .limit(1)
      .first();
    if (typeof ret !== 'undefined') {
      const { transactionHash } = ret;
      const transfer = await this.getDetailQuery().where({ transactionHash });
      await this.getDefaultKnex().update({ status: ETransferStatus.Processing }).where({
        transactionHash,
      });
      return { transactionHash, transfer };
    }
    return { transactionHash: '', transfer: [] };
  }

  public getDetailQuery() {
    return this.getKnex()(`${this.tableName} as e`)
      .select(
        'e.id as id',
        'e.chainId as chainId',
        'e.tokenId as tokenId',
        'status',
        'eventId',
        'from',
        'to',
        'value',
        'blockNumber',
        'transactionHash',
        'e.createdDate as createdDate',
        'e.updatedDate as updatedDate',
        't.decimal as tokenDecimal',
        't.name as tokenName',
        't.symbol as tokenSymbol',
        't.address as tokenAddress',
      )
      .join(`token as t`, 'e.tokenId', 't.id');
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }
}

export default ModelTransfer;
