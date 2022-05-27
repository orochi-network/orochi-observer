# orochi-observer

Blockchain observer

# Installation

## Configuration

Common `.env` file for all network

```
# Environment
NODE_ENV=development

# Main database
MARIADB_CONNECT_URL=mysql://root:mariadb@localhost:3306/ftm_test

FULL_NODE_RPC=https://rpc.testnet.fantom.network/
```

## Extra configuration for BNB Chain

For BSC you might need to add two extra database config for cross-chain migration

```
# Private key of migrator
MIGRATOR_PRIVATE_KEY=0x....

# Passphrase of signers
SIGNER_MNEMONIC=morning boring...

# Database of polygon observer
MARIADB_POLYGON=mysql://root:mariadb@localhost:3306/polygon_db

# Database of fantom observer
MARIADB_FANTOM=mysql://root:mariadb@localhost:3306/fantom_db
```

## Database migration

You need to run this for every new version

```
knex migrate:latest
```

## Seeding token and contract data

You might need to run data seeding if there is the first or this version

```
knex seed:run --specific=token_data.ts
```
