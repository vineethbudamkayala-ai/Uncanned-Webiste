import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Incremental cache, tag cache, and queue can be added here later
  // (e.g. R2 / KV / D1 backed). Defaults are fine for a static-ish marketing site.
});
