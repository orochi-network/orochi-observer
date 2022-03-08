import { Knex } from 'knex';
import { addCreatedAndUpdated } from '../src/helper';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transfer', (table: Knex.CreateTableBuilder) => {
    table.bigIncrements('id').unsigned().primary();

    table.bigInteger('chainId').unsigned().comment('Chain ID of connected node');

    table.bigInteger('tokenId').unsigned().references(`token.id`).comment('Foreign key to token.id');

    table.integer('status').notNullable().defaultTo(0).comment('Status of the processing of nft transfer');

    table.string('eventId', 66).unique().index().comment('Unique event Id, for tracking');

    table.string('from', 42).notNullable().index().comment('Sender');

    table.string('to', 42).notNullable().index().comment('Receiver');

    table.string('value', 66).notNullable().index().comment('Id of NFT token');

    table.bigInteger('blockNumber').unsigned().index().comment('Block number of nft transfer');

    table.string('transactionHash', 66).notNullable().index().comment('Transaction hash');

    addCreatedAndUpdated(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transfer');
}
