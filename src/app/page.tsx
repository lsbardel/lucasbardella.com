import { getPostBySlug } from "@/api/compile";
import Container from "@/components/container";
import { EntryComponent } from "@/components/entry";
import { notFound } from "next/navigation";



const Page = async () => {
  const entry = await getPostBySlug("pages", "index");

  if (!entry) {
    return notFound();
  }

  return (
    <Container><EntryComponent entry={entry}></EntryComponent></Container>
  )
}

export default Page;
