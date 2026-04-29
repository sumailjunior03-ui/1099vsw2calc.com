// Site configuration (static)
export const SITE_NAME = "1099 vs W-2 Take‑Home Calculator";
export const SITE_DOMAIN = "1099vsw2calc.com";
export const SITE_CANONICAL = `https://${SITE_DOMAIN}/`;

export const PARTNERSHIPS_EMAIL = "partnerships@calc-hq.com";

// Global config for ads.js (non-module scripts can't read ES exports)
window.SITE_CONFIG = {
  ADS_ACTIVE: false,
  SPONSOR_ACTIVE: false,
  ADSENSE_PUB_ID: "ca-pub-7744853829365165",
  AD_SLOT_TOP: "",
  AD_SLOT_BOTTOM: ""
};
