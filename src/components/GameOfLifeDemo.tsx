import * as d3 from "d3";
import * as React from "react";
import { useRemote } from "./inputs";
import GameOfLife from "./life";

interface Props {
  /** File name under public/assets/game-of-life, without the extension. */
  pattern: string;
  speed: number;
  aspectRatio: string;
}

/**
 * Replaces the Observable attachments
 *
 *   const pulsar = FileAttachment(`../../data/game-of-life/pulsar.csv`).csv({typed: true});
 *
 * one per pattern, each then passed to a display cell.
 */
const GameOfLifeDemo = ({ pattern, speed, aspectRatio }: Props) => {
  const cells = useRemote(`/assets/game-of-life/${pattern}.csv`, (text) =>
    d3.csvParse(text, d3.autoType) as unknown as { i: number; j: number }[],
  );
  if (!cells) return <p>Loading the {pattern} pattern…</p>;
  return <GameOfLife pattern={cells} speed={speed} aspectRatio={aspectRatio} />;
};

export default GameOfLifeDemo;
