import type { TokenInfo } from "@saberhq/token-utils";

import type { GovernorConfig } from "../config/types.js";
import { DESCRIPTION_CHARACTER_LIMIT } from "../constants.js";

export const validateTokenInfo = ({
  address,
  decimals,
  symbol,
  name,
  chainId,
  ...rest
}: { address: string; chainId: number } & Readonly<
  Partial<TokenInfo>
>): TokenInfo => {
  if (decimals === undefined) {
    throw new Error("decimals required");
  }
  if (symbol === undefined) {
    throw new Error("symbol required");
  }
  if (name === undefined) {
    throw new Error("name required");
  }
  return { address, decimals, symbol, name, chainId, ...rest };
};

export const validateConfig = (cfg: GovernorConfig): GovernorConfig => {
  if (cfg.description.length > DESCRIPTION_CHARACTER_LIMIT) {
    throw new Error(
      `Description for ${cfg.name} is too long (${cfg.description.length} > ${DESCRIPTION_CHARACTER_LIMIT}).`
    );
  }
  return cfg;
};
