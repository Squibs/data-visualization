import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import * as d3 from 'd3';
import getDataFromAPI from '../../utils/getDataFromAPI';
import fakeData from '../../../data/data-backup-scatterplot-graph-(Cyclist Data).json';

/* --------------------------------- styles --------------------------------- */

const ScatterplotGraphPageContainer = tw.div`w-full`;
const ScatterplotGraphContainer = tw.div`w-full h-auto max-w-screen-xl m-auto`;
const D3ScatterplotGraph = styled.svg`
  height: 100%;
  width: 100%;
`;
const D3ScatterplotGraphToolTip = styled.div`
  ${tw`opacity-0 absolute p-1 w-fit [max-width: 200px] h-fit bg-white transition text-center text-black
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

export interface CyclistData {
  Time: string;
  Place: number;
  Seconds: number;
  Name: string;
  Year: number;
  Nationality: string;
  Doping: string;
  URL: string;
}

/* -------------------------------- component ------------------------------- */

const ScatterplotGraph = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CyclistData[] | null>(null);
  const [sources, setSources] = useState<JSX.Element[] | null>(null);

  const svgRef = useRef(null);

  const createScatterplot = (chartData: CyclistData[]) => {
    const height = 400;
    const width = 800;
    const margin = 60;

    const dataset = chartData;
    const dateDataSet = dataset.map((d) => new Date(`${d.Year}-1-1`));
    const timeDataSetMinutes = dataset.map((d) => new Date(`01-01-1970 00:${d.Time}`));

    // x-axis min and max dates stored as date objects (converted to date object in datasets)
    const minDate = d3.min(dateDataSet) as Date;
    const maxDate = d3.max(dateDataSet) as Date;

    // used on x-axis to better fit the data in a larger scale
    const adjustedMinDate = new Date(minDate);
    adjustedMinDate.setFullYear(minDate.getFullYear() - 1);
    const adjustedMaxDate = new Date(maxDate);
    adjustedMaxDate.setFullYear(maxDate.getFullYear() + 1);

    // y-axis min and max time stored as date objects (converted to date object in datasets)
    const minTime = d3.min(timeDataSetMinutes) as Date;
    const maxTime = d3.max(timeDataSetMinutes) as Date;

    // used on y-axis to better fit the data in a larger scale
    const adjustedMinTime = new Date(minTime);
    adjustedMinTime.setSeconds(minTime.getSeconds() - 15);
    const adjustedMaxTime = new Date(maxTime);
    adjustedMaxTime.setSeconds(maxTime.getSeconds() + 10);

    // scales
    const xScale = d3.scaleTime().domain([adjustedMinDate, adjustedMaxDate]).range([0, width]);
    const yScale = d3.scaleTime().domain([adjustedMinTime, adjustedMaxTime]).range([height, 0]);
    const scaleTime = d3.scaleTime().domain([minTime, maxTime]).range([0, height]);

    // svg
    d3.select(svgRef.current).attr('viewBox', `0 0 ${width + margin * 2} ${height + margin * 2}`);

    // axes scales
    d3.select('#x-axis')
      .call(d3.axisBottom(xScale) as any)
      .attr('transform', `translate(${margin}, ${height + margin})`);
    d3.select('#y-axis')
      .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S') as any) as any)
      .attr('transform', `translate(${margin}, ${margin})`);

    // y-axis label
    d3.select('.y-axis-label').attr(
      'transform',
      `translate(${margin + 20}, ${height / 2 + 20}) rotate(-90)`,
    );

    // legend
    d3.select('#legend').attr('transform', `translate(${width - margin * 3}, ${height - margin})`);

    // dots
    d3.select('.plot-area')
      .selectAll('.dot')
      .data(dateDataSet.map((d, i) => scaleTime(d)))
      .join('circle')
      .attr('class', 'dot')
      .attr('r', 7)
      .attr('cx', (d, i) => xScale(dateDataSet[i]) + margin)
      .attr('data-xvalue', (d, i) => `${dateDataSet[i]}`)
      .attr('cy', (d, i) => yScale(timeDataSetMinutes[i]) + margin)
      .attr('data-yvalue', (d, i) => `${timeDataSetMinutes[i]}`)
      .attr('data-index', (d, i) => i)
      .attr('fill', (d, i) => `${dataset[i].Doping ? '#d97706BF' : '#22d3eeBF'}`)
      .attr('stroke', () => 'black');

    // tooltip mouse events
    const tooltip = d3.select('#tooltip');
    d3.selectAll('.dot')
      .on('mouseover', () => tooltip.style('opacity', 1))
      .on('mousemove', (e) => {
        const tooltipElement = tooltip.node() as Element;
        const mouseXOffset = tooltipElement.getBoundingClientRect().width / 2;
        const mouseYOffset = tooltipElement.getBoundingClientRect().height + 10;
        const ld = e.target.dataset; // local dataset

        tooltip
          .html(
            `<small>
              ${dataset[ld.index].Name} (${dataset[ld.index].Nationality})<br>
              ${dataset[ld.index].Year}, ${dataset[ld.index].Time}<br>
              ${dataset[ld.index].Doping ? '<hr>' : ''}
              ${dataset[ld.index].Doping}
            </small>`,
          )
          .attr('data-year', ld.xvalue)
          .style('left', `${e.pageX - mouseXOffset}px`)
          .style('top', `${e.pageY - mouseYOffset}px`);
      })
      .on('mouseleave', () => tooltip.style('opacity', 0));
  };

  // creates list of sources from data
  const createSources = (chartData: CyclistData[]) => {
    const listOfSources: Array<(string | number)[]> = [];

    chartData.forEach((d) => {
      if (d.URL && !listOfSources.some((s) => s[1] === d.URL)) {
        listOfSources.push([d.Place - 1, d.URL]);
      }
    });

    setSources(
      listOfSources.map((s) => (
        <React.Fragment key={Math.random()}>
          <a
            tw="text-linkcolor hover:text-cyan-400"
            href={s[1] as string}
            target="_blank"
            rel="noreferrer"
          >
            {chartData[s[0] as number].Name}
            {'\u00A0'}
            Allegation
          </a>
          <br />
        </React.Fragment>
      )),
    );
  };

  // fetch data from freeCodeCamp onMount
  useEffect(() => {
    const getData = () =>
      getDataFromAPI(
        `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json`,
        setLoading,
        setError,
        setData,
      );

    // getData();

    const tempData = () => {
      setData(fakeData as unknown as CyclistData[]);
      setLoading(false);
      setError(null);
    };

    tempData();
  }, []);

  // add data to bar chart svg
  useEffect(() => {
    data && createScatterplot(data);
    data && createSources(data);
  }, [data]);

  return (
    <ScatterplotGraphPageContainer>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {data && !loading && !error && (
        <>
          <h1 id="title" tw="text-center text-2xl font-medium">
            Doping Allegations in Professional Bicycling
          </h1>
          <h2 tw="text-center text-xl font-light">35 Fastest times up Alpe d&apos;Huez</h2>

          <ScatterplotGraphContainer>
            <D3ScatterplotGraph ref={svgRef} preserveAspectRatio="xMinYMin meet">
              <text className="y-axis-label" style={{ fill: '#9d9d9d' }}>
                <tspan>Time in Minutes</tspan>
              </text>
              <g className="plot-area" />
              <g id="x-axis" />
              <g id="y-axis" />
              <g id="legend" style={{ fill: '#9d9d9d' }}>
                <g className="legend-label">
                  <text>Doping Allegations Cited</text>
                  <rect x="185" y="-15" width="20" height="20" fill="#d97706BF" stroke="black" />
                </g>
                <g className="legend-label">
                  <text x="15" dy="1.81em">
                    No Doping Allegations
                  </text>
                  <rect x="185" y="15" width="20" height="20" fill="#22d3eeBF" stroke="black" />
                </g>
              </g>
            </D3ScatterplotGraph>
            <D3ScatterplotGraphToolTip id="tooltip" />
          </ScatterplotGraphContainer>

          <DataInformation>
            <li key="0">
              Size:
              {'\u00A0'}
              <i>
                {(new TextEncoder().encode(JSON.stringify(data)).length / 1024).toFixed(2)}
                {'\u00A0'}
                KB
              </i>
            </li>
            <li key="1">
              <i>
                <details>
                  <summary>Sources</summary>
                  {sources}
                </details>
              </i>
            </li>
          </DataInformation>
        </>
      )}
    </ScatterplotGraphPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default ScatterplotGraph;
