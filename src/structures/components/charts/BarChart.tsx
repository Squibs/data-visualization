import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import * as d3 from 'd3';
import styled from 'styled-components';
import getDataFromAPI from '../../utils/getDataFromAPI';
import fakeData from '../../../data/data-backup-bar-chart-(US GDP).json';

/* --------------------------------- styles --------------------------------- */

const BarChartPageContainer = tw.div``;

const BarChartContainer = tw.div`w-full h-auto ml-2 max-w-screen-xl`;
const D3BarChart = styled.svg`
  height: 100%;
  width: 100%;
  & rect {
    ${tw`fill-amber-600 hover:fill-blue-900`}
  }
`;
const D3BarChartToolTip = tw.div`
  opacity-0 absolute p-1 w-32 h-16 bg-white transition text-center
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

    const svg = d3.select(svgRef.current);

    // axes scales
    svg
      .select('#x-axis')
      .call(d3.axisBottom(xScale) as any)
      .attr('transform', `translate(${margin}, ${height + margin})`);
    svg
      .select('#y-axis')
      .call(d3.axisLeft(yScale) as any)
      .attr('transform', `translate(${margin}, ${margin})`);

    // bars
    svg
      .select('.plot-area')
      .selectAll('.bar')
      .data(gdpDataSet.map((d) => scaleGDP(d)))
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => xScale(new Date(dateDataSet[i])) + margin)
      .attr('width', width / (dataset.length + margin / 2))
      .attr('y', (d) => height - d + margin)
      .attr('height', (d) => d)
      // these two attributes are accessible in mouse events
      .attr('data-date', (d, i) => `${dateDataSet[i]}`)
      .attr('data-gdp', (d, i) => `${gdpDataSet[i]}`);

    const tooltip = d3.select('#tooltip');

    svg
      .selectAll('.bar')
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

    return (
      <BarChartContainer>
        <D3BarChart
          ref={svgRef}
          viewBox={`0 0 ${width + margin * 2} ${height + margin * 2}`}
          preserveAspectRatio="xMinYMin meet"
        >
          <g className="plot-area" />
          <g id="x-axis" />
          <g id="y-axis" />
        </D3BarChart>
        <D3BarChartToolTip id="tooltip" />
      </BarChartContainer>
    );
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

    const tempData = () => {
      setData(fakeData as unknown as USGDPData);
      setLoading(false);
      setError(null);
    };

    // getData();
    tempData();
  }, []);

  useEffect(() => {
    data && createBarChart(data);
  }, [data]);

  return (
    <BarChartPageContainer>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {data && (
        <>
          <h1 id="title" tw="text-center text-2xl font-medium">
            United States GDP (1946 - 2015)
          </h1>
          {createBarChart(data)}
          <DataInformation>
            <li key="0">
              Data size:
              {'\u00A0'}
              {(new TextEncoder().encode(JSON.stringify(data)).length / 1024).toFixed(2)}
              KB
            </li>
            <li key="1">
              Last updated:
              {'\u00A0'}
              {new Date(data.updated_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </li>
            <li key="2">
              <a
                tw="text-blue-900 hover:text-red-900"
                href="https://fred.stlouisfed.org/data/GDP.txt"
                target="_blank"
                rel="noreferrer"
              >
                Source
              </a>
              {'\u00A0'}
              of Data
            </li>
          </DataInformation>
        </>
      )}
    </BarChartPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default BarChart;
