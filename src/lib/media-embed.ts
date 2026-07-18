// Only a fixed allowlist of 3D-tour hosts may be embedded — the URL ends up
// in an <iframe src>, so an open allowlist would let a lister point it at an
// arbitrary (or malicious) page.
const ALLOWED_TOUR_HOSTS = [
  "my.matterport.com",
  "matterport.com",
  "kuula.co",
  "momento360.com",
  "cloudpano.com",
];

export function isAllowedTourUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return ALLOWED_TOUR_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

// Normalizes a YouTube/Vimeo share link into its iframe-embeddable form.
// Returns null if the URL isn't a supported, embeddable video host.
export function toVideoEmbedUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtube.com") {
    const id = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.split("/").filter(Boolean).pop();
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop();
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}
