import { visit } from "unist-util-visit";

/**
 * Observable Framework renders ```tex fenced blocks as display maths. Astro has
 * no such convention, so rewrite those code nodes into the element rehype-katex
 * looks for: a div carrying the `math-display` class with the raw TeX as its
 * only child. Emitting the hast shape directly, rather than a bare `math` node,
 * avoids relying on a mdast-to-hast handler being registered for that type.
 *
 * This is what lets the existing pages port without touching their source.
 */
export default function remarkTexBlocks() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "tex" || !parent || index === null) return;
      parent.children[index] = {
        type: "math",
        value: node.value,
        data: {
          hName: "div",
          hProperties: { className: ["math", "math-display"] },
          hChildren: [{ type: "text", value: node.value }],
        },
      };
    });
  };
}
