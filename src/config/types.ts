import type { TokenInfo } from "@saberhq/token-utils";

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
  address: string;

  /**
   * Governance token information.
   */
  govToken: {
    address: string;
  } & Partial<Omit<TokenInfo, "mint">>;

  /**
   * Custom logo to use for the DAO, if different from the token icon.
   */
  iconURL?: string;

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
  };
  /**
   * Settings for how proposals should be managed.
   */
  proposals?: {
    /**
     * If specified, this links to the forum for discussing proposals.
     */
    requiredDiscussionLink?: string | null;
  };

  /**
   * Various links.
   */
  links?: {
    forum?: string;
  };
}

export interface GovernorMeta
  extends Omit<GovernorConfig, "govToken" | "iconURL">,
    Required<Pick<GovernorConfig, "govToken" | "iconURL">> {}
