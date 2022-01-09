import { promises } from "fs";

import devnetGovernorConfigsJSON from "../config/governors-list.devnet.json";
import mainnetGovernorConfigsJSON from "../config/governors-list.mainnet.json";
import type { GovernorConfig, GovernorMeta } from "../config/types";
import { DESCRIPTION_CHARACTER_LIMIT } from "../constants";
import { getGovTokenInfo } from "../utils/getTokenInfo";
import { stableStringify } from "../utils/serialize";

const buildGovernorMetas = async () => {
  const mainnetGovernorConfigs: GovernorConfig[] = mainnetGovernorConfigsJSON;
  const mainnetGovernors = mainnetGovernorConfigs.map((cfg) => {
    if (cfg.description.length > DESCRIPTION_CHARACTER_LIMIT) {
      throw new Error(
        `Description for ${cfg.name} is too long (${cfg.description.length} > ${DESCRIPTION_CHARACTER_LIMIT}).`
      );
    }

    const token = getGovTokenInfo(cfg.govTokenMint, "mainnet-beta");

    if (!token?.logoURI && !cfg.customLogoURI) {
      throw new Error("No logo found");
    }

    return {
      ...cfg,
      iconURL: cfg.customLogoURI ?? token?.logoURI,
      govToken: token,
    } as GovernorMeta;
  });

  await promises.writeFile(
    `${__dirname}/../../data/registry/governor-metas.mainnet.json`,
    stableStringify(mainnetGovernors)
  );

  const devnetGovernorConfigs: GovernorConfig[] = devnetGovernorConfigsJSON;
  const devnetGovernors = devnetGovernorConfigs.map((cfg): GovernorMeta => {
    if (cfg.description.length > DESCRIPTION_CHARACTER_LIMIT) {
      throw new Error(
        `Description for ${cfg.name} is too long (${cfg.description.length} > ${DESCRIPTION_CHARACTER_LIMIT}).`
      );
    }

    const token = getGovTokenInfo(cfg.govTokenMint);

    const iconURL = cfg.customLogoURI ?? token?.logoURI;
    if (!iconURL) {
      throw new Error("No logo found");
    }
    if (!token) {
      throw new Error("No governance token found");
    }

    return {
      ...cfg,
      iconURL,
      govToken: token,
    };
  });

  await promises.writeFile(
    `${__dirname}/../../data/registry/governor-metas.devnet.json`,
    stableStringify(devnetGovernors)
  );
};

buildGovernorMetas()
  .then()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
