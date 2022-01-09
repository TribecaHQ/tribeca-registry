import type { TokenInfo } from "@saberhq/token-utils";

export interface GovernorConfig {
  slug: string;
  name: string;
  description: string;
  address: string;
  govTokenMint: string;
  customLogoURI?: string;
  gauge?: {
    /**
     * The Gaugemeister, if gauges are enabled for this governor.
     */
    gaugemeister: string;
  };
  proposals?: {
    /**
     * If specified, this links to the forum for discussing proposals.
     */
    requiredDiscussionLink?: string | null;
  };
  links?: {
    forum?: string;
  };
}

export interface GovernorMeta extends GovernorConfig {
  govToken: TokenInfo;
  iconURL: string;
}
