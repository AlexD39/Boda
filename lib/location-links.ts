type LocationConfig = {
  venue: string;
  address: string;
  mapsUrl: string;
  venueWebsiteUrl: string;
};

function safeHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function isGoogleMapsUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return host === "maps.app.goo.gl"
      || host === "maps.google.com"
      || (host === "goo.gl" && url.pathname.startsWith("/maps"))
      || (host.includes("google.") && url.pathname.startsWith("/maps"));
  } catch {
    return false;
  }
}

export function getEmbeddedMapsUrl(value: string) {
  const candidates = value.match(/https?:\/\/[^\s]+/gi) || [];
  for (const candidate of candidates) {
    const cleaned = candidate.replace(/[),.;]+$/g, "");
    if (isGoogleMapsUrl(cleaned)) return cleaned;
  }
  return "";
}

export function getAddressWithoutMapsUrl(value: string) {
  const mapsUrl = getEmbeddedMapsUrl(value);
  if (!mapsUrl) return value.trim();
  return value
    .replace(mapsUrl, "")
    .replace(/\s*,\s*$/g, "")
    .replace(/^\s*,\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function getVenueWebsiteUrl(config: Pick<LocationConfig, "venueWebsiteUrl">) {
  return safeHttpUrl(config.venueWebsiteUrl);
}

export function getMapsUrl(config: Pick<LocationConfig, "mapsUrl" | "address" | "venue">) {
  const configuredUrl = safeHttpUrl(config.mapsUrl)
    || getEmbeddedMapsUrl(config.mapsUrl)
    || getEmbeddedMapsUrl(config.address);
  if (configuredUrl) return configuredUrl;
  const query = [config.venue, getAddressWithoutMapsUrl(config.address)].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
