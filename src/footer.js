const footer = (config) => {

  return ({path}) => {
    let fullPath = `${path}.md`;
    const bits = path.split("/").filter((v) => v!=="");
    if (bits[0] === "lab" || bits[0] == "blog") {
      fullPath = `/${bits[0]}/${bits[2]}.md`;
    }
    const fullUrl = `${config.homepage}/blob/main/content${fullPath}`;
    return `
      <p>Made with <a href="https://observablehq.com/framework">Observable Framework</a> - last build © ${new Date().toISOString()}</p>
      <p>Source code available on <a href="${fullUrl}">${fullUrl}</a></p>
      <script async src="https://www.googletagmanager.com/gtag/js?id=${config.gtag}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.gtag}');
      </script>
    `;
  };
}


export default footer;
