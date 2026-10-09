export function getBasePath(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (configured) {
    const normalized = configured.replace(/^\/+|\/+$/g, "");
    return normalized ? `/${normalized}` : "";
  }

  const githubRepository = process.env.GITHUB_REPOSITORY?.split("/")[1]?.trim();
  if (process.env.GITHUB_ACTIONS === "true" && githubRepository) {
    return `/${githubRepository}`;
  }

  return getRuntimeBasePath();
}

function getRuntimeBasePath(): string {
  const location = globalThis.location;
  if (!location?.pathname || location.pathname === "/") return "";

  const [, firstSegment = ""] = location.pathname.split("/");
  if (!firstSegment || ["collections", "assets", "_next", "api", "favicon.ico"].includes(firstSegment)) {
    return "";
  }

  return `/${firstSegment}`;
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
