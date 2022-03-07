import { Singleton } from '@dkdao/framework';
import { EventEmitter } from 'stream';

export const AppEvent = Singleton<EventEmitter>('app-event', EventEmitter);
