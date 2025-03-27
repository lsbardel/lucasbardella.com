import ContentLoader from "../src/content";

const blog = await ContentLoader.load({}, "blog");

blog.emitList("Blog");
