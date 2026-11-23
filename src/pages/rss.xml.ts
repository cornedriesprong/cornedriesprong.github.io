import rss from "@astrojs/rss";
import getNotes, { byRecentlyUpdated } from "@utils/getNotes";
import slugify from "@utils/slugify";
import toFeedHtml from "@utils/toFeedHtml";
import { SITE } from "@config";

export async function GET() {
  const notes = byRecentlyUpdated(await getNotes());
  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: notes.map(({ data, lastUpdated, rendered }) => {
      const link = `notes/${slugify(data)}/`;
      return {
        link,
        title: data.title,
        description: data.description,
        pubDate: lastUpdated,
        content: toFeedHtml(
          rendered?.html ?? "",
          new URL(link, SITE.website).href
        ),
      };
    }),
  });
}
