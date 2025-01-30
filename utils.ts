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

export type Card = {
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
// Command: mutates array in place
function sortInPlace<T>(array: T[], left = 0, right = array.length - 1): void {
  if (left < right) {
    const pivotIndex = partition(array, left, right);
    sortInPlace(array, left, pivotIndex - 1);
    sortInPlace(array, pivotIndex + 1, right);
  }
}

// Query: return// New array and pivot index are returned. This function handles one partition step for quicksort
// without modifying original array. Takes array to partition and left/right bounds, copies array,
// sorts elements around pivot within those bounds, returns new partitioned array and pivot index.s new array
function partition_rt<T>(
  array: T[],
  left: number,
  right: number,
): [T[], number] {
  const copy = [...array];
  const pivot = copy[right];
  let i = left - 1;

  for (let j = left; j < right; j++) {
    if (copy[j] <= pivot) {
      i++;
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
  }
  [copy[i + 1], copy[right]] = [copy[right], copy[i + 1]];
  return [copy, i + 1];
}
// Query: returns new sorted array
function sort<T>(array: T[]): T[] {
  const copy = [...array];
  sortInPlace(copy);
  return copy;
}

function quicksort<T>(array: T[], left = 0, right = array.length - 1): T[] {
  if (left < right) {
    const pivotIndex = partition(array, left, right);
    quicksort(array, left, pivotIndex - 1);
    quicksort(array, pivotIndex + 1, right);
  }
  return array;
}

function partition<T>(array: T[], left: number, right: number): number {
  const pivot = array[right];
  let i = left - 1;

  for (let j = left; j < right; j++) {
    if (array[j] <= pivot) {
      i++;
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  [array[i + 1], array[right]] = [array[right], array[i + 1]];
  return i + 1;
}
