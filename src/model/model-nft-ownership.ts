/* eslint-disable no-await-in-loop */
import { Knex } from 'knex';
import { ModelMysqlBasic, IPagination, IResponse, IModelCondition, Transaction } from '@dkdao/framework';
import logger from '../helper/logger';
import { ETransferStatus, INftTransferDetail, ModelNftTransfer } from './model-nft-transfer';
import { INftResult } from './model-nft-result';
import config from '../helper/config';

const zeroAddress = '0x0000000000000000000000000000000000000000';

export interface INftOwnership {
  id: number;
  tokenId: number;
  owner: string;
  nftId: string;
  transactionHash: string;
  updatedDate: string;
  createdDate: string;
}

export interface INftOwnershipDetail extends INftOwnership {
  blockchainId: number;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
}

export class ModelNftOwnership extends ModelMysqlBasic<INftOwnership> {
  constructor() {
    super('ownership');
  }

  public basicQuery(): Knex.QueryBuilder {
    return this.getDefaultKnex().select('*');
  }

  public detailQuery() {
    return this.getKnex()(`${this.tableName} as n`)
      .select(
        'n.id as id',
        'tokenId',
        'owner',
        'nftId',
        'transactionHash',
        'n.updatedDate as updatedDate',
        'n.createdDate as createdDate',
        't.blockchainId as blockchainId',
        't.name as tokenName',
        't.symbol as tokenSymbol',
        't.address as tokenAddress',
      )
      .join(`token as t`, 'n.tokenId', 't.id');
  }

  public async getNftList(
    pagination: IPagination = { offset: 0, limit: 20, order: [] },
    conditions?: IModelCondition<INftOwnership>[],
  ): Promise<IResponse<INftOwnershipDetail>> {
    return this.getListByCondition<INftOwnershipDetail>(
      this.attachConditions(
        this.getKnex()(`${this.tableName} as n`)
          .select('owner', 'nftId', 'transactionHash', 't.name as tokenName', 't.address as tokenAddress')
          .join(`token as t`, 'n.tokenId', 't.id'),
        conditions,
      ),
      pagination,
    );
  }

  private static mappingBoxAndCard(nftTransfers: INftTransferDetail[]): Map<string, string> {
    // Mapping between burnt boxes and issued cards
    const transactionMap: {
      [key: string]: INftTransferDetail[];
    } = {};
    const transactionHashes: string[] = [];
    const issueMap = new Map<string, string>();
    for (let i = 0; i < nftTransfers.length; i += 1) {
      const nftTransfer = nftTransfers[i];
      if (nftTransfer.sender === zeroAddress && nftTransfer.tokenSymbol === 'DKC') {
        if (typeof transactionMap[`issue/${nftTransfer.transactionHash}`] === 'undefined') {
          transactionMap[`issue/${nftTransfer.transactionHash}`] = [];
        }
        transactionMap[`issue/${nftTransfer.transactionHash}`].push(nftTransfer);
      } else if (nftTransfer.receiver === zeroAddress && nftTransfer.tokenSymbol === 'DKI') {
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
          issueMap.set(cards[k].nftId, boxes[Math.floor(k / 5)].nftId);
        }
      } else {
        throw new Error(`Data mismatch between boxes and cards: ${transactionHash}`);
      }
    }
    return issueMap;
  }

  // Perform batch buy based on recorded event
  public async syncOwnership(): Promise<void> {
    const imNftTransfer = new ModelNftTransfer();
    const imNftIssuance = new ModelNftIssuance();
    let isBoxOpening = false;
    // We will get all transfer detail of the same transaction hash
    const nftTransfers = await imNftTransfer.getAllTransferDetail(ETransferStatus.NewNftTransfer);
    // We will end the process if event is undefined
    if (typeof nftTransfers === 'undefined' || nftTransfers.length === 0) {
      return;
    }

    logger.info(`Processing ${nftTransfers.length} card issuance events`);

    const currentTransactionHash = nftTransfers[0].transactionHash;
    const [currentIssuance] = await imNftIssuance.get([{ field: 'transactionHash', value: currentTransactionHash }]);

    try {
      isBoxOpening = typeof currentIssuance === 'undefined';
      // Matching burnt boxes and cards
      const boxAndCardMap = ModelNftOwnership.mappingBoxAndCard(nftTransfers);
      await Transaction.getInstance()
        .process(async (tx: Knex.Transaction) => {
          for (let i = 0; i < nftTransfers.length; i += 1) {
            const nftTransfer = nftTransfers[i];
            const record = <Partial<INftOwnership>>{
              tokenId: nftTransfer.tokenId,
              nftId: nftTransfer.nftId,
              transactionHash: nftTransfer.transactionHash,
              owner: nftTransfer.receiver,
            };

            const card = Card.from(nftTransfer.nftId);
            if (nftTransfer.sender === '0x0000000000000000000000000000000000000000') {
              // Only cards will be add to nft result
              if (nftTransfer.tokenSymbol === 'DKC') {
                const nftResult = await tx(config.table.nftResult).select('id').where({ nftId: nftTransfer.nftId });
                // Insert if not existed otherwise update
                if (nftResult.length === 0) {
                  await tx(config.table.nftResult).insert(<INftResult>{
                    ...record,
                    // We get nftId of box by using nfTokenId of card
                    nftBoxId: boxAndCardMap.get(nftTransfer.nftId),
                    applicationId: Number(card.getApplicationId()),
                    issuanceUuid: isBoxOpening ? '' : currentIssuance.issuanceUuid || '',
                    itemEdition: card.getEdition(),
                    itemGeneration: card.getGeneration(),
                    itemRareness: card.getRareness(),
                    itemType: card.getType(),
                    itemId: Number(card.getId()),
                    itemSerial: Number(card.getSerial()),
                  });
                } else {
                  logger.error('Card nftId', nftTransfer.nftId, 'was existed');
                }
              }
            }

            // If record didn't exist insert one otherwise update existing record
            const [ownership] = await tx(this.tableName).select('*').where({ nftId: nftTransfer.nftId });
            if (typeof ownership === 'undefined') {
              await tx(this.tableName).insert(record);
            } else {
              await tx(this.tableName)
                .update({ owner: nftTransfer.receiver, transactionHash: nftTransfer.transactionHash })
                .where({ id: ownership.id });
            }

            // Update issuance schedule status
            await tx(config.table.nftIssuance)
              .update({
                status: ENftIssuanceStatus.ResultArrived,
              })
              .where('transactionHash', currentTransactionHash);

            // Update status to succeed
            await tx(config.table.nftTransfer)
              .update({
                issuanceUuid: isBoxOpening ? '' : currentIssuance.issuanceUuid || '',
                status: ETransferStatus.Success,
              })
              .where({ id: nftTransfer.id });
          }
        })
        .catch(async (error: Error) => {
          await imNftTransfer
            .getDefaultKnex()
            .update({ status: ETransferStatus.Error })
            .where({ transactionHash: currentTransactionHash });
          logger.error('Can not sync nft ownership', error);
        })
        .exec();
    } catch (error) {
      logger.error('Can not sync box issuance data:', error);
      await imNftTransfer
        .getDefaultKnex()
        .update({ status: ETransferStatus.Error })
        .where({ transactionHash: currentTransactionHash });
    }
  }
}

export default ModelNftOwnership;
