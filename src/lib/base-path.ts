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

  return "";
}

export function withBasePath(pathname: string): string;
export function withBasePath(pathname: undefined): undefined;
export function withBasePath(pathname: string | undefined): string | undefined {
  if (pathname === undefined) return undefined;
  if (pathname === "") return "";

  if (pathname.startsWith("http://") || pathname.startsWith("https://") || pathname.startsWith("data:") || pathname.startsWith("#")) {
    return pathname;
  }

  const basePath = getBasePath();
  if (!basePath) return pathname;

  if (!pathname.startsWith("/")) return pathname;
  return `${basePath}${pathname}`;
}
