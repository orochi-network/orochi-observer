import { ConfigLoader, Singleton, Utilities, Validator } from '@dkdao/framework';

export interface IKeyValue {
  [key: string]: string | number | Date;
}

export interface IApplicationConfig {
  nodeEnv: string;
  mariadbConnectUrl: string;
  fullNodeRpc: string;
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
      name: 'fullNodeRpc',
      type: 'string',
      location: 'any',
      require: true,
      defaultValue: 'https://rpc.ftm.tools/',
      postProcess: (e) => e.trim(),
      validator: (e) => /^http(|s):\/\//i.test(e),
      message: 'This configuration should look like: mysql://user:password@localhost:port/database',
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
  ),
);

export const AppConf = <IApplicationConfig>configLoader.getConfig();
