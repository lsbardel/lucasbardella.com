
const head = (config: Record<string, any>) => {

  return ({path, title}) => {

    return `
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
      tailwind.config = {
        corePlugins: {
          preflight: false
        }
      };
      </script>
      <link rel="icon" href="data/luca-32x32.png" type="image/png" sizes="32x32">
      <meta property="og:title" content="${title || config.author}">
      <meta name="google-adsense-account" content="ca-pub-9518486636408101">
    `;
  };
}

const og_image = (path) => {
  try {
    // computes the same hash as framework 🌶
    const contents = readFileSync(join(SRC_ROOT, `thumbnail${path}.png`));
    const key = createHash("sha256").update(contents).digest("hex").slice(0, 8);
    const esc_img = JSON.stringify(`${HTTP_ROOT}_file/thumbnail${path}.${key}.png`);
    return `<link href="/thumbnail${path}.png">
<meta property="og:image" content=${esc_img} />
<meta property="twitter:image" content=${esc_img} />
`;
  } catch (error) {
    return "";
  }
}

export default head;
