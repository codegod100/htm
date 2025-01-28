import { cdnImage, listRecords, resolveHandle } from "./lib";

export function layout(html: string) {
  return new Response(`
  <!doctype html>
  <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <link rel="stylesheet" href="../style.css" />
      </head>
      <body class="container p-2 dark:bg-black dark:text-white">
        ${html}
        <script type="module" src="../app.ts"></script>
      </body>
  </html>
  `);
}

type Card = {
  image?: string;
  value: {
    image?: {
      ref: {
        $link: string;
      };
    };
    text?: string;
    links?: {
      url: string;
      title: string;
      description: string;
      image: string;
    }[];
  };
};
export async function getCards(repo: string): Promise<Card[]> {
  const did = await resolveHandle(repo).then((r) => r.did);
  const cards: Card[] = await listRecords(repo, "nandi.schemas.card").then(
    (r) => r.records as Card[],
  );
  return cards.map((card) => {
    if (card.value.image) {
      card.image = cdnImage(did, card.value.image.ref.$link);
    }
    if (card.value.links) {
      for (const link of card.value.links) {
        link.image = link.image.replace(
          /^https:\/\/cardyb\.bsky\.app\/v1\/image\?url=/,
          "",
        );
        link.image = decodeURIComponent(link.image);
      }
    }
    return card;
  });
}
