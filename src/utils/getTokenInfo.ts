import type { Network } from "@saberhq/solana-contrib";
import type { TokenInfo, TokenList } from "@saberhq/token-utils";
import { networkToChainId } from "@saberhq/token-utils";
import * as fs from "fs/promises";

let cachedTokenList: TokenList | null = null;

export const loadTokenList = async (): Promise<TokenList> => {
  if (cachedTokenList) {
    return cachedTokenList;
  }
  const tokenListRaw = await fs.readFile(
    `${__dirname}/../../solana-token-list.json`
  );
  cachedTokenList = JSON.parse(tokenListRaw.toString()) as TokenList;
  return cachedTokenList;
};

export const getTokenInfo = async (
  address: string,
  network?: Network
): Promise<TokenInfo | undefined> => {
  const { tokens } = await loadTokenList();
  if (!network) {
    return tokens.find((tok) => tok.address === address);
  }
  const chainId = networkToChainId(network);
  return tokens.find(
    (tok) => tok.chainId === chainId && tok.address === address
  );
};
