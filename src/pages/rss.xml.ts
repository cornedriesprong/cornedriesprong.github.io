import rss from "@astrojs/rss";
import getNotes, { byRecentlyUpdated } from "@utils/getNotes";
import slugify from "@utils/slugify";
import { SITE } from "@config";

export async function GET() {
  const notes = byRecentlyUpdated(await getNotes());
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: notes.map(({ data, lastUpdated }) => ({
      link: `notes/${slugify(data)}`,
      title: data.title,
      description: data.description,
      pubDate: lastUpdated,
    })),
  });
}
