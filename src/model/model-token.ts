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
  syncId: number;
  type: EToken;
  name: string;
  address: string;
  symbol: string;
  decimal: number;
  createdDate: string;
  updatedDate: string;
}

export class ModelToken extends ModelMysqlBasic<IToken> {
  constructor() {
    super('token');
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }

  public getAllToken(chainId?: number) {
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
}

export default ModelToken;
