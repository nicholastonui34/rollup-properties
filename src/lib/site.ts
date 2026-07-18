// Falls back to localhost in dev; set NEXT_PUBLIC_SITE_URL once a domain/deploy URL exists (M8).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3600").replace(/\/$/, "");

export const SITE_NAME = "Rollup Properties";
