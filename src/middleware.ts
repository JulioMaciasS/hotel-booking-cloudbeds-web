// NOTE: This file intentionally uses the `middleware` convention, not Next.js
// 16's `proxy`. Next ignores the deprecation warning here on purpose: `proxy`
// runs only on the Node.js runtime, which the Cloudflare Workers adapter
// (@opennextjs/cloudflare) does not yet support. `middleware` runs on Edge,
// which OpenNext requires. Do not rename to `proxy` until OpenNext supports
// Node.js middleware, or the Cloudflare build will fail.
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
