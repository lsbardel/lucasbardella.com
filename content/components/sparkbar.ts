import { html } from "npm:htl";

export const sparkbar = (max: number, color: string, formatter?: (x: number) => string) => {
  const format = formatter || ((x: number) => x.toLocaleString("en"));
  return (x: number) =>
    html`<div
      style="
    background: ${color};
    width: ${(100 * x) / max}%;
    float: right;
    padding-right: 3px;
    box-sizing: border-box;
    overflow: visible;
    display: flex;
    justify-content: end;"
    >
      ${format(x)}
    </div>`;
};
