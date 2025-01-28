import homepage from "./index.html";
import callback from "./callback.html";
import template from "./template.html";
import main from "./templates/main.html";
import cards from "./templates/cards.html";

import { getProfile, listRecords, metadata } from "./lib";
import { layout } from "./utils";
import type { HTMLBundle } from "bun";
console.log("http://localhost:3000");
Bun.serve({
  static: {
    "/": main,
    "/callback": callback,
    "/cards": cards,
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
    const recordsMatch = /^\/records\/([^\/]+)\/([^\/]+)$/.exec(
      new URL(req.url).pathname,
    );
    if (recordsMatch) {
      const [_, repo, collection] = recordsMatch;
      const records = await listRecords(repo, collection);
      return Response.json(records);
    }
    return Response.json({ yolo: "molo" });
  },
  development: true,
});
