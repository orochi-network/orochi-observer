/* eslint-disable no-await-in-loop */
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { utils } from 'ethers';
import { TillSuccess } from 'noqueue';
import { AppLogger, AppState, craftProof, INetworkConfig, uint256ArrayToBytes } from '../helper';
import ModelMigration, { EMigrationStatus } from '../model/model-migration';
import ModelTransaction, { ETransactionStatus, ITransaction } from '../model/model-transaction';
import { ETransferStatus } from '../model/model-transfer';

const safeConfirmation = 2;

export const migrateNft = async (instanceName: 'polygon' | 'fantom', cfg: Partial<INetworkConfig>) => {
  const imMigration = new ModelMigration(instanceName);
  const { provider, walletMigrator, chainId } = AppState;
  const imTransaction = new ModelTransaction(instanceName);
  const migrations = await imMigration.find({ status: EMigrationStatus.NewMigration });

  // Are there any records need to be migrated?
  if (migrations.length > 0) {
    const [{ originalContractAddress, owner }] = migrations;
    //
    const token = AppState.getToken(originalContractAddress);
    const wallet = AppState.getRandomSignerWallet();

    if (typeof token === 'undefined') {
      AppLogger.error(`Token ${originalContractAddress} not found in database`);
      return;
    }
    const isBox = token.symbol === 'DKI';
    const migratingList = migrations.filter((e) => e.owner === owner);
    const migratingNftTokenId = migratingList.map((e) => e.nftTokenId);
    const migratingIds = migratingList.map((e) => e.id);
    AppLogger.info(`Processing ${migratingList.length} record for ${owner} (${instanceName})`);
    if (cfg.distributorContract && cfg.migratorProxyContract) {
      const from = wallet.address;
      const to = cfg.migratorProxyContract.address;
      const value = '0x00';
      const nonce = await imTransaction.getNonce(from);
      const migrateData = cfg.distributorContract.interface.encodeFunctionData('batchMigrate', [
        owner,
        true,
        isBox,
        uint256ArrayToBytes(migratingNftTokenId),
      ]);

      const proof = await craftProof(walletMigrator, cfg.migratorProxyContract);

      const data = cfg.migratorProxyContract.interface.encodeFunctionData('safeCall', [
        proof,
        cfg.distributorContract.address,
        0,
        migrateData,
      ]);

      const currentGas = await provider.getGasPrice();
      // We will pay 30% more for current gas price, gas price is in Gwei
      const gasPrice = currentGas.add(currentGas.div(3));

      // Insert migrating transaction to database
      const newTransactionRecord = <Partial<ITransaction>>{
        from,
        to,
        chainId,
        data,
        value,
        nonce,
        transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        status: ETransactionStatus.NewTransaction,
      };
      const record = await imTransaction.create(newTransactionRecord);
      await imMigration.updateStatus(EMigrationStatus.Processing, migratingIds);

      if (typeof record === 'undefined') {
        throw new Error('Unable to create new migrating transaction record');
      }

      try {
        const estimatedGasLimit = await provider.estimateGas({
          from,
          to,
          chainId,
          data,
          value,
        });
        // Our gas limit will add up to 30% estimated gas
        const gasLimit = estimatedGasLimit.add(estimatedGasLimit.div(3));

        const signedTransaction = await wallet.signTransaction({
          to: cfg.migratorProxyContract.address,
          gasLimit,
          gasPrice,
          nonce,
          value,
          chainId,
          data,
        });
        const transactionHash = utils.keccak256(signedTransaction);

        await imTransaction.update(
          {
            gasPrice: gasPrice.div('1000000000').toNumber(),
            gasLimit: gasLimit.toNumber(),
            transactionHash,
            signedTransaction,
            status: <any>ETransferStatus.Processing,
          },
          [
            {
              field: 'id',
              value: record.id,
            },
          ],
        );

        await (
          await TillSuccess<TransactionResponse>(async () => provider.sendTransaction(signedTransaction))
        ).wait(safeConfirmation);

        await imTransaction.update(
          {
            status: <any>ETransferStatus.Success,
          },
          [
            {
              field: 'id',
              value: record.id,
            },
          ],
        );
        await imMigration.updateStatus(EMigrationStatus.Success, migratingIds);
      } catch (err) {
        await imTransaction.update(
          {
            status: <any>ETransferStatus.Error,
          },
          [
            {
              field: 'id',
              value: record.id,
            },
          ],
        );
        await imMigration.updateStatus(EMigrationStatus.Error, migratingIds);
        AppLogger.error(err);
      }
    } else {
      AppLogger.crit(`This blockchain ${chainId} do not support migration`);
    }
  }
};

export default migrateNft;
