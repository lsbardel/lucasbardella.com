import ContentLoader from "../lsts/content";

const blog = await ContentLoader.load({}, "lab");

blog.emitList("Lab");
