import { Knex } from 'knex';
import { addCreatedAndUpdated } from '../src/helper';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('purchase_history', (table: Knex.CreateTableBuilder) => {
    table.bigIncrements('id').unsigned().primary();

    table.bigInteger('chainId').unsigned().comment('Chain ID of connected node');

    table.string('buyerAddress', 42).notNullable().index().comment('Buyer wallet address');

    table.bigInteger('numberOfBoxes').unsigned().notNullable().index().comment('Number of boxes');

    table.bigInteger('phaseId').unsigned().index().comment('Phase of boxes');

    table.string('discountCode').index().comment('Discount code');

    table.string('transactionHash', 66).notNullable().index().comment('Transaction hash');

    addCreatedAndUpdated(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('purchase_history');
}
