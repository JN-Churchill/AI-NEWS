const placeholderHosts = new Set(["example.com", "example.org", "example.net", "www.example.com", "your-domain.example"]);

function normalizeHost(value: string) {
  return value.toLowerCase().replace(/^www\./, "");
}

export function getProductionSiteUrlProblem(value: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return "NEXT_PUBLIC_SITE_URL must be a valid absolute URL for --production audits.";
  }

  const hostname = normalizeHost(url.hostname);

  if (url.protocol !== "https:") {
    return "NEXT_PUBLIC_SITE_URL must use https for --production audits.";
  }

  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local")) {
    return "NEXT_PUBLIC_SITE_URL must be a production URL for --production audits.";
  }

  if (placeholderHosts.has(hostname) || hostname.endsWith(".example")) {
    return "NEXT_PUBLIC_SITE_URL must not use an example or placeholder domain for --production audits.";
  }

  return null;
}

export function getProductionContactEmailProblem(value: string | undefined) {
  const email = value?.trim() ?? "";

  if (!email) {
    return "NEXT_PUBLIC_CONTACT_EMAIL is required for --production audits.";
  }

  const match = email.match(/^[^\s@]+@([^\s@]+\.[^\s@]+)$/);

  if (!match) {
    return "NEXT_PUBLIC_CONTACT_EMAIL must be a valid email address for --production audits.";
  }

  const domain = normalizeHost(match[1]);

  if (placeholderHosts.has(domain) || domain.endsWith(".example")) {
    return "NEXT_PUBLIC_CONTACT_EMAIL must not use an example or placeholder domain for --production audits.";
  }

  return null;
}
