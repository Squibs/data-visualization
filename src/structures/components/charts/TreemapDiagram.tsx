import React, { useCallback, useEffect, useRef, useState } from 'react';
import { navigate } from 'gatsby';
import tw from 'twin.macro';
import styled from 'styled-components';
import * as d3 from 'd3';
import twColors from 'tailwindcss/colors';
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

  .active {
    background-color: ${twColors.gray[400]}; // bg-gray-400
  }

  .otherTile {
    pointer-events: none;
  }
`;

const TreemapGraphSelector = styled.div`
  ${tw`mb-3 mt-3 grid xs:(grid-cols-3) sm:(flex justify-center)`}

  & button {
    ${tw`bg-gray-300 text-gray-700 py-2 px-1 mb-2 sm:(max-w-fit px-5)`}
  }

  & button:not(:last-child) {
    ${tw`xs:mr-0.5 sm:mr-5`}
  }
`;

const TreemapDiagramContainer = tw.div`w-full h-auto max-w-screen-lg m-auto`;
const D3TreemapDiagram = tw.svg`w-full h-full`;
const D3TreemapDiagramLegend = tw.svg`w-full h-full`;
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

export type DataFormat = {
  name: string;
  children: {
    name: string;
    children: {
      name: string;
      category: string;
      value: string;
    }[];
  }[];
};

/* -------------------------------- component ------------------------------- */

const TreemapDiagram = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoGameData, setVideoGameData] = useState<DataFormat | null>(null);
  const [kickstarterData, setKickStarterData] = useState<DataFormat | null>(null);
  const [movieData, setMovieData] = useState<DataFormat | null>(null);

  const [selectedGraph, setSelectedGraph] = useState<string>('');
  const [currentData, setCurrentData] = useState<DataFormat | null>(null);

  const svgRef = useRef(null);
  const legendRef = useRef(null);

  const [title, setTitle] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const createTreemapDiagram = useCallback(() => {
    if (currentData) {
      const height = 400;
      const width = 800;
      const margin = 60;

      // https://mokole.com/palette.html
      // https://bl.ocks.org/mbostock/4063582
      const colors = d3.scaleOrdinal().range(
        [
          '#2f4f4f', // white
          '#8b4513', // white
          '#191970', // white
          '#006400', // white
          '#ff0000', // white
          '#0000cd', // white
          '#ff00ff', // white
          '#f0e68c', // black
          '#6495ed', // black
          '#ee82ee', // black
          '#ffb6c1', // black
          '#00ced1', // black
          '#ffa500', // black
          '#ffff00', // black
          '#00ff00', // black
          '#00fa9a', // black
        ].map((c) => d3.interpolateRgb(c, '#fff')(0.3)),
      );
      // svg
      const svg = d3
        .select(svgRef.current)
        .attr('viewBox', `0 0 ${width + margin * 2} ${height + margin * 2}`)
        .attr('xmlns', 'http://www.w3.org/1999/xhtml');

      svg.append('g').attr('class', 'plot-area');

      // treemap size / padding
      const treemap = d3
        .treemap()
        .size([width + margin * 2, height + margin * 2])
        .paddingInner(1);

      // d3.hierarchy restructures the data so i'll just use any here
      const hierarchy = d3
        .hierarchy(currentData)
        .sum((d: any) => d.value)
        .sort((a: any, b: any) => b.value - a.value);
      const root = treemap(hierarchy);

      // const categories = currentData.children.map((d) => d.name);
      const categories = root
        .leaves()
        .map((nodes: any) => nodes.data.category)
        .filter((c, i, s) => s.indexOf(c) === i);
      // const colorScale = d3.scaleOrdinal().domain(categories).range(colors);

      // groups for each game/movie/kickstarter
      const rectGroup = d3
        .select('.plot-area')
        .selectAll('g')
        .data(root.leaves())
        .enter()
        .append('g');

      // each treemap rect
      rectGroup
        .append('rect')
        .attr('class', 'tile')
        .attr('x', (d) => d.x0)
        .attr('y', (d) => d.y0)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .attr('fill', (d: any) => colors(d.data.category) as string)
        .attr('data-name', (d: any) => d.data.name)
        .attr('data-category', (d: any) => d.data.category)
        .attr('data-value', (d: any) => d.data.value);

      // foreignObject for each rect text that can wrap
      rectGroup
        .append('foreignObject')
        .attr('class', 'otherTile')
        .attr('x', (d) => d.x0)
        .attr('y', (d) => d.y0)
        .attr('width', (d) => d.x1 - d.x0)
        .attr('height', (d) => d.y1 - d.y0)
        .append('xhtml:div')
        .text((d: any) => d.data.name)
        .attr('style', 'color: #000; font-size: 10px; padding: 2px; pointer-events: none;');

      // -------------------legend------------------------
      const legendWidth = width + margin * 2;
      const legendHeight = height / 3.85; // about 1/4 the size of the chart, little more for margin

      const legendOffset = 10;
      const legendRectSize = 15;
      const legendXSpacing = 160;
      const legendYSpacing = 10;
      const legendTextXOffset = 7;
      const legendTextYOffset = -2;

      const legendElementsPerRow = Math.floor(legendWidth / legendXSpacing);

      const legend = d3
        .select(legendRef.current)
        .attr('viewBox', `0 0 ${legendWidth} ${legendHeight}`)
        .append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${margin}, ${legendOffset})`)
        .selectAll('g')
        .data(categories)
        .enter()
        .append('g')
        .attr(
          'transform',
          (d, i) =>
            `translate(${(i % legendElementsPerRow) * legendXSpacing}, ${
              Math.floor(i / legendElementsPerRow) * legendRectSize +
              legendYSpacing * Math.floor(i / legendElementsPerRow)
            })`,
        );
      // took this calculation from fCC example

      legend
        .append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .attr('fill', (d) => colors(d) as string)
        .attr('class', 'legend-item');

      legend
        .append('text')
        .text((d) => d)
        .attr('x', legendRectSize + legendTextXOffset)
        .attr('y', legendRectSize + legendTextYOffset)
        .attr('fill', '#9d9d9d');
    }

    // ------------------------tooltip-------------------------
    const tooltip = d3.select('#tooltip');

    d3.selectAll('.tile')
      .on('mouseover', () => {
        tooltip.style('display', 'block');
      })
      .on('mousemove', (e) => {
        const tooltipElement = tooltip.node() as Element;
        const mouseXOffset = tooltipElement.getBoundingClientRect().width / 2;
        const mouseYOffset = tooltipElement.getBoundingClientRect().height + 10;
        const ld = e.target.dataset; // local dataset

        tooltip
          .html(
            `<small>
              Category: ${ld.category}<br>
              Value: ${ld.value}<br>
              Name: ${ld.name}
            </small>`,
          )
          .attr('data-value', ld.value)
          .style('left', `${e.pageX - mouseXOffset}px`)
          .style('top', `${e.pageY - mouseYOffset}px`);
      })
      .on('mouseleave', () => tooltip.style('display', 'none'));
  }, [currentData]);

  // once data is retrieved create graph
  useEffect(() => {
    // only if data exists create the diagram; none of this will run on page load
    if (selectedGraph !== '' && (videoGameData || kickstarterData || movieData)) {
      switch (selectedGraph) {
        case 'videogame':
          if (videoGameData) {
            setCurrentData(videoGameData);
            setLoading(false);
            setError(null);
            createTreemapDiagram();
          }
          break;
        case 'kickstarter':
          if (kickstarterData) {
            setCurrentData(kickstarterData);
            setLoading(false);
            setError(null);
            createTreemapDiagram();
          }
          break;
        case 'movie':
          if (movieData) {
            setCurrentData(movieData);
            setLoading(false);
            setError(null);
            createTreemapDiagram();
          }
          break;
        default:
          // this will only run if there is no string set for selectedGraph
          setSelectedGraph('videogame');
      }
    }
  }, [createTreemapDiagram, currentData, kickstarterData, movieData, selectedGraph, videoGameData]);

  // retrieve data
  useEffect(() => {
    if (selectedGraph !== '') {
      switch (selectedGraph) {
        case 'videogame':
          // videoGameData ?? getDataFromAPI('videogame');
          setVideoGameData(fakeVideoGameData);
          setTitle('Video Game Sales');
          setSource(
            'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
          );
          setDescription('Top 100 most sold video games grouped by platform');
          break;
        case 'kickstarter':
          // kickstarterData ?? getDataFromAPI('kickstarter');
          setKickStarterData(fakeKickstarterData);
          setTitle('Kickstarter Pledges');
          setSource(
            'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
          );
          setDescription('Top 100 most pledged kickstarter campaigns grouped by category');
          break;
        case 'movie':
          // movieData ?? getDataFromAPI('movie');
          setMovieData(fakeMovieData);
          setTitle('Movie Sales');
          setSource(
            'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
          );
          setDescription('Top 100 highest grossing movies grouped by genre');
          break;
        default:
          // this would run if there was no string set for selectedGraph
          setSelectedGraph('videogame');
      }
    }
  }, [selectedGraph]);

  // store optional treemap-data parameter on load
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const data = queryParams.get('treemap-data');

    setSelectedGraph(data || 'videogame');
  }, []);

  return (
    <TreemapDiagramPageContainer>
      <TreemapGraphSelector>
        <button
          type="button"
          className={selectedGraph === 'videogame' ? 'active' : ''}
          onClick={() => {
            if (svgRef.current) {
              const currentSVG: Element = svgRef.current;
              currentSVG.innerHTML = '';
            }
            setCurrentData(null);
            navigate('?treemap-diagram&treemap-data=videogame');
            setSelectedGraph('videogame');
          }}
        >
          Video Game Data
        </button>
        <button
          type="button"
          className={selectedGraph === 'kickstarter' ? 'active' : ''}
          onClick={() => {
            if (svgRef.current) {
              const currentSVG: Element = svgRef.current;
              currentSVG.innerHTML = '';
            }
            setCurrentData(null);
            navigate('?treemap-diagram&treemap-data=kickstarter');
            setSelectedGraph('kickstarter');
          }}
        >
          Kickstarter Data
        </button>
        <button
          type="button"
          className={selectedGraph === 'movie' ? 'active' : ''}
          onClick={() => {
            if (svgRef.current) {
              const currentSVG: Element = svgRef.current;
              currentSVG.innerHTML = '';
            }
            setCurrentData(null);
            navigate('?treemap-diagram&treemap-data=movie');
            setSelectedGraph('movie');
          }}
        >
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
          <h2 id="description" tw="text-center text-xl font-light mb-2">
            {description}
          </h2>

          <TreemapDiagramContainer>
            <D3TreemapDiagram ref={svgRef} preserveAspectRatio="xMinYMin meet" />
            <D3TreemapDiagramLegend ref={legendRef} preserveAspectRatio="xMinYMin meet" />
            <D3TreemapDiagramToolTip id="tooltip">HELLO WHERE AM I</D3TreemapDiagramToolTip>
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
                {'\u00A0'}
                (From freeCodeCamp)
              </i>
            </li>
            <li key="2">Unknown Date</li>
          </DataInformation>
        </>
      )}
    </TreemapDiagramPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default TreemapDiagram;
