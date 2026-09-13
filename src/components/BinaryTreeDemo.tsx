import * as React from "react";

interface Props {
  aspectRatio?: string;
}

/**
 * Replaces the Observable block
 *
 *   import "../../components/binary-tree.js";
 *   <binary-tree-animation aspect-ratio="70%"></binary-tree-animation>
 *
 * binary-tree.js defines a custom element as a side effect of being imported,
 * which Observable did on the page itself. Here the import is deferred to the
 * browser so the definition never runs during the static build, and the element
 * upgrades itself once it lands. `createElement` avoids having to declare the
 * tag to JSX for a single use.
 */
const BinaryTreeDemo = ({ aspectRatio = "70%" }: Props) => {
  React.useEffect(() => {
    import("./binary-tree.js");
  }, []);
  return React.createElement("binary-tree-animation", { "aspect-ratio": aspectRatio });
};

export default BinaryTreeDemo;
