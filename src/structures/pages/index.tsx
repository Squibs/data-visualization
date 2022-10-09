import React, { ReactNode, useState } from 'react';
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

/* ---------------------------------- types --------------------------------- */

type NavArrayLayout = [[string, string, ReactNode]];

/* -------------------------------- component ------------------------------- */

const IndexPage = () => {
  const [currentGraph, setCurrentGraph] = useState<ReactNode>(HomePage);

  const handleClick = (project: ReactNode) => {
    setCurrentGraph(project);
  };

  return (
    <>
      <h1>Data Visualization</h1>
      <nav>
        {(
          [
            ['Home', '#', HomePage],
            ['Bar Chart', '#bar-chart', BarChart],
            ['Scatterplot Graph', '#scatterplot-graph', ScatterplotGraph],
            ['Heat Map', '#heat-map', HeatMap],
            ['Choropleth Map', '#choropleth-map', ChoroplethMap],
            ['Treemap Diagram', '#treemap-diagram', TreemapDiagram],
          ] as unknown as NavArrayLayout
        ).map(([title, url, project]) => (
          <a href={url} onClick={() => handleClick(project)}>
            {title}
          </a>
        ))}
      </nav>
      <div>{currentGraph}</div>
    </>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default IndexPage;

export const Head = () => <SEO title="Home Page" />;
