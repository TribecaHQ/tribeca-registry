import type { Network } from "@saberhq/solana-contrib";
import type { TokenInfo, TokenList } from "@saberhq/token-utils";
import { networkToChainId } from "@saberhq/token-utils";
import * as fs from "fs/promises";

export const getTokenInfo = async (
  address: string,
  network?: Network
): Promise<TokenInfo | undefined> => {
  const tokenListRaw = await fs.readFile(
    `${__dirname}/../../solana-token-list.json`
  );
  const { tokens } = JSON.parse(tokenListRaw.toString()) as TokenList;
  if (!network) {
    return tokens.find((tok) => tok.address === address);
  }

  const chainId = networkToChainId(network);
  return tokens.find(
    (tok) => tok.chainId === chainId && tok.address === address
  );
};
