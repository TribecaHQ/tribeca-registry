import type { Network } from "@saberhq/solana-contrib";
import { Connection } from "@solana/web3.js";

export type IEnvironment = Readonly<{
  name: string;
  endpoint: string;
}>;

export const environments: { [K in Network]: IEnvironment } = {
  "mainnet-beta": {
    name: "Mainnet Beta",
    endpoint: "https://api.mainnet-beta.solana.com/",
  },
  devnet: {
    name: "Devnet",
    endpoint: "https://api.devnet.solana.com/",
  },
  testnet: {
    name: "Testnet",
    endpoint: "https://api.testnet.solana.com/",
  },
  localnet: {
    name: "Localnet",
    endpoint: "http://localhost:8899/",
  },
} as const;

export const makeConnection = (network: Network): Connection => {
  const endpoint = environments[network].endpoint;
  return new Connection(endpoint);
};
