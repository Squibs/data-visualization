import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import * as d3 from 'd3';
import getDataFromAPI from '../../utils/getDataFromAPI';
import fakeData from '../../../data/data-backup-bar-chart-(US GDP).json';

/* --------------------------------- styles --------------------------------- */

const BarChartContainer = tw.div``;

const D3BarChart = tw.svg``;

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
      console.log(data);
      const dataset = data.data;
      const width = 800;
      const height = 400;
      const margin = 60;

      const minDate = d3.min(dataset, (d) => new Date(d[0])) as Date;
      const maxDate = d3.max(dataset, (d) => new Date(d[0])) as Date;
      const minGDP = d3.min(dataset, (d) => d[1]) as number;
      const maxGDP = d3.max(dataset, (d) => d[1]) as number;

      const xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);
      const yScale = d3.scaleLinear().domain([0, maxGDP]).range([height, 0]);

      const svg = d3
        .select(svgRef.current)
        .attr('width', width + margin)
        .attr('height', height + margin);

      svg
        .selectAll('rect')
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', (d) => xScale(new Date(d[0])))
        .attr('y', (d) => yScale(d[1]))
        .attr('height', (d) => d[1])
        .attr('width', 2);
    }
  });

  return (
    <BarChartContainer>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {data && (
        <>
          <h1 id="title">TITLE OF MY CHART</h1>
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
        </>
      )}
    </BarChartContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default BarChart;
