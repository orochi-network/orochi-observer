import { Knex } from 'knex';
import { addCreatedAndUpdated } from '../src/helper';
import { EMigrationStatus } from '../src/model/model-migration';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('migration', (table: Knex.CreateTableBuilder) => {
    table.bigIncrements('id').unsigned().primary();

    table.bigInteger('fromChainId').unsigned().index().comment('From blockchain chain id');

    table.bigInteger('toChainId').unsigned().index().comment('From blockchain chain id');

    table.string('owner', 42).notNullable().index().comment('NFT owner');

    table.string('tokenId', 66).notNullable().index().comment('NFT token id');

    table
      .integer('status')
      .notNullable()
      .unsigned()
      .index()
      .defaultTo(EMigrationStatus.NewMigration)
      .comment('Status of this migration');

    addCreatedAndUpdated(knex, table);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('migration');
}
