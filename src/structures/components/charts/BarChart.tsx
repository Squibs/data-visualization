import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import * as d3 from 'd3';
import getDataFromAPI from '../../utils/getDataFromAPI';
import fakeData from '../../../data/data-backup-bar-chart-(US GDP).json';
import styled from 'styled-components';

/* --------------------------------- styles --------------------------------- */

const BarChartPageContainer = tw.div``;

const BarChartContainer = tw.div``;
const D3BarChart = styled.svg`
  & rect {
    ${tw`fill-amber-600 hover:fill-blue-900`}
  }
`;
const D3BarChartToolTip = tw.div`
  opacity-0 absolute p-1 w-32 h-16 bg-white transition text-center
  pointer-events-none border-2 border-solid rounded-md border-black
`;

const DataInformation = tw.div``;

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
  const tooltipRef = useRef(null);

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
      setLoading(false);
      setError(null);
      setData(fakeData as any);
    };

    // getData();
    tempData();
  }, []);

  useEffect(() => {
    // console.log(data);
    // console.log(loading);
    // console.log(error);

    if (data) {
      const tooltip = d3.select(tooltipRef.current);
      const dataset = data.data; // [date-string, gdp-number]
      const dateDataSet = dataset.map((d) => d[0]);
      const gdpDataSet = dataset.map((d) => d[1]);
      const width = 800;
      const height = 400;
      const margin = 60;

      const minDate = d3.min(dateDataSet, (d) => new Date(d)) as Date;
      const maxDate = d3.max(dateDataSet, (d) => new Date(d)) as Date;
      const minGDP = d3.min(gdpDataSet, (d) => d) as number;
      const maxGDP = d3.max(gdpDataSet, (d) => d) as number;

      maxDate.setMonth(maxDate.getMonth() + 2); // extends domain a little so x-axis label lines up

      const xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);
      const yScale = d3.scaleLinear().domain([minGDP, maxGDP]).range([height, 0]);
      const scaleGDP = d3.scaleLinear().domain([0, maxGDP]).range([0, height]);

      // select premade svg and assign width/height
      const svg = d3
        .select(svgRef.current)
        .attr('width', width + margin * 2)
        .attr('height', height + margin * 2);

      // bar-chart bars
      svg
        .selectAll('rect')
        .data(gdpDataSet.map((d) => scaleGDP(d)))
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('data-date', (d, i) => `${dateDataSet[i]}`)
        .attr('data-gdp', (d, i) => `${gdpDataSet[i]}`)
        .attr('x', (d, i) => xScale(new Date(dateDataSet[i])) + margin)
        .attr('y', (d) => height - d + margin)
        .attr('width', width / (dataset.length + margin / 2))
        .attr('height', (d) => d)
        .on('mouseover', (e, d) => {
          tooltip.style('opacity', 1);
        })
        .on('mousemove', (e) => {
          console.log(e);
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
            .style('left', `${d3.pointer(e)[0] - 45}px`)
            .style('top', `${d3.pointer(e)[1] + 60}px`);
        })
        .on('mouseleave', () => {
          tooltip.style('opacity', 0);
        });

      // x-axis label
      svg
        .append('g')
        .attr('id', 'x-axis')
        .call(d3.axisBottom(xScale))
        .attr('transform', `translate(${margin}, ${height + margin})`);

      // y-axis label
      svg
        .append('g')
        .attr('id', 'y-axis')
        .call(d3.axisLeft(yScale))
        .attr('transform', `translate(${margin}, ${margin})`);
    }
  });

  return (
    <BarChartPageContainer>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {data && (
        <>
          <BarChartContainer>
            <h1 id="title">TITLE OF MY CHART</h1>
            <D3BarChartToolTip id="tooltip" ref={tooltipRef} />
            <D3BarChart ref={svgRef} />
            <DataInformation>
              <ul>
                <li>
                  Data size:{' '}
                  {(new TextEncoder().encode(JSON.stringify(data)).length / 1024).toFixed(2)} KB
                </li>
                <li>
                  Last updated:{' '}
                  {new Date(data.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </li>
                <li>
                  <a
                    tw="text-blue-900 hover:text-red-900"
                    href="https://fred.stlouisfed.org/data/GDP.txt"
                    target="_blank"
                  >
                    Source
                  </a>{' '}
                  of Data
                </li>
              </ul>
            </DataInformation>
          </BarChartContainer>
        </>
      )}
    </BarChartPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default BarChart;
