import { formatNetwork } from "@saberhq/solana-contrib";
import * as fs from "fs/promises";
import * as toml from "toml";

import type { GovernorConfig } from "../config/types";
import { parseGovernorConfig } from "../parser/parse";
import type { GovernorConfigRaw } from "../parser/types";
import { validateConfig } from "../parser/validate";
import { stableStringify } from "../utils/serialize";

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

const buildGovernorMetasForNetwork = async (
  network: "mainnet-beta" | "devnet"
) => {
  const networkFmt = formatNetwork(network);
  const daoDir = `${__dirname}/../../config/${networkFmt}`;
  const daos = await fs.readdir(daoDir);

  const outDir = `${__dirname}/../../data/registry/${networkFmt}`;
  await fs.mkdir(outDir, { recursive: true });

  const governors = await Promise.all(
    daos.map(async (dao): Promise<GovernorConfig | null> => {
      const daoStat = await fs.stat(`${daoDir}/${dao}`);
      if (!daoStat.isDirectory()) {
        return null;
      }
      const config = await fs.readFile(`${daoDir}/${dao}/Tribeca.toml`);
      const rawConfig = toml.parse(config.toString()) as GovernorConfigRaw;

      try {
        const parsedConfig = await parseGovernorConfig(rawConfig, network);
        const config = validateConfig(parsedConfig);
        await fs.writeFile(`${outDir}/${dao}.json`, stableStringify(config));
        return config;
      } catch (e) {
        console.error(`Error parsing config ${networkFmt}/${dao}`, e);
        throw e;
      }
    })
  );

  const foundDAOs = governors.filter(notEmpty);

  await fs.writeFile(
    `${__dirname}/../../data/registry/governor-metas.${networkFmt}.json`,
    stableStringify(foundDAOs)
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
