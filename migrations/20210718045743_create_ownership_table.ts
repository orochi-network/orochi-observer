import { Knex } from 'knex';
import { addCreatedAndUpdated } from '../src/helper';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('ownership', (table: Knex.CreateTableBuilder) => {
    table.bigIncrements('id').unsigned().primary();

    table.bigInteger('tokenId').unsigned().index().references(`token.id`).comment('Foreign key to token.id');

    table.string('owner', 42).notNullable().index().comment('Owner of NFT token');

    table.string('nftId', 66).notNullable().unique().index().comment('Token id of NFT');

    table.string('transactionHash', 66).notNullable().index().comment('Transaction that affect ownership');

    addCreatedAndUpdated(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('ownership');
}
