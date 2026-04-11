/**
 * React Server Component example (Next.js App Router style).
 * Copy into `app/page.tsx` (or rename accordingly). No "use client".
 *
 * Install: npm install @hamdymohamedak/openfetch
 */

import openFetch from "@hamdymohamedak/openfetch";

export default async function Page() {
  const res = await openFetch.get("https://httpbin.org/json", {
    unwrapResponse: true,
  });

  return <pre>{JSON.stringify(res, null, 2)}</pre>;
}
