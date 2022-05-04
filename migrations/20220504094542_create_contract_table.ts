import { Knex } from 'knex';
import { addCreatedAndUpdated } from '../src/helper';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('contract', (table: Knex.CreateTableBuilder) => {
    table.bigIncrements('id').unsigned().primary();

    table.bigInteger('chainId').unsigned().comment('Chain ID of connected node');

    table.bigInteger('syncId').unsigned().index().unique().comment('Sync ID of this smart contract');

    table.string('name', 32).notNullable().comment('Smart contract name');

    table.string('address', 42).notNullable().comment('Smart contract address');

    addCreatedAndUpdated(knex, table);

    table.index(['chainId', 'name', 'address'], 'common_indexed');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('contract');
}
