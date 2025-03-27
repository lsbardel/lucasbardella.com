import ContentLoader from "../src/content";

const blog = await ContentLoader.load({}, "coding");

blog.emitList("Coding");
