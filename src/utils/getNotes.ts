import { getCollection, type CollectionEntry } from "astro:content";
import getLastUpdated from "./getLastUpdated";

export type Note = CollectionEntry<"notes"> & { lastUpdated: Date };

// All published notes, alphabetical by title.
const getNotes = async (): Promise<Note[]> => {
  const pages = await getCollection("notes", ({ data }) => !data.draft);
  return pages
    .map(page => ({ ...page, lastUpdated: getLastUpdated(page.filePath) }))
    .sort((a, b) => a.data.title.localeCompare(b.data.title));
};

export const byRecentlyUpdated = (pages: Note[]) =>
  [...pages].sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

export default getNotes;
