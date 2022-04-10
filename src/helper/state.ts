import { Singleton } from '@dkdao/framework';
import { Provider } from '@ethersproject/abstract-provider';
import { Knex } from 'knex';
import { QueueLoop } from 'noqueue';
import ModelSync from '../model/model-sync';
import { IToken } from '../model/model-token';

class State {
  private data = new Map<string, any>();

  private tokenData = new Map<string, IToken>();

  private syncData = new Map<number, ModelSync>();

  set targetBlock(value: number) {
    this.data.set('syncing-target-block', value);
  }

  get targetBlock(): number {
    return this.data.get('syncing-target-block');
  }

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

  get paddingTime(): number {
    return this.data.get('padding-time');
  }

  set paddingTime(value: number) {
    this.data.set('padding-time', value);
  }

  set token(value: IToken) {
    this.tokenData.set(value.address.toLowerCase(), value);
  }

  public hasToken(address: string) {
    return this.tokenData.has(address);
  }

  public getToken(address: string) {
    return this.tokenData.get(address.toLowerCase());
  }

  public setSync(tokenId: number, imSync: ModelSync) {
    return this.syncData.set(tokenId, imSync);
  }

  public getSync(tokenId: number) {
    return this.syncData.get(tokenId);
  }
}

export const AppState = Singleton<State>('app-state', State);

export default AppState;
