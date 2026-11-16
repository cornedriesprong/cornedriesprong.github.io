import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";

const getUniqueTags = (pages: CollectionEntry<"notes">[]) => [
  ...new Set(pages.flatMap(page => page.data.tags.map(slugifyStr))),
];

export default getUniqueTags;
