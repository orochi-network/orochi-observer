import { Knex } from 'knex';
import { AppConf } from '../src/helper';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('token').del();

  // Inserts seed entries
  if (AppConf.nodeEnv !== 'production') {
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
  } else {
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
}

export default {};
