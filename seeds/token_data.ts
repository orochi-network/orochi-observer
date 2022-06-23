import { Knex } from 'knex';

const contractData = [
  // BSC
  {
    chainId: 56,
    name: 'DuelistKingMerchant',
    address: '0x54f8fbc961db8c4ECcd946526F648e58E9cC85b0',
  },
  // Fantom testnet
  {
    chainId: 4002,
    name: 'DuelistKingMerchant',
    address: '0x743C6a03e7B404Ba9A1aB8fFB8C73dCF2A7A2419',
  },
];

const tokenData = [
  // BSC
  {
    chainId: 56,
    type: 721,
    name: 'DuelistKingCard',
    symbol: 'DKC',
    decimal: 18,
    address: '0xb115a074AE430Ac459c517B826bD227372C01A98',
  },
  // Polygon
  {
    chainId: 137,
    type: 721,
    name: 'DKDAO Items',
    symbol: 'DKDAOI',
    decimal: 18,
    address: '0xb5c01956842cE3a658109776215F86CA4FeE2CBc',
  },
  {
    chainId: 56,
    type: 721,
    name: 'DuelistKingItem',
    symbol: 'DKI',
    decimal: 18,
    address: '0xe2f0c8f0F80D3a1f0a66Eb3ab229c4f63CCd11d0',
  },
  // Fantom
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
  // Fantom testnet
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
];

export async function seed(knex: Knex): Promise<void> {
  // Get all existing record
  const tokenAddresses = (await knex('token').select('address')).map((e) => e.address.toLowerCase());
  const contractAddresses = (await knex('contract').select('address')).map((e) => e.address.toLowerCase());

  // Inserts seed entries
  const insertTokenData = tokenData.filter((e) => !tokenAddresses.includes(e.address.toLowerCase()));
  const interContractData = contractData.filter((e) => !contractAddresses.includes(e.address.toLowerCase()));
  if (insertTokenData.length > 0) await knex('token').insert(insertTokenData);
  if (interContractData.length > 0) await knex('contract').insert(interContractData);
}

export default {};
