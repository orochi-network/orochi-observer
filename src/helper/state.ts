import { Singleton } from '@dkdao/framework';
import { Provider } from '@ethersproject/abstract-provider';
import { BigNumber, ContractInterface, ethers, Wallet } from 'ethers';
import { Knex } from 'knex';
import { QueueLoop } from 'noqueue';
import { DuelistKingDistributor, OracleProxy } from '../../abi/types';
import ModelSync from '../model/model-sync';
import { IToken } from '../model/model-token';
import { AppConf } from './config';
import { safeConfirmation } from './sync';
import abiDistributor from '../../abi/json/distributor.json';
import abiOracleProxy from '../../abi/json/oracle-proxy.json';

export interface INetworkConfig {
  migration: string;
  distributor: string;
  migratorProxy: string;
  distributorContract: DuelistKingDistributor;
  migratorProxyContract: OracleProxy;
}

class State {
  private data = new Map<string, any>();

  private tokenData = new Map<string, IToken>();

  private syncData = new Map<number, ModelSync>();

  public walletSignerMap = new Map<string, Wallet>();

  public walletMigrator: Wallet = <Wallet>{};

  public walletSigners: Wallet[] = [];

  public constantNetwork = new Map<number, Partial<INetworkConfig>>([
    [
      56,
      {
        distributor: '0x57cB34Ac43Aa5b232e46c8b7DFcFe488c80D7259',
        migratorProxy: '0x3AFe5b5085d08F168741B4C7Fe9B3a58F7FDB1d0',
      },
    ],
    [
      250,
      {
        migration: '0x712A8DeF765dE7B4566604B02b4B81996c4849F7',
      },
    ],
    [
      137,
      {
        migration: '0x712A8DeF765dE7B4566604B02b4B81996c4849F7',
      },
    ],
    [
      4002,
      {
        migration: '0xE0bcbE5F743D59cA0ffE91C351F5E63295295060',
        distributor: '0xa5Db01CD26Ebd73bf149ffd8b083270f341bC2Fe',
        migratorProxy: '0xb7b54Ce1f9D83375D3EB55C8f72900450D0c7Bf3',
      },
    ],
  ]);

  public async init() {
    this.queue = new QueueLoop();
    this.provider = new ethers.providers.StaticJsonRpcProvider(AppConf.fullNodeRpc);
    this.targetBlock = (await this.provider.getBlockNumber()) - safeConfirmation;
    this.chainId = (await this.provider.getNetwork()).chainId;
    if (AppConf.migratorPrivateKey) {
      this.walletMigrator = new ethers.Wallet(AppConf.migratorPrivateKey, this.provider);
    }

    const networkCfg = this.constantNetwork.get(this.chainId);
    if (networkCfg) {
      if (networkCfg.distributor) {
        networkCfg.distributorContract = <DuelistKingDistributor>(
          this.attachContract(networkCfg.distributor, abiDistributor)
        );
      }
      if (networkCfg.migratorProxy) {
        networkCfg.migratorProxyContract = <OracleProxy>this.attachContract(networkCfg.migratorProxy, abiOracleProxy);
      }
    }

    let i = 0;
    let balance = BigNumber.from(0);
    if (AppConf.signerMnemonic) {
      do {
        const wallet = ethers.Wallet.fromMnemonic(AppConf.signerMnemonic, `m/44'/60'/0'/0/${i}`).connect(this.provider);
        // eslint-disable-next-line no-await-in-loop
        balance = await wallet.getBalance();
        if (balance.gt(0)) {
          this.walletSignerMap.set(wallet.address.toLowerCase(), wallet);
          this.walletSigners.push(wallet);
        }
        i += 1;
      } while (balance.gt(0));
    }
  }

  // Properties

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

  // Not properties
  public getSignerWallet(address: string): Wallet | undefined {
    return this.walletSignerMap.get(address.toLowerCase());
  }

  public getRandomSignerWallet(): Wallet {
    const i = Math.round(Math.random() * (this.walletSigners.length - 1));
    return this.walletSigners[i];
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

  // Private
  private attachContract(address: string, abi: ContractInterface) {
    return new ethers.Contract(address, abi, this.provider);
  }
}

export const AppState = Singleton<State>('app-state', State);

export default AppState;
