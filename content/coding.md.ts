import ContentLoader from "../lsts/content";

const blog = await ContentLoader.load({}, "coding");

blog.emitList("Coding");
