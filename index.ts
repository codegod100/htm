import homepage from "./index.html";
import callback from "./callback.html";
import { metadata } from "./lib";

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

    return Response.json({ yolo: "molo" });
  },
});
