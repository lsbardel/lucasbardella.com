import ContentLoader from "../src/content";

const blog = await ContentLoader.load({}, "lab");

blog.emitList("Lab");
