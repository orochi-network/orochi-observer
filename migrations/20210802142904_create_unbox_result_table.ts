import { Knex } from 'knex';
import { addCreatedAndUpdated } from '../src/helper';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('unbox_result', (table: Knex.CreateTableBuilder) => {
    table.bigIncrements('id').unsigned().primary();

    table.bigInteger('tokenId').unsigned().index().references(`token.id`).comment('Foreign key to token.id');

    table.string('owner', 42).notNullable().index().comment('Owner of NFT token');

    table.string('nftId', 66).notNullable().unique().index().comment('Token id of NFT');

    table.string('nftBoxId', 66).index().comment('Token id of NFT box');

    table.bigInteger('itemApplication').notNullable().index().comment('Application Id of the item');

    table.integer('itemEdition').notNullable().index().comment('Edition of the item');

    table.integer('itemGeneration').notNullable().index().comment('Generation of the item');

    table.integer('itemRareness').notNullable().index().comment('Rareness of the item');

    table.integer('itemType').notNullable().index().comment('Type of the item');

    table.bigInteger('itemId').notNullable().index().comment('Id  of the item');

    table.bigInteger('itemSerial').notNullable().index().comment('Serial of the item');

    table.string('transactionHash', 66).notNullable().index().comment('Transaction of the issuance');

    addCreatedAndUpdated(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('unbox_result');
}
