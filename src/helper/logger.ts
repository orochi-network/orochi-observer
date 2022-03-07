import { LoggerLoader } from '@dkdao/framework';
import { AppConf } from './config';

export const AppLogger = new LoggerLoader('observer', 'debug', AppConf.nodeEnv === 'development' ? 'string' : 'json');
