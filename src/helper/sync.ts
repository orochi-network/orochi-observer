import { utils } from 'ethers';

export const eventEncoder = new utils.Interface([
  'event Purchase(address indexed owner, uint256 indexed phaseId, uint256 indexed numberOfBoxes, bytes32 code)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed value)',
]);

export const numberOfBlockToBeFastSync = 1999;

export const safeConfirmation = 20;

export const slowSyncTime = 5000;

export const fastSyncTime = 100;

export const numberOfBlockToSync = 100;

export const syncLimit = Math.floor(numberOfBlockToBeFastSync / numberOfBlockToSync);

export const rpcRetries = 10;

export const rpcRetryTimeout = 5000;

export const eventTransfer = eventEncoder.getEventTopic('Transfer');

export const eventPurchase = eventEncoder.getEventTopic('Purchase');

export interface IPayload {
  fromBlock: number;
  toBlock: number;
  topics: string[];
  address: string;
}

export interface ISyncingSchedule {
  fromBlock: number;
  toBlock: number;
  payload: IPayload[];
}

export function calculateSyncingSchedule(
  fBlock: number,
  tBlock: number,
  address: string,
  topics: string[] = [eventTransfer],
): ISyncingSchedule {
  const payload: IPayload[] = [];
  const diff = tBlock - fBlock;
  if (diff <= 1) return { fromBlock: fBlock, toBlock: tBlock, payload };
  let syncTimes = Math.floor(diff / numberOfBlockToSync);
  if (syncTimes >= syncLimit) {
    syncTimes = syncLimit;
  }
  const carry = diff % numberOfBlockToSync;
  let syncingBlock = fBlock;
  const fromBlock = fBlock + 1;
  for (let i = 0; i < syncTimes; i += 1) {
    syncingBlock = fBlock + (i + 1) * numberOfBlockToSync;
    payload.push({
      fromBlock: fBlock + i * numberOfBlockToSync + 1,
      toBlock: syncingBlock,
      topics,
      address,
    });
  }
  if (carry > 1) {
    payload.push({
      fromBlock: syncingBlock + 1,
      toBlock: syncingBlock + carry,
      topics,
      address,
    });
    syncingBlock += +carry;
  }
  return { fromBlock, toBlock: syncingBlock, payload };
}

export default { eventEncoder };
