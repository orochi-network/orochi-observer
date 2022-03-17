import { Knex } from 'knex';
import { AppConf } from '../src/helper';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('token').del();

  // Inserts seed entries
  if (AppConf.nodeEnv === 'production') {
    await knex('token').insert([
      {
        chainId: 137,
        type: 721,
        name: 'DKDAO Items',
        symbol: 'DKDAOI',
        decimal: 18,
        address: '0xb5c01956842cE3a658109776215F86CA4FeE2CBc',
      },
    ]);
  }
}

export default {};
