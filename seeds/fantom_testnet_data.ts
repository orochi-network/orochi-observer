import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('token').del();

  // Inserts seed entries

  await knex('token').insert([
    {
      chainId: 4002,
      type: 721,
      name: 'DuelistKingCard',
      symbol: 'DKC',
      decimal: 18,
      address: '0xE1f03feAFB6107E82191CdB46f270c2ce962eC4e',
    },
    {
      chainId: 4002,
      type: 721,
      name: 'DuelistKingItem',
      symbol: 'DKI',
      decimal: 18,
      address: '0x8BD47c687d0D3299a71f2f9Cd9D216C2Df1271d3',
    },
  ]);
}

export default {};
