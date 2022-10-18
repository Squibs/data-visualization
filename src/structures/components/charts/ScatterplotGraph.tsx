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
const D3ScatterplotGraphToolTip = tw.div``;
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

  const svgRef = useRef(null);

  const createScatterplot = (chartData: CyclistData[]) => {
    const height = 400;
    const width = 800;
    const margin = 60;

    const dataset = chartData;
    const dateDataSet = dataset.map((d) => new Date(`${d.Year}-1`));
    const timeDataSetSeconds = dataset.map((d) => d.Seconds);
    const timeDataSetMinutes = dataset.map((d) => new Date(`01-01-1970 00:${d.Time}`));

    const minDate = d3.min(dateDataSet) as Date;
    const maxDate = d3.max(dateDataSet) as Date;
    // const minTimeSeconds = d3.min(timeDataSetSeconds);
    // const maxTimeSeconds = d3.max(timeDataSetSeconds);
    const minTimeMinutes = d3.min(timeDataSetMinutes) as Date;
    const maxTimeMinutes = d3.max(timeDataSetMinutes) as Date;

    const xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);
    const yScale = d3.scaleTime().domain([minTimeMinutes, maxTimeMinutes]).range([height, 0]);
    const scaleTime = d3.scaleTime().domain([minTimeMinutes, maxTimeMinutes]).range([0, height]);

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
    d3.select('.y-axis-label');

    // dots
    d3.select('.plot-area')
      .selectAll('.dot')
      .data(dateDataSet.map((d) => scaleTime(d)))
      .join('circle')
      .attr('class', 'dot')
      .attr('r', 4)
      .attr('cx', (d, i) => xScale(dateDataSet[i]) + margin)
      .attr('cy', (d, i) => yScale(timeDataSetMinutes[i]) + margin);
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

  useEffect(() => {
    // console.log(data);
    // console.log(loading);
    // console.log(error);
  }, [data, loading, error]);

  useEffect(() => {
    data && createScatterplot(data);
  }, [data]);

  return (
    <ScatterplotGraphPageContainer>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {data && !loading && !error && (
        <>
          <h1 id="title" tw="text-center text-2xl font-medium">
            TITLE OF MY CHART
          </h1>

          <ScatterplotGraphContainer>
            <D3ScatterplotGraph ref={svgRef} preserveAspectRatio="xMinYMin meet">
              <text className="y-axis-label" style={{ fill: '#9d9d9d' }}>
                {/* <tspan>Gross Domestic Product</tspan>
                <tspan x="45" dy="1.2em">
                  (In Billions)
                </tspan> */}
              </text>
              <g className="plot-area" />
              <g id="x-axis" />
              <g id="y-axis" />
              <g id="legend" />
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
              Data:
              {'\u00A0'}
              <i>
                <a
                  tw="text-linkcolor hover:text-cyan-400"
                  href="#"
                  target="_blank"
                  rel="noreferrer"
                >
                  Sources
                </a>
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
