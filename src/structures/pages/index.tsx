import React, { ReactNode, useState } from 'react';
import tw from 'twin.macro';
import {
  BarChart,
  ChoroplethMap,
  HeatMap,
  HomePage,
  ScatterplotGraph,
  SEO,
  TreemapDiagram,
} from '../components';

/* --------------------------------- styles --------------------------------- */

const StyledNavA = tw.a`rounded-lg px-3 py-2 text-slate-700 font-medium hover:bg-slate-100 hover:text-slate-900`;
const Input = () => <input tw="border hover:border-black bg-black" />;

/* ---------------------------------- types --------------------------------- */

type NavArrayLayout = [[number, string, string, ReactNode]];

/* -------------------------------- component ------------------------------- */

const IndexPage = () => {
  const [currentGraph, setCurrentGraph] = useState<ReactNode>(HomePage);

  const handleClick = (project: ReactNode) => {
    setCurrentGraph(project);
  };

  return (
    <>
      <h1 tw="text-red-100">Data Visualization</h1>
      <nav>
        {(
          [
            [0, 'Home', '#', HomePage],
            [1, 'Bar Chart', '#bar-chart', BarChart],
            [2, 'Scatterplot Graph', '#scatterplot-graph', ScatterplotGraph],
            [3, 'Heat Map', '#heat-map', HeatMap],
            [4, 'Choropleth Map', '#choropleth-map', ChoroplethMap],
            [5, 'Treemap Diagram', '#treemap-diagram', TreemapDiagram],
          ] as unknown as NavArrayLayout
        ).map(([index, title, url, project]) => (
          <StyledNavA key={index} href={url} onClick={() => handleClick(project)}>
            {title}
          </StyledNavA>
        ))}
      </nav>
      <Input />
      <div>{currentGraph}</div>
    </>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default IndexPage;

export const Head = () => <SEO title="Home Page" />;
