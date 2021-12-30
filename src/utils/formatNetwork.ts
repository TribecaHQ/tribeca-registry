import type { Network } from "@saberhq/solana-contrib";

export const formatNetwork = (network: Network): string => {
  if (network === "mainnet-beta") {
    return "mainnet";
  }
  return network;
};
