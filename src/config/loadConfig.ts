import { PublicKey } from "@solana/web3.js";
import { mapValues } from "lodash";

import type {
  GovernanceConfig,
  GovernorConfig,
  GovernorParameters,
  LockerParameters,
  QuarryConfig,
  TrackedAccountInfo,
} from "./types";

type QuarryConfigJSON = Omit<
  QuarryConfig,
  "rewarder" | "mintWrapper" | "redeemer" | "additionalRewarders"
> & {
  rewarder?: string;
  mintWrapper?: string;
  redeemer?: string;
  additionalRewarders: readonly string[];
};

/**
 * An address tracked by the DAO.
 */
interface TrackedAccountInfoJSON extends Omit<TrackedAccountInfo, "address"> {
  address: string;
}

export interface GovernorConfigJSON
  extends Omit<
    GovernorConfig,
    | "address"
    | "governance"
    | "quarry"
    | "saves"
    | "minter"
    | "gauge"
    | "mndeNftLocker"
    | "nftLockerGauges"
    | "addresses"
  > {
  address: string;
  governance: Omit<GovernanceConfig, "address" | "parameters"> & {
    address: string;
    parameters?: {
      governor?: Omit<GovernorParameters, "proposalActivationMinVotes"> & {
        proposalActivationMinVotes: string;
      };
      locker?: Omit<LockerParameters, "quorumVotes"> & {
        quorumVotes: string;
      };
    };
  };
  quarry?: QuarryConfigJSON;
  saves?: {
    mint: string;
    duration: number;
  }[];
  minter?: {
    mintWrapper?: string;
    redeemer?: string;
  };
  gauge?: Omit<GovernorConfig["gauge"], "gaugemeister"> & {
    gaugemeister: string;
  };
  mndeNftLocker?: {
    address: string;
    creators: string[];
    docs: string;
    app: string;
  };
  nftLockerGauges?: {
    label: string;
    address: string;
    stateAccount: string;
    docs: string;
  }[];
  addresses?: Record<string, TrackedAccountInfoJSON>;
}

const loadQuarryConfig = ({
  rewarder,
  mintWrapper,
  redeemer,
  additionalRewarders,
  ...rest
}: QuarryConfigJSON): QuarryConfig => {
  return {
    ...rest,
    rewarder: rewarder ? new PublicKey(rewarder) : undefined,
    mintWrapper: mintWrapper ? new PublicKey(mintWrapper) : undefined,
    redeemer: redeemer ? new PublicKey(redeemer) : undefined,
    additionalRewarders: additionalRewarders.map((rew) => new PublicKey(rew)),
  };
};

const loadTrackedAccountInfo = (
  infos: Record<string, TrackedAccountInfoJSON>
): Record<string, TrackedAccountInfo> => {
  return mapValues(infos, ({ address, ...info }) => ({
    ...info,
    address: new PublicKey(address),
  }));
};

/**
 * Loads a Governor from its JSON representation.
 * @returns
 */
export const loadGovernorConfig = ({
  address,
  governance,
  quarry,
  saves,
  minter,
  gauge,
  mndeNftLocker,
  nftLockerGauges,
  addresses,
  ...rest
}: GovernorConfigJSON): GovernorConfig => {
  return {
    address: new PublicKey(address),
    governance: {
      ...governance,
      address: new PublicKey(governance.address),
      parameters: governance.parameters
        ? {
            governor: governance.parameters.governor,
            locker: governance.parameters.locker,
          }
        : undefined,
    },
    quarry: quarry ? loadQuarryConfig(quarry) : undefined,
    saves: saves
      ? saves.map(({ mint, duration }) => ({
          mint: new PublicKey(mint),
          duration,
        }))
      : undefined,
    minter: minter
      ? {
          mintWrapper: minter.mintWrapper
            ? new PublicKey(minter.mintWrapper)
            : undefined,
          redeemer: minter.redeemer
            ? new PublicKey(minter.redeemer)
            : undefined,
        }
      : undefined,
    gauge: gauge
      ? {
          ...gauge,
          gaugemeister: new PublicKey(gauge.gaugemeister),
        }
      : undefined,
    mndeNftLocker: mndeNftLocker
      ? {
          ...mndeNftLocker,
          address: new PublicKey(mndeNftLocker.address),
          creators: mndeNftLocker.creators.map((c) => new PublicKey(c)),
        }
      : undefined,
    nftLockerGauges: nftLockerGauges
      ? nftLockerGauges.map((gaugeType) => {
          return {
            ...gaugeType,
            address: new PublicKey(gaugeType.address),
            stateAccount: new PublicKey(gaugeType.stateAccount),
          };
        })
      : undefined,
    ...rest,
    addresses: addresses ? loadTrackedAccountInfo(addresses) : undefined,
  };
};
