import "@atcute/bluesky/lexicons";
import { CredentialManager, XRPC } from "@atcute/client";
import type { AppBskyActorDefs } from "@atproto/api";
import {
  configureOAuth,
  createAuthorizationUrl,
  finalizeAuthorization,
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
