import { Knex } from 'knex';
import { addCreatedAndUpdated } from '../src/helper/table';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('sync', (table: Knex.CreateTableBuilder) => {
    table.bigIncrements('id').unsigned().primary();

    table.bigInteger('chainId').unsigned().index().comment('Chain ID of connected node');

    table.bigInteger('startBlock').unsigned().notNullable().comment('Start of syncing');

    table.bigInteger('syncedBlock').unsigned().notNullable().comment('Synced blocks');

    table.bigInteger('targetBlock').unsigned().notNullable().comment('Target of syncing');

    addCreatedAndUpdated(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('sync');
}
