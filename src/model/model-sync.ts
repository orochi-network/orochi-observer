import { Knex } from 'knex';
import { ModelMysqlBasic } from '@dkdao/framework';

export interface ISync {
  id: number;
  chainId: number;
  startBlock: number;
  syncedBlock: number;
  targetBlock: number;
  updatedDate: string;
  createdDate: string;
}

export class ModelSync extends ModelMysqlBasic<ISync> {
  private currentStatus: ISync = <ISync>{};

  private changed = false;

  constructor() {
    super('sync');
  }

  set chainId(value: number) {
    this.changed = true;
    this.currentStatus.chainId = value;
  }

  get chainId(): number {
    return this.currentStatus.chainId;
  }

  set startBlock(value: number) {
    this.changed = true;
    this.currentStatus.startBlock = value;
  }

  get startBlock(): number {
    return this.currentStatus.startBlock;
  }

  set syncedBlock(value: number) {
    this.changed = true;
    this.currentStatus.syncedBlock = value;
  }

  get syncedBlock(): number {
    return this.currentStatus.syncedBlock;
  }

  set targetBlock(value: number) {
    this.changed = true;
    this.currentStatus.targetBlock = value;
  }

  get targetBlock(): number {
    return this.currentStatus.targetBlock;
  }

  public async init() {
    const { startBlock, syncedBlock, targetBlock, chainId } = this.currentStatus;
    const result = await this.create({ startBlock, syncedBlock, targetBlock, chainId });
    if (typeof result !== 'undefined') {
      this.currentStatus = result;
      this.changed = false;
      return;
    }
    throw new Error('Can not init syncing data');
  }

  public async load(tokenId: number) {
    this.currentStatus = <ISync>await this.joinTokenQuery().where({ 't.id': tokenId }).first();
    if (typeof this.currentStatus === 'undefined') {
      throw new Error('Can not load sync status from database');
    }
  }

  public async save() {
    if (this.changed) {
      const { id, startBlock, syncedBlock, targetBlock } = this.currentStatus;
      await this.getDefaultKnex().update({ startBlock, syncedBlock, targetBlock }).where({ id });
      this.changed = false;
    }
  }

  public joinTokenQuery(): Knex.QueryBuilder {
    return this.getKnex()('sync as s')
      .select(
        's.id as id',
        's.chainId as chainId',
        's.startBlock as startBlock',
        's.syncedBlock as syncedBlock',
        's.targetBlock as targetBlock',
        's.updatedDate as updatedDate',
        's.createdDate as createdDate',
      )
      .join('token as t', 't.syncId', 's.id');
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }
}

export default ModelSync;
