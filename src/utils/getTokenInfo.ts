import type { Network } from "@saberhq/solana-contrib";
import type { TokenInfo } from "@saberhq/token-utils";
import { networkToChainId } from "@saberhq/token-utils";
import * as fs from "fs/promises";

export const getTokenInfo = async (
  address: string,
  network?: Network
): Promise<TokenInfo | undefined> => {
  const tokenListRaw = await fs.readFile(
    `${__dirname}/../../solana-token-list.json`
  );
  const tokenList = JSON.parse(tokenListRaw.toString()) as TokenInfo[];
  if (!network) {
    return tokenList.find((tok) => tok.address === address);
  }

  const chainId = networkToChainId(network);
  return tokenList.find(
    (tok) => tok.chainId === chainId && tok.address === address
  );
};
