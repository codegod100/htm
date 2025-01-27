import homepage from "./index.html";
import callback from "./callback.html";
import { getProfile, metadata } from "./lib";

Bun.serve({
  static: {
    "/": homepage,
    "/callback": callback,
  },

  async fetch(req) {
    // ... api requests
    if (new URL(req.url).pathname == "/client-metadata.json") {
      const meta = await metadata();
      return Response.json(meta);
    }
    const handleMatch = /^\/profile\/([^\/]+)$/.exec(new URL(req.url).pathname);
    if (handleMatch) {
      const profile = await getProfile(handleMatch[1]);
      return Response.json({ profile });
    }

    return Response.json({ yolo: "molo" });
  },
  development: true,
});
