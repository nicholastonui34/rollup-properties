import crypto from "node:crypto";

export const CLOUDINARY_FOLDER = "rollup-properties/listings";
export const CLOUDINARY_EVIDENCE_FOLDER = "rollup-properties/verification-evidence";

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env."
    );
  }
  return { cloudName, apiKey, apiSecret };
}

// Signature per https://cloudinary.com/documentation/authentication_signatures —
// sign every param except file/api_key/resource_type/cloud_name, sorted alphabetically.
export function signUpload(params: Record<string, string | number>) {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const signature = crypto
    .createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
  return { cloudName, apiKey, signature };
}

export async function deleteCloudinaryImage(publicId: string) {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const { signature } = signUpload({ public_id: publicId, timestamp });

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body }
  );
  if (!res.ok) {
    console.error("cloudinary destroy failed", await res.text());
  }
}
