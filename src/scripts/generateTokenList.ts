import { GitHubTokenListResolutionStrategy } from "@solana/spl-token-registry";
import * as fs from "fs/promises";

import { stableStringify } from "../utils/serialize";

/**
 * Fetches the token list from GitHub.
 */
const fetchTokens = async (): Promise<void> => {
  const allTokens = await new GitHubTokenListResolutionStrategy().resolve();
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
