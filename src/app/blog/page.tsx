import { getPosts } from "@/api/compile";
import Container from "@/components/container";
import { Preview } from "@/components/entry";

const Page = async () => {
  const posts = await getPosts("blog");
  return (
    <Container>{posts.map((entry, index) => <Preview key={index} entry={entry}/>)}</Container>
  )
}


export default Page;
