export type DeployHookResult = {
  triggered: boolean;
  message: string;
};

export async function triggerContentDeployment(): Promise<DeployHookResult> {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL?.trim();
  if (!hook) {
    return {
      triggered: false,
      message: "The public site is updated from the database. A crawler rebuild hook is not configured yet.",
    };
  }

  let url: URL;
  try {
    url = new URL(hook);
  } catch {
    return { triggered: false, message: "The crawler rebuild hook is not a valid URL." };
  }
  if (url.protocol !== "https:" || url.hostname !== "api.vercel.com" || !url.pathname.startsWith("/v1/integrations/deploy/")) {
    return { triggered: false, message: "The crawler rebuild hook is not an approved Vercel Deploy Hook URL." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { method: "POST", signal: controller.signal, redirect: "error" });
    if (!response.ok) return { triggered: false, message: "The content was saved, but Vercel did not accept the crawler rebuild request." };
    return { triggered: true, message: "The public content is live and a crawler-ready Vercel rebuild has started." };
  } catch {
    return { triggered: false, message: "The content was saved, but the crawler rebuild request could not be completed." };
  } finally {
    clearTimeout(timeout);
  }
}
