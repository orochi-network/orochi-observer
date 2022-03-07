import { Knex } from 'knex';
import { addCreatedAndUpdated } from '../src/helper';
import { EToken } from '../src/model/model-token';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('token', (table: Knex.CreateTableBuilder) => {
    table.bigIncrements('id').unsigned().primary();

    table.bigInteger('chainId').unsigned().comment('Chain ID of connected node');

    // 20-ERC20 721-ERC721
    table.integer('type').unsigned().notNullable().defaultTo(EToken.ERC20).comment('Token type EToken');

    table.string('name', 32).notNullable().comment('Token name');

    table.string('symbol', 32).notNullable().comment('Token symbol');

    table.integer('decimal').unsigned().defaultTo(18).comment('Token decimals');

    table.string('address', 42).notNullable().index().comment('Token address');

    addCreatedAndUpdated(knex, table);

    table.index(['name', 'symbol', 'address'], 'common_indexed');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('token');
}
