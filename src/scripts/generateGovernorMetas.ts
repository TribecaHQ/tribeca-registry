import { formatNetwork } from "@saberhq/solana-contrib";
import type { TokenInfo } from "@saberhq/token-utils";
import { networkToChainId } from "@saberhq/token-utils";
import * as fs from "fs/promises";
import * as toml from "toml";

import type { GovernorConfig, GovernorMeta } from "../config/types";
import { DESCRIPTION_CHARACTER_LIMIT } from "../constants";
import { getGovTokenInfo } from "../utils/getTokenInfo";
import { stableStringify } from "../utils/serialize";

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

const validateTokenInfo = ({
  address,
  decimals,
  symbol,
  name,
  chainId,
  ...rest
}: { address: string } & Readonly<Partial<TokenInfo>>): TokenInfo => {
  if (decimals === undefined) {
    throw new Error("decimals required");
  }
  if (symbol === undefined) {
    throw new Error("symbol required");
  }
  if (name === undefined) {
    throw new Error("name required");
  }
  if (chainId === undefined) {
    throw new Error("chainId required");
  }
  return { address, decimals, symbol, name, chainId, ...rest };
};

const validateCfg = (
  cfg: GovernorConfig,
  network: "mainnet-beta" | "devnet"
): GovernorMeta => {
  if (cfg.description.length > DESCRIPTION_CHARACTER_LIMIT) {
    throw new Error(
      `Description for ${cfg.name} is too long (${cfg.description.length} > ${DESCRIPTION_CHARACTER_LIMIT}).`
    );
  }

  const token =
    getGovTokenInfo(cfg.govToken.address, network) ??
    validateTokenInfo({ ...cfg.govToken, chainId: networkToChainId(network) });

  const iconURL = cfg.customLogoURI ?? token?.logoURI;
  if (!iconURL) {
    throw new Error("No logo found");
  }

  return {
    ...cfg,
    iconURL,
    govToken: token,
  };
};

const buildGovernorMetasForNetwork = async (
  network: "mainnet-beta" | "devnet"
) => {
  const networkFmt = formatNetwork(network);
  const daoDir = `${__dirname}/../../config/${networkFmt}`;
  const daos = await fs.readdir(daoDir);

  const governors = await Promise.all(
    daos.map(async (dao): Promise<GovernorMeta | null> => {
      const daoStat = await fs.stat(`${daoDir}/${dao}`);
      if (!daoStat.isDirectory()) {
        return null;
      }
      const config = await fs.readFile(`${daoDir}/${dao}/Tribeca.toml`);
      const parsedConfig = toml.parse(config.toString()) as GovernorConfig;

      try {
        return validateCfg(parsedConfig, network);
      } catch (e) {
        console.error(`Error parsing config ${networkFmt}/${dao}`, e);
        throw e;
      }
    })
  );

  await fs.writeFile(
    `${__dirname}/../../data/registry/governor-metas.${networkFmt}.json`,
    stableStringify(governors.filter(notEmpty))
  );
};

const buildGovernorMetas = async () => {
  await buildGovernorMetasForNetwork("mainnet-beta");
  await buildGovernorMetasForNetwork("devnet");
};

buildGovernorMetas()
  .then()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
