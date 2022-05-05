import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('token').del();
  await knex('contract').del();

  // Inserts seed entries

  await knex('token').insert([
    {
      chainId: 4002,
      type: 721,
      name: 'DuelistKingCard',
      symbol: 'DKC',
      decimal: 18,
      address: '0x4D61B0cf37494719527c8a526D0fC68f871B192d',
    },
    {
      chainId: 4002,
      type: 721,
      name: 'DuelistKingItem',
      symbol: 'DKI',
      decimal: 18,
      address: '0x5657F4BB6771f1b0A9461Ea4e7643bcc7c568f3f',
    },
  ]);

  await knex('contract').insert({
    chainId: 4002,
    name: 'DuelistKingMerchant',
    address: '0x743C6a03e7B404Ba9A1aB8fFB8C73dCF2A7A2419',
  });
}

export default {};
