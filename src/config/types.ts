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
  mintWrapper?: PublicKey;
  redeemer?: PublicKey;
  features: string[];

  operator?: {
    hidden?: boolean;
    address: PublicKey;
    features: string[];
  };
  gauge?: {
    hidden?: boolean;
    gaugemeister: PublicKey;
  };
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
  proposals?: ProposalsConfig;
  quarry?: QuarryConfig;

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
}
