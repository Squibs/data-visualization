import React, { useCallback, useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { getDataFromAPI } from '../../utils';

import fakeVideoGameData from '../../../data/data-backup-treemap-diagram-(Video Game Sales).json';
import fakeKickstarterData from '../../../data/data-backup-treemap-diagram-(Kickstarter Pledges).json';
import fakeMovieData from '../../../data/data-backup-treemap-diagram-(Movie Sales).json';

/* --------------------------------- styles --------------------------------- */

const TreemapDiagramPageContainer = styled.div`
  ${tw`w-full`}

  .states {
    fill: none;
    ${tw`stroke-amber-700`}
  }

  .county:hover {
    ${tw`fill-cyan-400`}
  }
`;
const TreemapGraphSelector = tw.div``;
const TreemapDiagramContainer = tw.div`w-full h-auto max-w-screen-xl m-auto`;
const D3TreemapDiagram = tw.svg`w-full h-full`;
const D3TreemapDiagramToolTip = styled.div`
  ${tw`[display: none] absolute p-1 w-fit [max-width: 200px] h-fit bg-white transition text-center text-black
  pointer-events-none border-2 border-solid rounded-md border-black [line-height: 1em]`}

  & hr {
    border-color: #2c2c2c49;
    width: 75%;
    margin: auto;
    ${tw`mt-1 mb-1`}
  }
`;
const DataInformation = tw.ul``;

/* ---------------------------------- types --------------------------------- */

export interface DataFormat {
  name: string;
  children: {
    name: string;
    children: {
      name: string;
      category: string;
      value: string;
    }[];
  }[];
}

/* -------------------------------- component ------------------------------- */

const TreemapDiagram = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoGameData, setVideoGameData] = useState<DataFormat | null>(null);
  const [kickstarterData, setKickStarterData] = useState<DataFormat | null>(null);
  const [movieData, setMovieData] = useState<DataFormat | null>(null);

  const [selectedGraph, setSelectedGraph] = useState<string>('videogame');
  const [currentData, setCurrentData] = useState<DataFormat | null>(null);

  const svgRef = useRef(null);

  const [title, setTitle] = useState<string>('Video Game Sales');
  const [source, setSource] = useState<string>('google.com');
  const [description, setDescription] = useState<string>(
    'Top 100 Most Sold Video Games Grouped by Platform',
  );

  const createTreemapDiagram = (data: DataFormat) => {};

  const handleGraphSwitch = (switchTo: string) => {
    setSelectedGraph(switchTo);
  };

  const graphAndDataHelper = useCallback(() => {
    if (currentData) {
      setLoading(false);
      setError(null);
      createTreemapDiagram(currentData);
    }
  }, [currentData]);

  // once data is retrieved create graph
  useEffect(() => {
    // only if data exists create the diagram; none of this will run on page load
    if (videoGameData || kickstarterData || movieData) {
      switch (selectedGraph) {
        case 'videogame':
          if (videoGameData) {
            setCurrentData(videoGameData);
            graphAndDataHelper();
          }
          break;
        case 'kickstarter':
          if (kickstarterData) {
            setCurrentData(kickstarterData);
            graphAndDataHelper();
          }
          break;
        case 'movie':
          if (movieData) {
            setCurrentData(movieData);
            graphAndDataHelper();
          }
          break;
        default:
          // this will only run if there is no string set for selectedGraph
          setSelectedGraph('videogame');
      }
    }
  }, [currentData, graphAndDataHelper, kickstarterData, movieData, selectedGraph, videoGameData]);

  // retrieve data
  useEffect(() => {
    switch (selectedGraph) {
      case 'videogame':
        // videoGameData ?? getDataFromAPI('videogame');
        setVideoGameData(fakeVideoGameData);
        setTitle('Video Game Sales');
        setSource('google.com');
        setDescription('Top 100 most sold video games grouped by platform');
        break;
      case 'kickstarter':
        // kickstarterData ?? getDataFromAPI('kickstarter');
        setKickStarterData(fakeKickstarterData);
        setTitle('Kickstarter Pledges');
        setSource('google.com');
        setDescription('Top 100 most pledged kickstarter campaigns grouped by category');
        break;
      case 'movie':
        // movieData ?? getDataFromAPI('movie');
        setMovieData(fakeMovieData);
        setTitle('Movie Sales');
        setSource('google.com');
        setDescription('Top 100 highest grossing movies grouped by genre');
        break;
      default:
        // this would run if there was no string set for selectedGraph
        setSelectedGraph('videogame');
    }
  }, [selectedGraph]);

  // on page load, the default is video game. It will try to fetch the video game data
  // it will display loading while fetching information. if it fails to fetch the information
  // display an error, otherwise display the graph. Can retry to get the graph, or switch to the other graphs
  // by clicking on the buttons. These buttons will switch which graph is displayed.

  // if you click on a button, it will do this same process, but for a different graph.
  // or the same graph if you click on the same button. Data is only fetched if there is no data already
  // so a graph in which data failed to get, you can retry to fetch the data.

  return (
    <TreemapDiagramPageContainer>
      <TreemapGraphSelector>
        <button type="button" onClick={() => handleGraphSwitch('videogame')}>
          Video Game Data
        </button>
        <button type="button" onClick={() => handleGraphSwitch('kickstarter')}>
          Kickstarter Data
        </button>
        <button type="button" onClick={() => handleGraphSwitch('movie')}>
          Movie Data
        </button>
      </TreemapGraphSelector>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {!loading && !error && currentData && (
        <>
          <h1 id="title" tw="text-center text-2xl font-medium">
            {title}
          </h1>
          <h2 id="description" tw="text-center text-xl font-light">
            {description}
          </h2>

          <TreemapDiagramContainer>
            <D3TreemapDiagram ref={svgRef} preserveAspectRatio="xMinYMin meet">
              <g className="plot-area" />
              <g id="x-axis" />
              <g id="y-axis" />
              <g id="legend" />
            </D3TreemapDiagram>
            <D3TreemapDiagramToolTip id="tooltip" />
          </TreemapDiagramContainer>

          <DataInformation>
            <li key="0">
              Size:
              {'\u00A0'}
              <i>
                {(new TextEncoder().encode(JSON.stringify(currentData)).length / 1024).toFixed(2)}
                {'\u00A0'}
                KB
              </i>
            </li>
            <li key="1">
              <i>
                Data:
                <a
                  href={source}
                  tw="text-linkcolor hover:text-cyan-400"
                  target="_blank"
                  rel="noreferrer"
                >
                  {'\u00A0'}
                  Source
                </a>
              </i>
            </li>
          </DataInformation>
        </>
      )}
    </TreemapDiagramPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default TreemapDiagram;
