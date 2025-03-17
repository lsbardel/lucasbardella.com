import { getPostBySlug, getPosts } from "@/api/compile";
import Container from "@/components/container";
import { EntryComponent } from "@/components/entry";
import { Metadata } from "next";
import { notFound } from "next/navigation";


type Params = {
  params: Promise<{
    slug: string;
  }>;
};


const Page = async (props: Params) => {
  const params = await props.params;
  const entry = await getPostBySlug("pages", params.slug);

  if (!entry) {
    return notFound();
  }

  return (
    <Container><EntryComponent entry={entry}></EntryComponent></Container>
  )
}


export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = await getPostBySlug("pages", params.slug);

  if (!post) {
    return notFound();
  }

  return {
    title: post.title,
    openGraph: {
      title: post.title,
      images: [post.ogImage.url],
    },
  };
}


export const generateStaticParams = async () => {
  const posts = await getPosts("pages");

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default Page;
