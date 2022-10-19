import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import * as d3 from 'd3';
import { getDataFromAPI } from '../../utils';
import fakeData from '../../../data/data-backup-heat-map-(Global Temperature).json';

/* --------------------------------- styles --------------------------------- */

const HeatMapPageContainer = styled.div`
  ${tw`w-full`}

  .cell:hover {
    fill: #29c929;
  }
`;
const HeatMapContainer = tw.div`w-full h-auto max-w-screen-xl m-auto`;
const D3HeatMap = tw.svg`w-full h-full`;
const D3HeatMapToolTip = styled.div`
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
          .tickFormat((d, i) => (typeof d === 'string' ? d : `${d3.format('.1f')(d)}℃`)) as any,
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
      .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat('%B') as any) as any)
      .attr('transform', `translate(${margin}, ${margin / 1.5})`); // adjusts y-axis upwards a bit so ticks can be in center

    // bars (cells)
    d3.select('.plot-area')
      .selectAll('.cell')
      .data(yearDataSet.map((d) => scaleTime(d)))
      .join('rect')
      .attr('class', 'cell')
      .attr('x', (d, i) => xScale(yearDataSet[i]) + margin)
      .attr('width', 4)
      .attr('data-year', (d, i) => `${dataset.monthlyVariance[i].year}`)
      .attr('y', (d, i) => yScale(monthDataSet[i]) + margin / 2.65) // moves entire graph up a bit to align with y-axis that is also adjusted upwards
      .attr('height', 38)
      // for fCC tests, -1 because I guess they wanted 0 based month, which the data isn't even based on
      // and they don't want a date object either, which is what I would actually use for tooltips
      .attr('data-month', (d, i) => `${dataset.monthlyVariance[i].month - 1}`)
      .attr('fill', (d, i) => {
        return varianceScale(dataset.baseTemperature + dataset.monthlyVariance[i].variance);
      })
      .attr('data-temp', (d, i) => dataset.baseTemperature + dataset.monthlyVariance[i].variance)
      .attr('data-variance', (d, i) => dataset.monthlyVariance[i].variance);

    // ------------------------tooltip--------------------------
    const tooltip = d3.select('#tooltip');
    d3.selectAll('.cell')
      .on('mouseover', (e) => {
        tooltip.style('display', 'block');
      })
      .on('mousemove', (e) => {
        const tooltipElement = tooltip.node() as Element;
        const mouseXOffset = tooltipElement.getBoundingClientRect().width / 2;
        const mouseYOffset = tooltipElement.getBoundingClientRect().height + 10;
        const ld = e.target.dataset; // local dataset
        let month = new Date() as any;
        month.setMonth(ld.month);
        month = month.toLocaleString('en-US', { month: 'long' }) as string;

        tooltip
          .html(
            `<small>
              ${ld.year} - ${month} - ${Number(ld.temp).toFixed(1)}℃<br>
              Variance of ${Number(ld.variance).toFixed(1)}℃
            </small>`,
          )
          .attr('data-year', ld.year)
          .style('left', `${e.pageX - mouseXOffset}px`)
          .style('top', `${e.pageY - mouseYOffset}px`);
      })
      .on('mouseleave', () => tooltip.style('display', 'none'));
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
            Global Land-Surface Temperatures
          </h1>
          <h2 id="description" tw="text-center text-xl font-light">
            {`(${d3.min(data.monthlyVariance.map((d) => d.year))} -
            ${d3.max(data.monthlyVariance.map((d) => d.year))}) `}
            Base temperature of:
            {` ${data.baseTemperature.toFixed(2)}℃`}
          </h2>

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
                Data:
                <a
                  href="http://berkeleyearth.org/data/"
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
    </HeatMapPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default HeatMap;
