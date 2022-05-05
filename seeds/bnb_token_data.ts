import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('token').del();
  await knex('contract').del();

  // Inserts seed entries

  await knex('token').insert([
    {
      chainId: 56,
      type: 721,
      name: 'DuelistKingCard',
      symbol: 'DKC',
      decimal: 18,
      address: '0xb115a074AE430Ac459c517B826bD227372C01A98',
    },
    {
      chainId: 56,
      type: 721,
      name: 'DuelistKingItem',
      symbol: 'DKI',
      decimal: 18,
      address: '0xe2f0c8f0F80D3a1f0a66Eb3ab229c4f63CCd11d0',
    },
  ]);

  await knex('contract').insert({
    chainId: 56,
    name: 'DuelistKingMerchant',
    address: '0x54f8fbc961db8c4ECcd946526F648e58E9cC85b0',
  });
}

export default {};
