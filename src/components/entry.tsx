"use client"
import { Entry } from "@/api";
import Link from 'next/link';
import React from 'react';
import { createNotebook } from "@/notebook";


export const compileMarkdown = async (markDown: string, element: HTMLElement) => {
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
  const refElement = React.useRef<HTMLElement | null>(null);
  const setRef = (element: HTMLElement | null) => {
    refElement.current = element;
    if (element) compileMarkdown(entry.body, element);
  };
  return (
    <div>
      <h1>{entry.title}</h1>
      <div ref={setRef} />
    </div>
  );
}
