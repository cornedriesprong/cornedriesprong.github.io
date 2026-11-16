import { getCollection } from "astro:content";
import generateOgImage from "@utils/generateOgImage";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) =>
  new Response(await generateOgImage(params.ogTitle), {
    headers: { "Content-Type": "image/svg+xml" },
  });

export async function getStaticPaths() {
  const pages = await getCollection("notes", ({ data }) => !data.draft);
  return pages
    .filter(({ data }) => !data.ogImage)
    .map(({ data }) => ({
      params: { ogTitle: data.title },
    }));
}
