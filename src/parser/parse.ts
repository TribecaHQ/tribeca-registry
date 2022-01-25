import type { TokenInfo } from "@saberhq/token-utils";
import { chainIdToNetwork, networkToChainId } from "@saberhq/token-utils";
import type { Cluster } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { mapValues, startCase } from "lodash";
import invariant from "tiny-invariant";

import type {
  GovernanceConfig,
  GovernorConfig,
  QuarryConfig,
} from "../config/types";
import { TokenQuantity } from "../config/types";
import { fetchGovTokenInfo } from "../utils/getTokenInfo";
import type { GovernanceRaw, GovernorConfigRaw, QuarryRaw } from "./types";
import { validateTokenInfo } from "./validate";

const parseGovernance = async ({
  slug,
  name,
  description,
  address,
  network: theNetwork,
  "icon-url": iconURL,
  token,

  parameters,
}: GovernanceRaw): Promise<GovernanceConfig> => {
  const chainId = token?.chainId;
  const network = theNetwork ?? (chainId ? chainIdToNetwork(chainId) : null);
  invariant(network && network !== "localnet", "network");

  const govTokenAddress = token?.address;
  invariant(govTokenAddress);
  const prepopulatedTokenInfo = await fetchGovTokenInfo(
    govTokenAddress,
    network
  );
  const validatedIconURL =
    iconURL ?? token?.logoURI ?? prepopulatedTokenInfo?.logoURI;
  invariant(validatedIconURL);
  const tokenInfo: Partial<TokenInfo> & Pick<TokenInfo, "address" | "chainId"> =
    {
      ...prepopulatedTokenInfo,
      ...token,
      chainId: networkToChainId(network),
      address: govTokenAddress,
      logoURI: validatedIconURL,
    };

  const validatedToken = validateTokenInfo(tokenInfo);

  return {
    slug,
    name,
    description,
    address: new PublicKey(address),
    network,
    iconURL: validatedIconURL,
    token: validatedToken,

    parameters: parameters
      ? {
          governor: parameters.governor
            ? {
                quorumVotes: new TokenQuantity(
                  parameters.governor["quorum-votes"]
                ),
                votingDelay: parameters.governor["voting-delay"],
                votingPeriod: parameters.governor["voting-period"],
                timelockDelay: parameters.governor["timelock-delay"],
              }
            : undefined,
          locker: parameters.locker
            ? {
                maxStakeVoteMultiplier:
                  parameters.locker?.["max-stake-vote-multiplier"],
                minStakeDuration: parameters.locker?.["min-stake-duration"],
                maxStakeDuration: parameters.locker?.["max-stake-duration"],
                proposalActivationMinVotes: new TokenQuantity(
                  parameters.locker["proposal-activation-min-votes"]
                ),
                whitelistEnabled:
                  parameters.locker?.["whitelist-enabled"] ?? false,
              }
            : undefined,
        }
      : undefined,
  };
};

const parseQuarry = ({
  rewarder,
  redeemer,
  "mint-wrapper": mintWrapper,
  operator,
  gauge,
  features,
  ...common
}: QuarryRaw): QuarryConfig => {
  return {
    rewarder: rewarder ? new PublicKey(rewarder) : undefined,
    mintWrapper: mintWrapper ? new PublicKey(mintWrapper) : undefined,
    redeemer: redeemer ? new PublicKey(redeemer) : undefined,
    features: features ?? [],
    gauge: gauge
      ? {
          ...gauge,
          gaugemeister: new PublicKey(gauge.gaugemeister),
        }
      : undefined,
    operator: operator
      ? {
          ...operator,
          address: new PublicKey(operator.address),
          features: operator.features ?? [],
        }
      : operator,
    ...common,
  };
};

export const parseGovernorConfig = async (
  raw: GovernorConfigRaw,
  cluster: Cluster
): Promise<GovernorConfig> => {
  const governance = await parseGovernance({
    ...raw.governance,
    network: cluster,
  });
  const quarry = raw.quarry ? parseQuarry(raw.quarry) : undefined;
  return {
    slug: governance.slug,
    name: governance.name,
    description: governance.description,
    address: new PublicKey(governance.address),
    govToken: governance.token,
    iconURL: governance.iconURL,

    governance,
    proposals: raw.proposals,
    quarry,
    minter: quarry
      ? {
          mintWrapper: quarry?.mintWrapper,
          redeemer: quarry?.redeemer,
        }
      : undefined,
    gauge: quarry?.gauge
      ? {
          gaugemeister: quarry.gauge.gaugemeister,
          hidden: quarry.gauge.hidden,
        }
      : undefined,
    links: raw.links
      ? mapValues(raw.links, (link, key) => {
          if (typeof link === "string") {
            return {
              label: startCase(key),
              url: link,
            };
          }
          return link;
        })
      : undefined,
  };
};
