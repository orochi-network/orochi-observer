import { AppLogger, AppState, Card, zeroAddress } from '../helper';
import ModelTransfer, { ETransferStatus, ITransferDetail } from '../model/model-transfer';

const mapBoxAndCard = (nftTransfers: ITransferDetail[]) => {
  const cardIssuance: ITransferDetail[] = [];
  const nftIssuance: ITransferDetail[] = [];
  const changeOfOwnerShip = [];
  for (let i = 0; i < nftTransfers.length; i += 1) {
    const nftTransfer = nftTransfers[i];
    if (nftTransfer.from !== zeroAddress) {
      changeOfOwnerShip.push({
        update: { owner: nftTransfer.to },
        where: { nftId: nftTransfer.value },
      });
    }
    // Card issuance
    if (nftTransfer.from === zeroAddress && nftTransfer.tokenSymbol === 'DKDAOI') {
      cardIssuance.push(nftTransfer);
      // Card issuance is also NFT issuance
      nftIssuance.push(nftTransfer);
    }
  }
  return { cardIssuance, nftIssuance, changeOfOwnerShip };
};

export const updateOwnershipLegacy = async () => {
  const { knex } = AppState;
  const imModelTransfer = new ModelTransfer();
  let startTime = 0;
  const transactions = await imModelTransfer.getNewArriveTransaction();
  if (transactions.transfer.length > 0) {
    AppLogger.info(`Processing ${transactions.transfer.length} events`);
    const { cardIssuance, nftIssuance, changeOfOwnerShip } = mapBoxAndCard(transactions.transfer);
    const nftIssuanceRecords = nftIssuance.map((e: ITransferDetail) => {
      return {
        tokenId: e.tokenId,
        owner: e.to,
        nftId: e.value,
        transactionHash: e.transactionHash,
      };
    });
    const cardIssuanceRecords = cardIssuance.map((e: ITransferDetail) => {
      const card = Card.from(e.value);
      return {
        tokenId: e.tokenId,
        owner: e.to,
        nftId: e.value,
        nftBoxId: '',
        itemApplication: 1,
        itemEdition: card.getEdition(),
        itemGeneration: card.getGeneration(),
        itemRareness: card.getRareness(),
        itemType: card.getType(),
        itemId: card.getId(),
        itemSerial: card.getSerial(),
        transactionHash: e.transactionHash,
      };
    });

    try {
      if (nftIssuanceRecords.length > 0) {
        startTime = Date.now();
        await knex.raw(
          knex('ownership')
            .insert(nftIssuanceRecords)
            .toString()
            .replace(/insert/i, 'insert ignore'),
        );
        AppLogger.info(
          `Processed nft issuance records ${nftIssuanceRecords.length}, cost: ${Date.now() - startTime}ms`,
        );
      }
      if (cardIssuanceRecords.length > 0) {
        startTime = Date.now();
        await knex.raw(
          knex('unbox_result')
            .insert(cardIssuanceRecords)
            .toString()
            .replace(/insert/i, 'insert ignore'),
        );
        AppLogger.info(
          `Processed card issuance records ${cardIssuanceRecords.length}, cost: ${Date.now() - startTime}ms`,
        );
      }

      if (changeOfOwnerShip.length > 0) {
        startTime = Date.now();
        for (let i = 0; i < changeOfOwnerShip.length; i += 1) {
          const { update, where } = changeOfOwnerShip[i];
          // eslint-disable-next-line no-await-in-loop
          await knex('ownership').update(update).where(where);
        }
        AppLogger.info(
          `Processed change ownership records ${changeOfOwnerShip.length}, cost: ${Date.now() - startTime}ms`,
        );
      }
      await imModelTransfer.update({ status: ETransferStatus.Success }, [
        {
          field: 'transactionHash',
          value: transactions.transactionHash,
        },
      ]);
    } catch (error) {
      AppLogger.error('Can update ownership and issuance', error);
      await imModelTransfer.update({ status: ETransferStatus.Error }, [
        {
          field: 'transactionHash',
          value: transactions.transactionHash,
        },
      ]);
    }
  }
};

export default updateOwnershipLegacy;
