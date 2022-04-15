import type { TokenList } from "@saberhq/token-utils";
import axios from "axios";
import * as fs from "fs/promises";

import { stableStringify } from "../utils/serialize";

const TOKEN_LIST = `https://github.com/CLBExchange/certified-token-list/blob/master/token-list.json?raw=true`;

/**
 * Fetches the token list from GitHub.
 */
const fetchTokens = async (): Promise<void> => {
  const { data: allTokens } = await axios.get<TokenList>(TOKEN_LIST);
  await fs.writeFile(
    `${__dirname}/../../solana-token-list.json`,
    stableStringify(allTokens)
  );
};

const main = async () => {
  await fetchTokens();
};

main()
  .then()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
