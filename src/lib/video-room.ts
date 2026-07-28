import crypto from "node:crypto";

// Free, no-API-key video rooms via Jitsi Meet — the spec asked for "WhatsApp
// Video by default" but there's no public API to create a WhatsApp video
// room, so this is the agreed deviation. Room names on meet.jit.si are
// unauthenticated (anyone who knows the URL can join), so use enough random
// bytes that guessing is infeasible.
export function generateVideoRoomUrl(): string {
  return `https://meet.jit.si/rollup-${crypto.randomBytes(8).toString("hex")}`;
}
