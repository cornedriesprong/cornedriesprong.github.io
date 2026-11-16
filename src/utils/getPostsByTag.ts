import { slugifyAll } from "./slugify";
import type { Note } from "./getNotes";

const getPostsByTag = (pages: Note[], tag: string) =>
  pages.filter(page => slugifyAll(page.data.tags).includes(tag));

export default getPostsByTag;
