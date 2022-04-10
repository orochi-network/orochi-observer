import AppLogger from './logger';
import AppState from './state';

export function adjustPaddingTime(paddingTime: number) {
  if (paddingTime !== AppState.paddingTime) {
    AppState.queue.setPaddingTime(paddingTime);
    AppState.paddingTime = paddingTime;
    AppLogger.info('Adjust padding time to:', paddingTime, 'ms');
  }
}

export default adjustPaddingTime;
