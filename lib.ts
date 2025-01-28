import "@atcute/bluesky/lexicons";
import { CredentialManager, XRPC } from "@atcute/client";
import type { AppBskyActorDefs } from "@atproto/api";
import * as TID from "@atcute/tid";
import {
  configureOAuth,
  createAuthorizationUrl,
  finalizeAuthorization,
  getSession,
  OAuthUserAgent,
  resolveFromIdentity,
  type Session,
} from "@atcute/oauth-browser-client";
import type {
  ComAtprotoIdentityResolveHandle,
  ComAtprotoRepoListRecords,
} from "@atcute/client/lexicons";
export type Metadata = {
  client_name: string;
  client_id: string;
  client_uri: string;
  redirect_uri: string;
  redirect_uris: [string, ...string[]];
  scope: string;
  grant_types: ["authorization_code", "refresh_token"];
  response_types: ["code"];
  application_type: "web";
  token_endpoint_auth_method: "none";
  dpop_bound_access_tokens: boolean;
};

export async function metadata(): Promise<Metadata> {
  const publicUrl = process.env.PUBLIC_URL;
  const port = process.env.PORT || 3000;
  const url = publicUrl || `http://127.0.0.1:${port}`;
  const enc = encodeURIComponent;
  return {
    client_name: "nandi oauth",
    client_id: publicUrl
      ? `${url}/client-metadata.json`
      : `http://localhost?redirect_uri=${enc(`${url}/callback`)}&scope=${enc(
          "atproto transition:generic",
        )}`,

    client_uri: url,
    redirect_uri: `${url}/callback`,
    redirect_uris: [`${url}/callback`],
    scope: "atproto transition:generic",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    application_type: "web",
    token_endpoint_auth_method: "none",
    dpop_bound_access_tokens: true,
  };
}

export async function authorizationUrl(
  handle: string,
  metadata: Metadata,
): Promise<URL> {
  configureOAuth({ metadata });
  const res = await resolveFromIdentity(handle);
  return await createAuthorizationUrl({
    metadata: res.metadata,
    identity: res.identity,
    scope: "atproto transition:generic",
  });
}

export async function finalize(
  params: URLSearchParams,
  metadata: Metadata,
): Promise<Session> {
  configureOAuth({ metadata });
  return await finalizeAuthorization(params);
}

export async function getProfile(
  actor: string,
): Promise<AppBskyActorDefs.ProfileViewDetailed> {
  const manager = new CredentialManager({
    service: "https://public.api.bsky.app",
  });
  const rpc = new XRPC({ handler: manager });
  const { data } = await rpc.get("app.bsky.actor.getProfile", {
    params: {
      actor,
    },
  });
  return data as AppBskyActorDefs.ProfileViewDetailed;
}

export async function listRecords(
  repo: string,
  collection: string,
): Promise<ComAtprotoRepoListRecords.Output> {
  const manager = new CredentialManager({
    service: "https://bsky.social",
  });
  const rpc = new XRPC({ handler: manager });
  const { data } = await rpc.get("com.atproto.repo.listRecords", {
    params: {
      repo,
      collection,
    },
  });
  return data;
}

export async function resolveHandle(
  handle: string,
): Promise<ComAtprotoIdentityResolveHandle.Output> {
  const manager = new CredentialManager({
    service: "https://bsky.social",
  });
  const rpc = new XRPC({ handler: manager });
  const { data } = await rpc.get("com.atproto.identity.resolveHandle", {
    params: {
      handle,
    },
  });
  return data;
}

export function cdnImage(did: string, link: string): string {
  return `https://cdn.bsky.app/img/feed_thumbnail/plain/${did}/${link}`;
}

type PostContext = {
  text: string;
  metadata: Metadata;
  image?: Blob;
  handle: string;
};

async function UrlPreview(url: string): Promise<Link> {
  const resp = await fetch(
    `https://cardyb.bsky.app/v1/extract?url=${url}`,
  ).then((r) => r.json());
  return resp;
}

type Link = { url: string; image: string; title: string; description: string };
async function parseText(text: string): Promise<Link[]> {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  const previews: Link[] = [];
  for (const part of parts) {
    if (part.match(/^https?:\/\//)) {
      previews.push(await UrlPreview(part));
    }
  }
  return previews;
}

export async function post({ text, metadata, image, handle }: PostContext) {
  configureOAuth({ metadata });
  const { identity } = await resolveFromIdentity(handle);
  const session = await getSession(identity.id, {
    allowStale: true,
  });
  const agent = new OAuthUserAgent(session);
  const rpc = new XRPC({ handler: agent });

  let imageRecord = null;
  if (image && image.size !== 0) {
    const resp = await rpc.call("com.atproto.repo.uploadBlob", {
      data: image,
    });
    console.log({ resp });
    // const link = resp.data.blob.ref.$link;

    imageRecord = {
      $type: "blob",
      ref: {
        $link: resp.data.blob.ref.$link,
      },
      mimeType: resp.data.blob.mimeType,
      size: image.size,
    };
  }
  const links = await parseText(text);

  await rpc.call("com.atproto.repo.putRecord", {
    data: {
      repo: session.info.sub,
      collection: "nandi.schemas.card",
      rkey: TID.now(),
      record: {
        $type: "nandi.schemas.card",
        text,
        image: imageRecord,
        links,
      },
      validate: false,
    },
  });
}
