import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('token').del();

  // Inserts seed entries
  await knex('token').insert([
    {
      chainId: 250,
      type: 721,
      name: 'DuelistKingCard',
      symbol: 'DKC',
      decimal: 18,
      address: '0xC44b1022f4895F3C04e965f8A82437a8B5cebB70',
    },
    {
      chainId: 250,
      type: 721,
      name: 'DuelistKingItem',
      symbol: 'DKI',
      decimal: 18,
      address: '0x6c375585A31718c38D4E3eb3eddbfb203f142834',
    },
  ]);
}

export default {};
