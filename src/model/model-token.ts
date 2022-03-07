import { Knex } from 'knex';
import { ModelMysqlBasic } from '@dkdao/framework';

export enum EToken {
  DePayRouter = 0,
  ERC20 = 20,
  ERC721 = 721,
}

export interface IToken {
  id: number;
  chainId: number;
  type: EToken;
  name: string;
  address: string;
  symbol: string;
  decimal: number;
  createdDate: string;
}

export class ModelToken extends ModelMysqlBasic<IToken> {
  constructor() {
    super('token');
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }

  public getNft(chainId?: number) {
    if (typeof chainId !== 'undefined' && Number.isInteger(chainId)) {
      return this.get([
        {
          field: 'type',
          value: EToken.ERC721,
        },
        {
          field: 'chainId',
          value: chainId,
        },
      ]);
    }
    return this.get([
      {
        field: 'type',
        value: EToken.ERC721,
      },
    ]);
  }

  public getToken() {
    return this.get([
      {
        field: 'type',
        value: EToken.ERC20,
      },
    ]);
  }

  public getPayable(chainId?: number) {
    const query = this.basicQuery().whereIn('type', [EToken.DePayRouter, EToken.ERC20]);
    if (typeof chainId === 'number') {
      query.where({ chainId });
    }
    return query;
  }
}

export default ModelToken;
