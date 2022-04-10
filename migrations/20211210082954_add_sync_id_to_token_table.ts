import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('token', (table: Knex.AlterTableBuilder) => {
    table.bigInteger('syncId').unsigned().index().unique().comment('Sync ID of this token');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('token', (table: Knex.AlterTableBuilder) => {
    table.dropColumn('syncId');
  });
}
