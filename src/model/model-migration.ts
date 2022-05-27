import { Knex } from 'knex';
import { ModelMysqlBasic } from '@dkdao/framework';
import { AppState } from '../helper';
import { ITransfer } from './model-transfer';

export enum EMigrationStatus {
  NewMigration = 0,
  Processing = 1,
  Success = 254,
  Error = 255,
}

export interface IMigration {
  id: number;
  originalContractAddress: string;
  fromChainId: number;
  toChainId: number;
  owner: string;
  nftTokenId: string;
  status: number;
  createdDate: string;
  updatedDate: string;
}

interface ITransferDetail extends ITransfer {
  tokenAddress: string;
}

export class ModelMigration extends ModelMysqlBasic<IMigration> {
  constructor(instanceName?: string) {
    super('migration', instanceName);
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }

  public async find(records: Partial<IMigration>, limit: number = 50): Promise<IMigration[]> {
    return this.basicQuery().where(records).limit(limit).orderBy('owner');
  }

  public async updateStatus(status: EMigrationStatus, ids: number[]) {
    return this.getDefaultKnex().update({ status }).whereIn('id', ids);
  }

  public async syncingMigration(): Promise<number> {
    const knex = this.getKnex();
    const { chainId } = AppState;
    const networkCfg = AppState.constantNetwork.get(chainId);
    if (networkCfg && networkCfg.migration) {
      // @todo: Check the case when we bridge token around
      const [records] = <[ITransferDetail[]]>(
        await knex.raw(
          'SELECT	`t`.`id`,	`t`.`chainId`,	`t`.`status`,	`t`.`eventId`,	`t`.`from`,	`t`.`to`,	`t`.`value`,' +
            ' `t`.`blockNumber`,	`t`.`transactionHash`,	`t`.`createdDate`, `a`.`address` AS `tokenAddress`' +
            ' FROM	`transfer` AS `t` JOIN `token` AS `a` ON	`a`.`id` = `t`.`tokenId`' +
            ' LEFT JOIN migration AS `m` ON	`t`.`value` = `m`.`nftTokenId`WHERE	`t`.`to` =?	AND ISNULL(`m`.`id`) ',
          networkCfg.migration.toLowerCase(),
        )
      );

      if (records.length > 0) {
        // @todo remove hard code chainId
        await knex.batchInsert(
          'migration',
          records.map((e) => {
            return <Partial<IMigration>>{
              originalContractAddress: e.tokenAddress.toLowerCase(),
              fromChainId: chainId,
              toChainId: 56, // @todo: Change the hardcode
              owner: e.from,
              nftTokenId: e.value,
              status: EMigrationStatus.NewMigration,
              // Created date of Migration will
              createdDate: e.createdDate,
            };
          }),
        );
      }
      return records.length;
    }
    return 0;
  }
}

export default ModelMigration;
