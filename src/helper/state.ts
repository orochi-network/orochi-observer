import { Singleton } from '@dkdao/framework';
import { Provider } from '@ethersproject/abstract-provider';
import { Knex } from 'knex';
import { QueueLoop } from 'noqueue';
import ModelSync from '../model/model-sync';
import { IToken } from '../model/model-token';

class State {
  private data = new Map<string, any>();

  private tokenData = new Map<string, IToken>();

  set provider(value: Provider) {
    this.data.set('full-node-rpc-provider', value);
  }

  get provider(): Provider {
    return this.data.get('full-node-rpc-provider');
  }

  set chainId(value: number) {
    this.data.set('network-chain-id', value);
  }

  get chainId(): number {
    return this.data.get('network-chain-id');
  }

  set syncing(value: ModelSync) {
    this.data.set('network-syncing', value);
  }

  get syncing(): ModelSync {
    return this.data.get('network-syncing');
  }

  set queue(value: QueueLoop) {
    this.data.set('application-loop', value);
  }

  get queue(): QueueLoop {
    return this.data.get('application-loop');
  }

  set knex(value: Knex) {
    this.data.set('knex-instance', value);
  }

  get knex(): Knex {
    return this.data.get('knex-instance');
  }

  set token(value: IToken) {
    this.tokenData.set(value.address.toLowerCase(), value);
  }

  public hasToken(address: string) {
    return this.tokenData.has(address);
  }

  public getToken(address: string): IToken {
    return this.tokenData.get(address.toLowerCase()) || <IToken>{};
  }
}

export const AppState = Singleton<State>('app-state', State);

export default AppState;
