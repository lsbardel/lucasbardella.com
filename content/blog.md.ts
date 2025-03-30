import ContentLoader from "../lsts/content";

const blog = await ContentLoader.load({}, "blog");

blog.emitList("Blog");
