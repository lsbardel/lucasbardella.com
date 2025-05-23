import { utcFormat } from "d3-time-format";

const formatDate = utcFormat("%B %d, %Y %H:%M:%S");


const footer = (config: Record<string, any>) => {

  return ({path}) => {
    const date = new Date();
    let fullPath = `${path}.md`;
    const bits = path.split("/").filter((v) => v!=="");
    if (bits[0] === "lab" || bits[0] == "blog") {
      fullPath = `/${bits[0]}/${bits[2]}.md`;
    }
    const fullUrl = `${config.homepage}/blob/main/content${fullPath}`;
    const buildUrl = `${config.homepage}/actions/runs/${process.env.GITHUB_RUN_ID}`;
    const buildTime = formatDate(new Date());
    return `
      <hr>
      <p>Made with <a href="https://observablehq.com/framework">Observable Framework</a></p>
      <p>Last build © <a href=${buildUrl}>${buildTime} UTC</a></p>
      <p>Source code available on <a href="${fullUrl}">${fullUrl}</a></p>
      <p>© 2009-${date.getFullYear()} ${config.author}</p>
      <script async src="https://www.googletagmanager.com/gtag/js?id=${config.ga.measurementId}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.ga.measurementId}');
      </script>
    `;
  };
}


export default footer;
