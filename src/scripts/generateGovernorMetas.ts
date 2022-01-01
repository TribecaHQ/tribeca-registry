import { promises } from "fs";

import devnetGovernorConfigsJSON from "../config/governors-list.devnet.json";
import mainnetGovernorConfigsJSON from "../config/governors-list.mainnet.json";
import type { GovernorConfig, GovernorMeta } from "../config/types";
import { getGovTokenInfo } from "../utils/getTokenInfo";
import { stableStringify } from "../utils/serialize";

const buildGovernorMetas = async () => {
  const mainnetGovernorConfigs: GovernorConfig[] = mainnetGovernorConfigsJSON;
  const mainnetGovernors = mainnetGovernorConfigs.map((cfg) => {
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
  const devnetGovernors = devnetGovernorConfigs.map((cfg) => {
    const token = getGovTokenInfo(cfg.govTokenMint);

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
