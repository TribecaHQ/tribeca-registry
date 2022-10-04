import type { TokenInfo } from "@saberhq/token-utils";
import { chainIdToNetwork, networkToChainId } from "@saberhq/token-utils";
import type { Cluster } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { mapValues, startCase } from "lodash-es";
import invariant from "tiny-invariant";

import type {
  AddressType,
  GovernanceConfig,
  GovernorConfig,
  MndeNftLockerConfig,
  NftLockerGauge,
  QuarryConfig,
  SAVEConfig,
} from "../config/types";
import { ADDRESS_TYPES, TokenQuantity } from "../config/types";
import { getTokenInfo } from "../utils/getTokenInfo";
import type {
  GovernanceRaw,
  GovernorConfigRaw,
  mndeNftLockerRaw,
  NftLockerGaugeRaw,
  QuarryRaw,
  SAVERaw,
} from "./types";
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
  const prepopulatedTokenInfo = await getTokenInfo(govTokenAddress, network);
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
                  parameters.governor["quorum-votes"].toString()
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
                  parameters.locker["proposal-activation-min-votes"].toString()
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
  "additional-rewarders": additionalRewarders,
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
    additionalRewarders:
      additionalRewarders?.map((rew) => new PublicKey(rew)) ?? [],
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

const parseSAVE = ({ mint, duration }: SAVERaw): SAVEConfig => ({
  mint: new PublicKey(mint),
  duration,
});

const parseMndeNftLocker = ({
  address,
  creators,
  docs,
  app,
}: mndeNftLockerRaw): MndeNftLockerConfig => ({
  address: new PublicKey(address),
  creators: creators.map((c) => new PublicKey(c)),
  docs,
  app,
});

const parseNftLockerGauges = ({
  label,
  address,
  stateAccount,
  docs,
}: NftLockerGaugeRaw): NftLockerGauge => ({
  label,
  address: new PublicKey(address),
  stateAccount: stateAccount ? new PublicKey(stateAccount) : undefined,
  docs,
});

/**
 * Parses the raw configuration of a Governor into something more useful.
 *
 * @param raw Raw data.
 * @param cluster Cluster that the Governor is on.
 * @returns
 */
export const parseGovernorConfig = async (
  raw: GovernorConfigRaw,
  cluster: Cluster
): Promise<GovernorConfig> => {
  const governance = await parseGovernance({
    ...raw.governance,
    network: cluster,
  });
  const quarry = raw.quarry ? parseQuarry(raw.quarry) : undefined;
  const mndeNftLocker = raw["mnde-nft-locker"]
    ? parseMndeNftLocker(raw["mnde-nft-locker"])
    : undefined;
  const nftLockerGauges = raw["nft-locker-gauges"]
    ? raw["nft-locker-gauges"].map((rawGaugeType) =>
        parseNftLockerGauges(rawGaugeType)
      )
    : undefined;

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
    saves: raw.saves ? raw.saves.map(parseSAVE) : undefined,
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
    mndeNftLocker,
    nftLockerGauges,
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
    addresses: raw.addresses
      ? mapValues(raw.addresses, (address, key) => {
          if (typeof address === "string") {
            return {
              label: startCase(key),
              address: new PublicKey(address),
            };
          }
          const {
            ["description-link"]: descriptionLink,
            type,
            ...addressProps
          } = address;
          if (type && !ADDRESS_TYPES.includes(type)) {
            throw new Error(
              `invalid type ${type} for address ${address.address}`
            );
          }
          return {
            ...addressProps,
            type: type as AddressType,
            descriptionLink,
            address: new PublicKey(address.address),
          };
        })
      : undefined,
  };
};
