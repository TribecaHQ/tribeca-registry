import type { TokenInfo } from "@saberhq/token-utils";
import { u64 } from "@saberhq/token-utils";
import type { PublicKey } from "@solana/web3.js";

import type { GovernanceRaw } from "../parser/types";

export class TokenQuantity extends u64 {
  override toJSON(): string {
    return this.toString();
  }
}

export interface GovernorParameters {
  quorumVotes: TokenQuantity;
  votingDelay: number;
  votingPeriod: number;
  timelockDelay: number;
}

export interface LockerParameters {
  maxStakeVoteMultiplier: number;
  minStakeDuration: number;
  maxStakeDuration: number;
  proposalActivationMinVotes: TokenQuantity;
  whitelistEnabled: boolean;
}

export type GovernanceConfig = Omit<
  GovernanceRaw,
  "address" | "icon-url" | "token" | "parameters"
> &
  Required<Pick<GovernanceRaw, "network">> & {
    address: PublicKey;
    iconURL: string;
    token: TokenInfo;

    parameters?: {
      governor?: GovernorParameters;
      locker?: LockerParameters;
    };
  };

export interface ProposalsConfig {
  notice?: string;
  /**
   * If specified, this links to the forum for discussing proposals.
   */
  discussion?: {
    required?: boolean;
    link?: string;
    prefix?: string;
  };
}

export interface QuarryConfig {
  hidden?: boolean;
  rewarder?: PublicKey;
  additionalRewarders: readonly PublicKey[];
  mintWrapper?: PublicKey;
  redeemer?: PublicKey;
  features: readonly string[];

  operator?: {
    hidden?: boolean;
    address: PublicKey;
    features: readonly string[];
  };
  gauge?: {
    hidden?: boolean;
    gaugemeister: PublicKey;
  };
}

/**
 * SAVEs for the DAO membership token.
 */
export interface SAVEConfig {
  /**
   * Mint of the SAVE.
   */
  mint: PublicKey;
  /**
   * Minimum lock duration of the SAVE, in seconds.
   */
  duration: number;
}

/**
 * Marinade's locker contract to vote by NFTs
 */
export interface MndeNftLockerConfig {
  /**
   * Address of the locker .
   */
  address: PublicKey;
  /**
   * Valid creators for the voting NFTs.
   */
  creators: PublicKey[];
  /**
   * Link to appropriate docs.
   */
  docs: string;
  /**
   * Link to NFT minting app.
   */
  app: string;
}

/**
 * Iterable list of {@link AddressType}s.
 */
export const ADDRESS_TYPES = ["smart-wallet"] as const;

/**
 * Type of tracked address.
 */
export type AddressType = typeof ADDRESS_TYPES[number];

/**
 * An account tracked by the DAO.
 */
export interface TrackedAccountInfo {
  /**
   * Human-readable label of what the address is.
   */
  label: string;
  /**
   * Type of the tracked account.
   */
  type?: AddressType;
  /**
   * Address of the account.
   */
  address: PublicKey;
  /**
   * Detailed description of what this account is used for.
   */
  description?: string;
  descriptionLink?: string;
}

/**
 * Configuration of a Governor.
 */
export interface GovernorConfig {
  /**
   * Unique slug to use in the URL.
   */
  slug: string;

  /**
   * Name of the protocol.
   */
  name: string;

  /**
   * Description of the protocol.
   */
  description: string;

  /**
   * Address of the Governor.
   */
  address: PublicKey;

  /**
   * Custom logo to use for the DAO, if different from the token icon.
   */
  iconURL: string;

  /**
   * Governance token information.
   */
  govToken: TokenInfo;

  /**
   * Governance configuration.
   */
  governance: GovernanceConfig;
  /**
   * Proposals configuration.
   */
  proposals?: ProposalsConfig;
  /**
   * Quarry configuration.
   */
  quarry?: QuarryConfig;
  /**
   * Outstanding SAVE tokens.
   */
  saves?: SAVEConfig[];
  /**
   * Token voter configutation.
   */
  mndeNftLocker?: MndeNftLockerConfig;

  /**
   * Settings for minting tokens as the DAO. Enabling this allows DAO members to create "mint" proposals which can be used for grants.
   */
  minter?: {
    /**
     * The Quarry mint wrapper.
     */
    mintWrapper?: PublicKey;
    /**
     * The redeemer key, if applicable.
     *
     * The consumer of the redeemer key should be aware of how to handle different types of redeemers,
     * based on the owner of this account.
     */
    redeemer?: PublicKey;
  };

  /**
   * Settings for the Quarry Gauge system.
   */
  gauge?: {
    /**
     * The Gaugemeister, if gauges are enabled for this governor.
     */
    gaugemeister: PublicKey;
    /**
     * If true, Gauges will not be visible unless the page is explicitly visited.
     */
    hidden?: boolean;
  };

  /**
   * Various links.
   */
  links?: Record<string, { label: string; url: string }>;

  /**
   * Known addresses.
   */
  addresses?: Record<string, TrackedAccountInfo>;
}
