import type { Element, ElementContent } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { SKIP, visit } from "unist-util-visit";

const hasClass = (node: Element, name: string) =>
  Array.isArray(node.properties.className) &&
  node.properties.className.includes(name);

const absolute = (url: unknown, base: string) => {
  if (typeof url !== "string") return url;
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
};

const toFeedHtml = (html: string, noteUrl: string) => {
  const tree = fromHtml(html, { fragment: true });

  visit(tree, "element", (node, index, parent) => {
    if (!parent || index === undefined) return;

    if (
      node.tagName === "script" ||
      node.tagName === "style" ||
      node.tagName === "annotation" ||
      hasClass(node, "katex-html")
    ) {
      parent.children.splice(index, 1);
      return [SKIP, index];
    }

    delete node.properties.style;
    delete node.properties.className;
    delete node.properties.tabIndex;
    delete node.properties.dataLanguage;

    if ("href" in node.properties) {
      node.properties.href = absolute(node.properties.href, noteUrl) as string;
    }
    if ("src" in node.properties) {
      node.properties.src = absolute(node.properties.src, noteUrl) as string;
    }
  });

  return toHtml(tree);
};

export default toFeedHtml;
