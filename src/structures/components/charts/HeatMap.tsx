import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import * as d3 from 'd3';
import { getDataFromAPI } from '../../utils';
import fakeData from '../../../data/data-backup-heat-map-(Global Temperature).json';

/* --------------------------------- styles --------------------------------- */

const HeatMapPageContainer = tw.div``;
const HeatMapContainer = tw.div``;
const D3HeatMap = tw.svg``;
const D3HeatMapToolTip = tw.div``;
const DataInformation = tw.ul``;

/* ---------------------------------- types --------------------------------- */

export interface MonthlyVariance {
  year: number;
  month: number;
  variance: number;
}
export interface GlobalTemperatureData {
  baseTemperature: number;
  monthlyVariance: MonthlyVariance[];
}

/* -------------------------------- component ------------------------------- */

const HeatMap = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GlobalTemperatureData | null>(null);

  const svgRef = useRef(null);

  const createHeatMap = (chartData: GlobalTemperatureData) => {
    const height = 400;
    const width = 800;
    const margin = 60;

    const dataset = chartData;
    const yearDataSet = dataset.monthlyVariance.map((d) => new Date(`${d.year}-1-1`));
    const monthDataSet = dataset.monthlyVariance.map((d) => new Date(`${d.month}-1-1`));

    // x-axis min and max (years) stored as date objects (converted to date object in dataset declaration)
    const minYear = d3.min(yearDataSet) as Date;
    const maxYear = d3.max(yearDataSet) as Date;

    // y-axis min and max (months) stored as date objects (converted to date object in dataset declaration)
    const minMonth = d3.min(monthDataSet) as Date;
    const maxMonth = d3.max(monthDataSet) as Date;

    // scales
    const xScale = d3.scaleTime().domain([minYear, maxYear]).range([0, width]);
    const yScale = d3.scaleTime().domain([minMonth, maxMonth]).range([height, 0]);
    const scaleTime = d3.scaleTime().domain([minMonth, maxMonth]).range([0, height]);

    // ----------------------variance--------------------------
    const varianceDataSet = dataset.monthlyVariance.map((d) => d.variance);

    const minVariance = d3.min(varianceDataSet) as number;
    const maxVariance = d3.max(varianceDataSet) as number;

    const minBaseVariance = Number((dataset.baseTemperature + minVariance).toFixed(2));
    const maxBaseVariance = Number((dataset.baseTemperature + maxVariance).toFixed(2));

    const varianceScaleBreakpoints: number[] = [];
    for (let i = 1; i < 9 + 1; i += 1) {
      varianceScaleBreakpoints.push(
        Number((minBaseVariance + i * ((maxBaseVariance - minBaseVariance) / 11)).toFixed(1)),
      );
    }

    // threshold
    const varianceScale = d3
      .scaleThreshold()
      .domain(varianceScaleBreakpoints)
      .range([...d3.schemeRdBu[10]].reverse() as any);

    // axis scale
    const legendScaleX = d3
      .scaleLinear()
      .domain([minBaseVariance, maxBaseVariance - 1.1]) // adjust axis scale by axis step
      .range([0, 400]);

    // legend x-axis
    d3.select('#legend')
      .append('g')
      .attr('class', 'legend-scale')
      .call(
        d3
          .axisBottom(legendScaleX)
          .tickValues(varianceScaleBreakpoints)
          .tickFormat((d, i) => (typeof d === 'string' ? d : `${d3.format('.1f')(d)}°C`)) as any,
      );

    // array of ranges in which each data point should fall between one of
    // https://bl.ocks.org/mbostock/4060606
    const legendData = varianceScale.range().map((c) => {
      const d = varianceScale.invertExtent(c);
      const [a, b] = legendScaleX.domain();

      if (d[0] === undefined) d[0] = a;
      if (d[1] === undefined) d[1] = b;

      return d;
    });

    // legend
    d3.select('#legend')
      .append('g')
      .selectAll('rect')
      .data(legendData as number[][])
      .enter()
      .append('rect')
      .attr('x', (d) => legendScaleX(d[0]))
      .attr('width', (d) => legendScaleX(d[1]) - legendScaleX(d[0]))
      .attr('y', -15)
      .attr('height', 15)
      .style('fill', (d) => varianceScale(d[0]));

    // move legend
    d3.select('#legend').attr('transform', `translate(${width / 3}, ${height + margin * 2 - 20})`);

    // ----------------------heat map--------------------------

    // svg
    d3.select(svgRef.current).attr('viewBox', `0 0 ${width + margin * 2} ${height + margin * 2}`);

    // x-axis scale
    d3.select('#x-axis')
      .call(d3.axisBottom(xScale) as any)
      .attr('transform', `translate(${margin}, ${height + margin})`);

    // y-axis scale
    d3.select('#y-axis')
      .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat('%b') as any) as any)
      .attr('transform', `translate(${margin}, ${margin / 1.5})`); // adjusts y-axis upwards a bit so ticks can be in center

    // bars (cells)
    d3.select('.plot-area')
      .selectAll('.cell')
      .data(yearDataSet.map((d) => scaleTime(d)))
      .join('rect')
      .attr('class', 'cell')
      .attr('x', (d, i) => xScale(yearDataSet[i]) + margin)
      .attr('width', 4)
      .attr('data-year', (d, i) => `${yearDataSet[i]}`)
      .attr('y', (d, i) => yScale(monthDataSet[i]) + margin / 3) // moves entire graph up a bit to align with y-axis that is also adjusted upwards
      .attr('height', 40)
      .attr('data-month', (d, i) => `${monthDataSet[i]}`)
      .attr('fill', (d, i) => {
        return varianceScale(dataset.baseTemperature + dataset.monthlyVariance[i].variance);
      })
      .attr('data-temp', (d, i) => dataset.baseTemperature + dataset.monthlyVariance[i].variance);
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
      setData(fakeData as unknown as GlobalTemperatureData);
      setLoading(false);
      setError(null);
    };

    tempData();
  }, []);

  // add data to bar chart svg
  useEffect(() => {
    data && createHeatMap(data);
  }, [data]);

  return (
    <HeatMapPageContainer>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {data && !loading && !error && (
        <>
          <h1 id="title" tw="text-center text-2xl font-medium">
            CHART TITLE GOES HERE
          </h1>

          <HeatMapContainer>
            <D3HeatMap ref={svgRef} preserveAspectRatio="xMinYMin meet">
              <text className="y-axis-label" style={{ fill: '#9d9d9d' }}>
                {/* <tspan>Time (in Minutes)</tspan> */}
              </text>
              <g className="plot-area" />
              <g id="x-axis" />
              <g id="y-axis" />
              <g id="legend" />
            </D3HeatMap>
            <D3HeatMapToolTip id="tooltip" />
          </HeatMapContainer>

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
                  <p>temp words placeholder text</p>
                </details>
              </i>
            </li>
          </DataInformation>
        </>
      )}
    </HeatMapPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default HeatMap;
