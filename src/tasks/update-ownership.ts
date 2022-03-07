import { AppLogger } from '../helper';
import ModelTransfer from '../model/model-transfer';

export const updateOwnership = async () => {
  const imModelTransfer = new ModelTransfer();
  const transactions = await imModelTransfer.getNewArriveTransaction();
  if (transactions.length > 0) {
    AppLogger.info(`Processing ${transactions.length} events`);
  }
};

export default updateOwnership;
