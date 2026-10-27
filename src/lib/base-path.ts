export function getBasePath(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (configured) {
    const normalized = configured.replace(/^\/+|\/+$/g, "");
    return normalized ? `/${normalized}` : "";
  }

  return getRuntimeBasePath();
}

function getRuntimeBasePath(): string {
  const assetPrefix = (globalThis as { __NEXT_DATA__?: { assetPrefix?: string } }).__NEXT_DATA__?.assetPrefix;
  if (!assetPrefix) return "";

  const normalized = assetPrefix.replace(/^\/+|\/+$/g, "");
  return normalized ? `/${normalized}` : "";
}

export const LOGO_PATH = "/logo.png";

export function getLogoPath(): string {
  return withBasePath(LOGO_PATH) ?? LOGO_PATH;
}

export function withBasePath(pathname: string): string;
export function withBasePath(pathname: undefined): undefined;
export function withBasePath(pathname: string | undefined): string | undefined {
  if (pathname === undefined) return undefined;
  if (pathname === "") return "";

  if (
    pathname.startsWith("http://") ||
    pathname.startsWith("https://") ||
    pathname.startsWith("data:") ||
    pathname.startsWith("#")
  ) {
    return pathname;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const basePath = getBasePath();
  if (!basePath) return normalizedPath;

  const normalizedBasePath = basePath.replace(/\/+$/, "");
  if (normalizedPath === normalizedBasePath || normalizedPath.startsWith(`${normalizedBasePath}/`)) {
    return normalizedPath;
  }
  return `${normalizedBasePath}${normalizedPath}`;
}
