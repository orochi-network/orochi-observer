import { AppLogger, AppState, Card, zeroAddress } from '../helper';
import adjustPaddingTime from '../helper/queue';
import ModelTransfer, { ETransferStatus, ITransferDetail } from '../model/model-transfer';
import { fastSyncTime, slowSyncTime } from './event-sync';

const mapBoxAndCard = (nftTransfers: ITransferDetail[]) => {
  // Mapping between burnt boxes and issued cards
  const transactionMap: {
    [key: string]: ITransferDetail[];
  } = {};
  const transactionHashes: string[] = [];
  const cardMap = new Map<string, string>();
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
    if (nftTransfer.from === zeroAddress && nftTransfer.tokenSymbol === 'DKC') {
      if (typeof transactionMap[`issue/${nftTransfer.transactionHash}`] === 'undefined') {
        transactionMap[`issue/${nftTransfer.transactionHash}`] = [];
      }
      transactionMap[`issue/${nftTransfer.transactionHash}`].push(nftTransfer);
      cardIssuance.push(nftTransfer);
      // Card issuance is also NFT issuance
      nftIssuance.push(nftTransfer);
    } else if (nftTransfer.from === zeroAddress && nftTransfer.tokenSymbol === 'DKI') {
      // Box issuance is also NFT issuance
      nftIssuance.push(nftTransfer);
    } else if (nftTransfer.to === zeroAddress && nftTransfer.tokenSymbol === 'DKI') {
      if (typeof transactionMap[`burn/${nftTransfer.transactionHash}`] === 'undefined') {
        transactionMap[`burn/${nftTransfer.transactionHash}`] = [];
      }
      transactionMap[`burn/${nftTransfer.transactionHash}`].push(nftTransfer);
      // If there are a burn transaction add the transaction hash to list
      if (!transactionHashes.includes(nftTransfer.transactionHash)) {
        transactionHashes.push(nftTransfer.transactionHash);
      }
    }
  }
  for (let j = 0; j < transactionHashes.length; j += 1) {
    const transactionHash = transactionHashes[j];
    const cards = transactionMap[`issue/${transactionHash}`];
    const boxes = transactionMap[`burn/${transactionHash}`];
    // Each box got 5 cards
    if (cards.length === boxes.length * 5) {
      for (let k = 0; k < cards.length; k += 1) {
        // Map card to box
        cardMap.set(cards[k].value, boxes[Math.floor(k / 5)].value);
      }
    } else {
      throw new Error(`Data mismatch between boxes and cards: ${transactionHash}`);
    }
  }
  return { cardMap, cardIssuance, nftIssuance, changeOfOwnerShip };
};

export const updateOwnership = async () => {
  const { knex } = AppState;
  const imModelTransfer = new ModelTransfer();
  let startTime = Date.now();
  const transactions = await imModelTransfer.getNewArriveTransaction();
  if (transactions.transfer.length > 0) {
    adjustPaddingTime(fastSyncTime);
    AppLogger.info(`Processing ${transactions.transfer.length} events`);
    const { cardMap, cardIssuance, nftIssuance, changeOfOwnerShip } = mapBoxAndCard(transactions.transfer);
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
        nftBoxId: cardMap.get(e.value) || '',
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
    AppLogger.info(`Mapping: ${cardMap.size} issuances, cost: ${Date.now() - startTime}ms`);

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
  } else {
    adjustPaddingTime(slowSyncTime);
  }
};

export default updateOwnership;
