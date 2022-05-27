import { Knex } from 'knex';
import { addCreatedAndUpdated } from '../src/helper';
import { ETransactionStatus } from '../src/model/model-transaction';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transaction', (table: Knex.CreateTableBuilder) => {
    table.bigIncrements('id').unsigned().primary();

    table.bigInteger('chainId').unsigned().comment('Chain ID of connected node');

    table
      .integer('status')
      .notNullable()
      .unsigned()
      .index()
      .defaultTo(ETransactionStatus.NewTransaction)
      .comment('Status of current transaction');

    table.string('transactionHash', 66).notNullable().index().comment('Transaction hash');

    table.string('from', 42).notNullable().index().comment('Sender');

    table.string('to', 42).notNullable().index().comment('Receiver');

    table.string('value', 66).notNullable().index().comment('Value of transaction');

    table.text('data', 'longtext').comment('Data of given transaction');

    table.bigInteger('nonce').unsigned().notNullable().index().comment('Nonce of current transaction');

    table.bigInteger('gasPrice').comment('Nonce of current transaction');

    table.bigInteger('gasLimit').comment('Nonce of current transaction');

    table.text('signedTransaction', 'longtext').comment('Signed transaction in hex form');

    addCreatedAndUpdated(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transaction');
}
