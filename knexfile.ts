// Update with your config settings.
import { Connector } from '@dkdao/framework';
import { AppConf } from './src/helper';

module.exports = {
  development: Connector.parseURL(AppConf.mariadbConnectUrl),
};
