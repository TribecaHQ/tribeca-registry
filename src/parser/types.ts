import type { TokenInfo } from "@saberhq/token-utils";
import type { Cluster } from "@solana/web3.js";

export interface GovernanceRaw {
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
  address: string;

  /**
   * Network.
   */
  network?: Cluster;

  /**
   * Custom logo to use for the DAO, if different from the token icon.
   */
  ["icon-url"]?: string;

  /**
   * Governance token information.
   */
  token: {
    address: string;
  } & Partial<Omit<TokenInfo, "mint">>;

  parameters?: {
    governor?: GovernorParametersRaw;
    locker?: {
      ["max-stake-vote-multiplier"]: number;
      ["min-stake-duration"]: number;
      ["max-stake-duration"]: number;
      ["proposal-activation-min-votes"]: number;
      ["whitelist-enabled"]?: boolean;
    };
  };
}

interface GovernorParametersRaw {
  ["quorum-votes"]: number;
  ["token-mint"]: string;
  ["voting-delay"]: number;
  ["voting-period"]: number;
  ["timelock-delay"]: number;
}

/**
 * Settings for how proposals should be managed.
 */
interface ProposalsRaw {
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

export interface QuarryRaw {
  hidden?: boolean;
  rewarder?: string;
  ["mint-wrapper"]?: string;
  ["additional-rewarders"]?: readonly string[];
  redeemer?: string;
  features?: string[];

  operator?: {
    hidden?: boolean;
    address: string;
    features?: string[];
  };
  gauge?: {
    hidden?: boolean;
    gaugemeister: string;
  };
}

interface GovernanceConfigDeprecatedRaw {
  /**
   * Settings for minting tokens as the DAO. Enabling this allows DAO members to create "mint" proposals which can be used for grants.
   */
  minter?: {
    /**
     * The Quarry mint wrapper.
     */
    mintWrapper: string;
    /**
     * The redeemer key, if applicable.
     *
     * The consumer of the redeemer key should be aware of how to handle different types of redeemers,
     * based on the owner of this account.
     */
    redeemer?: string;
  };
  /**
   * Settings for the Quarry Gauge system.
   */
  gauge?: {
    /**
     * The Gaugemeister, if gauges are enabled for this governor.
     */
    gaugemeister: string;
    /**
     * If true, Gauges will not be visible unless the page is explicitly visited.
     */
    hidden?: boolean;
  };
}

interface LinksConfigRaw {
  label: string;
  url: string;
}

interface KnownAddressRaw {
  label: string;
  type?: "smart-wallet";
  address: string;
  description?: string;
  ["description-link"]?: string;
}

interface SiteConfigRaw {
  hostname: string;
  cluster: Cluster;
}

export interface SAVERaw {
  mint: string;
  duration: number;
}

/**
 * Raw JSON representation of the configuration of a Governor.
 */
export interface GovernorConfigRaw extends GovernanceConfigDeprecatedRaw {
  site?: SiteConfigRaw;
  governance: GovernanceRaw;
  proposals?: ProposalsRaw;
  /**
   * Outstanding SAVE tokens.
   */
  saves?: SAVERaw[];
  /**
   * Quarry configuration
   */
  quarry?: QuarryRaw;
  /**
   * Various links.
   */
  links?: Record<string, string | LinksConfigRaw>;
  /**
   * Various addresses.
   */
  addresses?: Record<string, string | KnownAddressRaw>;
}
