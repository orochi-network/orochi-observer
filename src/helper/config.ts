import { ConfigLoader, Singleton, Utilities, Validator } from '@dkdao/framework';

export interface IKeyValue {
  [key: string]: string | number | Date;
}

export interface IApplicationConfig {
  nodeEnv: string;
  mariadbConnectUrl: string;
  fullNodeRpc: string;
  mariadbPolygon?: string;
  mariadbFantom?: string;
  migratorPrivateKey: string;
  signerMnemonic: string;
  serviceBind: {
    protocol: string;
    hostname: string;
    port: number;
  };
}

const configLoader = Singleton<ConfigLoader>(
  'observer-config',
  ConfigLoader,
  `${Utilities.File.getRootFolder()}/.env`,
  new Validator(
    {
      name: 'nodeEnv',
      type: 'string',
      location: 'any',
      require: true,
      postProcess: (e) => e.trim(),
      enums: ['production', 'development', 'test', 'staging'],
    },
    {
      name: 'mariadbConnectUrl',
      type: 'string',
      location: 'any',
      require: true,
      postProcess: (e) => e.trim(),
      validator: (e) => /^mysql:\/\//i.test(e),
      message: 'This configuration should look like: mysql://user:password@localhost:port/database',
    },
    {
      name: 'mariadbPolygon',
      type: 'string',
      location: 'any',
      require: false,
      postProcess: (e) => e.trim(),
      validator: (e) => /^mysql:\/\//i.test(e),
      message: 'This configuration should look like: mysql://user:password@localhost:port/database',
    },
    {
      name: 'mariadbFantom',
      type: 'string',
      location: 'any',
      require: false,
      postProcess: (e) => e.trim(),
      validator: (e) => /^mysql:\/\//i.test(e),
      message: 'This configuration should look like: mysql://user:password@localhost:port/database',
    },
    {
      name: 'fullNodeRpc',
      type: 'string',
      location: 'any',
      require: true,
      defaultValue: 'https://rpc.ftm.tools/',
      postProcess: (e) => e.trim(),
      validator: (e) => /^http(|s):\/\//i.test(e),
      message: 'This configuration should look like: https://rpc.ftm.tools/',
    },
    {
      name: 'serviceBind',
      type: 'string',
      location: 'any',
      require: true,
      defaultValue: 'grpc://0.0.0.0:1337',
      postProcess: (e) => {
        const { protocol, hostname, port } = new URL(e.trim());
        return { protocol, hostname, port: parseInt(port, 10) };
      },
    },
    {
      name: 'migratorPrivateKey',
      type: 'string',
      location: 'any',
      defaultValue: '',
      postProcess: (e) => e.trim(),
      validator: (e) => /^0x[0-9a-f]+$/i.test(e),
      message: 'Private key should be in hex string with 0x prefix',
    },
    {
      name: 'signerMnemonic',
      type: 'string',
      location: 'any',
      postProcess: (e) => e.trim(),
      validator: (e) => /^[a-z\s]+$/i.test(e),
      message: 'It should be normal words and space only',
    },
  ),
);

export const AppConf = <IApplicationConfig>configLoader.getConfig();
