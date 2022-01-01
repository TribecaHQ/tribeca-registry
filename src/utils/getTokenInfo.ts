import type { Network } from "@saberhq/solana-contrib";
import type { TokenInfo } from "@saberhq/token-utils";
import { networkToChainId } from "@saberhq/token-utils";

import solanaTokenList from "../../solana-token-list.json";

export const getGovTokenInfo = (
  address: string,
  network?: Network
): TokenInfo | undefined => {
  const tokenList = solanaTokenList as TokenInfo[];
  if (!network) {
    return tokenList.find((tok) => tok.address === address);
  }

  const chainId = networkToChainId(network);
  return tokenList.find(
    (tok) => tok.chainId === chainId && tok.address === address
  );
};
