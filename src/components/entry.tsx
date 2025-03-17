import { Entry } from "@/api";
import Link from 'next/link';
import React from 'react';
import { createNotebook } from "@metablock/notebook";

const library = {};

export const compileMarkdown = async (markDown: string, element: any) => {
  const notebook = createNotebook("dark");
  return await notebook.render(markDown, element);
}



export const Preview = ({ entry }: { entry: Entry }) => {
  return (
    <div>
      <Link href={`/${entry.content}/${entry.slug}`}>{entry.title}</Link>
    </div>
  );
}

export const EntryComponent = ({ entry }: { entry: Entry }) => {
  const refElement = React.useRef<any>(null);
  const setRef = async (element: any) => {
    refElement.current = element;
    if (element) await compileMarkdown(entry.body, element);
  };
  return (
    <div>
      <h1>{entry.title}</h1>
      <div ref={setRef} />
    </div>
  );
}
