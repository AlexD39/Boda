import type { InvitationConfig } from "./invitation-config";

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function getVenueWebsiteUrl(config: Pick<InvitationConfig, "venueWebsiteUrl">) {
  return safeHttpUrl(config.venueWebsiteUrl);
}

export function getMapsUrl(config: Pick<InvitationConfig, "mapsUrl" | "address" | "venue">) {
  const configuredUrl = safeHttpUrl(config.mapsUrl);
  if (configuredUrl) return configuredUrl;
  const query = [config.venue, config.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
