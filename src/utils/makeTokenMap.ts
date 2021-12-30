import type { Network } from "@saberhq/solana-contrib";
import { getTokenIcon } from "@saberhq/spl-token-icons";
import type { TokenInfo } from "@saberhq/token-utils";
import {
  chainIdToNetwork,
  networkToChainId,
  Token,
} from "@saberhq/token-utils";
import { PublicKey } from "@solana/web3.js";
import { uniq } from "lodash";

import solanaTokenList from "../../data/solana-token-list.json";

const getInternalTokenInfo = (
  network: Network,
  address: string
): TokenInfo | null => {
  const builtinTokenList =
    network === "mainnet-beta"
      ? MAINNET_TOKENS
      : network === "devnet"
      ? DEVNET_TOKENS
      : [];
  const chainId = networkToChainId(network);

  const tokenList = solanaTokenList as TokenInfo[];
  const existing = tokenList.find(
    (tok) => tok.chainId === chainId && tok.address === address
  );
  const local = builtinTokenList.find(
    (tok) => tok.chainId === chainId && tok.address === address
  );
  if (!existing && !local) {
    console.error(`No token info found for ${address}.`);
    return null;
  }
  const info = {
    ...local,
    ...existing,
    tags: uniq([...(local?.tags ?? []), ...(existing?.tags ?? [])]),
    extensions: {
      ...local?.extensions,
      ...existing?.extensions,
    },
  };
  return annotateToken(info as TokenInfo);
};

export const getTokenInfo = (
  network: Network,
  address: string
): TokenInfo | null => {
  const chainId = networkToChainId(network);
  const dwrap = decimalWrappedTokens.find(
    (d) => d.address === address && d.chainId === chainId
  );
  if (dwrap) {
    return dwrap;
  }
  return getInternalTokenInfo(network, address);
};

const annotateToken = (item: TokenInfo): TokenInfo => {
  const additionalTags: string[] = [];
  const network = chainIdToNetwork(item.chainId);
  let name: string = item.name;
  const symbol: string = item.symbol;

  let source: string | null = null;
  let sourceUrl: string | null = null;
  let currency: string | null = null;

  return {
    ...item,
    name,
    symbol,
    logoURI: getTokenIcon(item) ?? item.logoURI,
    tags: uniq(item.tags ? [...item.tags, ...additionalTags] : additionalTags),
    extensions: {
      ...item.extensions,
      ...(currency ? { currency } : {}),
      ...(source && sourceUrl ? { source, sourceUrl } : {}),
    },
  };
};
