import type { TokenInfo } from "@saberhq/token-utils";

export interface GovernorConfig {
  slug: string;
  name: string;
  address: string;
  govTokenMint: string;
  customLogoURI?: string;
}

export interface GovernorMeta {
  slug: string;
  name: string;
  address: string;
  govToken: TokenInfo;
  iconURL: string;
}
