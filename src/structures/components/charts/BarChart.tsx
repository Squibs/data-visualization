import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import * as d3 from 'd3';
import styled from 'styled-components';
import getDataFromAPI from '../../utils/getDataFromAPI';
import fakeData from '../../../data/data-backup-bar-chart-(US GDP).json';

/* --------------------------------- styles --------------------------------- */

const BarChartPageContainer = tw.div`w-full`;

const BarChartContainer = tw.div`w-full h-auto max-w-screen-xl m-auto`;
const D3BarChart = styled.svg`
  height: 100%;
  width: 100%;
  & rect {
    ${tw`fill-amber-600 hover:fill-cyan-400`}
  }
`;
const D3BarChartToolTip = tw.div`
  opacity-0 absolute p-1 w-32 h-16 bg-white transition text-center text-black
  pointer-events-none border-2 border-solid rounded-md border-black
`;

const DataInformation = tw.ul``;

/* ---------------------------------- types --------------------------------- */

export interface USGDPData {
  errors: Error;
  id: number;
  source_name: string;
  source_code: string;
  code: string;
  name: string;
  urlize_name: string;
  display_url: string;
  description: string;
  updated_at: Date;
  frequency: string;
  from_date: Date;
  to_date: Date;
  column_names: string[];
  private: boolean;
  type: null;
  premium: boolean;
  data: Array<[Date, number]>;
}

/* -------------------------------- component ------------------------------- */

const BarChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<USGDPData | null>(null);

  const svgRef = useRef(null);

  const createBarChart = (chartData: USGDPData) => {
    const height = 400;
    const width = 800;
    const margin = 60;

    const dataset = chartData.data;
    const dateDataSet = dataset.map((d) => d[0]);
    const gdpDataSet = dataset.map((d) => d[1]);

    const minDate = d3.min(dateDataSet, (d) => new Date(d)) as Date;
    const maxDate = d3.max(dateDataSet, (d) => new Date(d)) as Date;
    const maxGDP = d3.max(gdpDataSet, (d) => d) as number;

    maxDate.setMonth(maxDate.getMonth() + 2); // extends domain a little so x-axis label lines up

    const xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, maxGDP]).range([height, 0]);
    const scaleGDP = d3.scaleLinear().domain([0, maxGDP]).range([0, height]);

    // svg | using a ref as a test, not sure if there is a real difference performance wise
    d3.select(svgRef.current).attr('viewBox', `0 0 ${width + margin * 2} ${height + margin * 2}`);

    // axes scales
    d3.select('#x-axis')
      .call(d3.axisBottom(xScale) as any)
      .attr('transform', `translate(${margin}, ${height + margin})`);
    d3.select('#y-axis')
      .call(d3.axisLeft(yScale) as any)
      .attr('transform', `translate(${margin}, ${margin})`);

    // y-axis label
    d3.select('.y-axis-label').attr(
      'transform',
      `translate(${margin + 20}, ${height / 2 + 40}) rotate(-90)`,
    );

    // bars
    d3.select('.plot-area')
      .selectAll('.bar')
      .data(gdpDataSet.map((d) => scaleGDP(d)))
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => xScale(new Date(dateDataSet[i])) + margin)
      .attr('width', width / (dataset.length + margin / 2))
      .attr('y', (d) => height - d + margin)
      .attr('height', (d) => d)
      /* these two attributes are accessible in mouse events */
      .attr('data-date', (d, i) => `${dateDataSet[i]}`)
      .attr('data-gdp', (d, i) => `${gdpDataSet[i]}`);

    // tooltip mouse events
    const tooltip = d3.select('#tooltip');
    d3.selectAll('.bar')
      .on('mouseover', () => tooltip.style('opacity', 1))
      .on('mousemove', (e) => {
        const tooltipElement = tooltip.node() as Element;
        const mouseXOffset = tooltipElement.getBoundingClientRect().width / 2;
        const mouseYOffset = tooltipElement.getBoundingClientRect().height + 10;

        tooltip
          .html(
            `<small>${new Date(e.target.dataset.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}\n${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              e.target.dataset.gdp,
            )} billion</small>`,
          )
          .attr('data-date', e.target.dataset.date)
          .attr('data-gdp', e.target.dataset.gdp)
          .style('left', `${e.pageX - mouseXOffset}px`)
          .style('top', `${e.pageY - mouseYOffset}px`);
      })
      .on('mouseleave', () => tooltip.style('opacity', 0));
  };

  // fetch data from freeCodeCamp onMount
  useEffect(() => {
    const getData = () =>
      getDataFromAPI(
        `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json`,
        setLoading,
        setError,
        setData,
      );

    // getData();

    const tempData = () => {
      setData(fakeData as unknown as USGDPData);
      setLoading(false);
      setError(null);
    };

    tempData();
  }, []);

  // add data to bar chart svg
  useEffect(() => {
    data && createBarChart(data);
  }, [data]);

  return (
    <BarChartPageContainer>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {data && !loading && !error && (
        <>
          <h1 id="title" tw="text-center text-2xl font-medium">
            United States GDP
          </h1>
          <h2 id="description" tw="text-center text-xl font-light">
            {`${String(d3.min(data.data.map((d) => d[0]))).slice(0, 4)} - `}
            {`${String(d3.max(data.data.map((d) => d[0]))).slice(0, 4)} `}
            (In Billions)
          </h2>

          <BarChartContainer>
            <D3BarChart ref={svgRef} preserveAspectRatio="xMinYMin meet">
              <text className="y-axis-label" style={{ fill: '#9d9d9d' }}>
                <tspan>Gross Domestic Product</tspan>
                <tspan x="45" dy="1.2em">
                  (In Billions)
                </tspan>
              </text>
              <g className="plot-area" />
              <g id="x-axis" />
              <g id="y-axis" />
            </D3BarChart>
            <D3BarChartToolTip id="tooltip" />
          </BarChartContainer>

          <DataInformation>
            <li key="0">
              Updated:
              {'\u00A0'}
              <i>
                {new Date(data.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </i>
            </li>
            <li key="1">
              Size:
              {'\u00A0'}
              <i>
                {(new TextEncoder().encode(JSON.stringify(data)).length / 1024).toFixed(2)}
                {'\u00A0'}
                KB
              </i>
            </li>
            <li key="2">
              Data:
              {'\u00A0'}
              <i>
                <a
                  tw="text-linkcolor hover:text-cyan-400"
                  href="https://fred.stlouisfed.org/data/GDP.txt"
                  target="_blank"
                  rel="noreferrer"
                >
                  Source
                </a>
              </i>
            </li>
          </DataInformation>
        </>
      )}
    </BarChartPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default BarChart;
