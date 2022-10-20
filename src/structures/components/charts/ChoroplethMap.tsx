import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { getDataFromAPI } from '../../utils';
import fakeCountyData from '../../../data/data-backup-choropleth-map-(US County Data).json';
import fakeEducationData from '../../../data/data-backup-choropleth-map-(US Education Data).json';

/* --------------------------------- styles --------------------------------- */

const ChoroplethMapPageContainer = styled.div`
  ${tw`w-full`}

  .states {
    fill: none;
    ${tw`stroke-amber-700`}
  }

  .county:hover {
    ${tw`fill-cyan-400`}
  }
`;
const ChoroplethMapContainer = tw.div`w-full h-auto max-w-screen-xl m-auto`;
const D3ChoroplethMap = tw.svg`w-full h-full`;
const D3ChoroplethMapToolTip = styled.div`
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

export interface EducationData {
  fips: number;
  state: string;
  area_name: string;
  bachelorsOrHigher: number;
}

/* -------------------------------- component ------------------------------- */

const ChoroplethMap = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countyData, setCountyData] = useState<any | null>(null);
  const [educationData, setEducationData] = useState<EducationData[] | null>(null);

  const svgRef = useRef(null);

  const createChoroplethMap = (cData: any, eData: EducationData[]) => {
    const margin = 60;

    // svg - fixed size as that's what this map is pre-projected to fit
    d3.select(svgRef.current).attr('viewBox', `0 0 960 600`);

    const minEducation = d3.min(eData.map((d) => d.bachelorsOrHigher)) as number;
    const maxEducation = d3.max(eData.map((d) => d.bachelorsOrHigher)) as number;

    const educationScale = d3.scaleLinear().domain([minEducation, maxEducation]).range([0, 260]);

    // --------------------legend-------------------------

    // tick values
    const colorScaleBreakpoints: number[] = [];
    for (let i = 0; i < 8; i += 1) {
      colorScaleBreakpoints.push(Number(minEducation + i * ((maxEducation - minEducation) / 8)));
    }

    // create legend scale / ticks
    d3.select('#legend')
      .append('g')
      .attr('class', 'legend-scale')
      .call(
        d3
          .axisBottom(educationScale)
          .tickValues(colorScaleBreakpoints)
          .tickFormat((d) => `${Math.round(d as number)}%`)
          .tickSize(18),
      )
      .select('.domain') // removes line connecting all ticks
      .remove();

    // relate colors to ticks
    const educationColorScale = d3
      .scaleThreshold()
      .domain(colorScaleBreakpoints)
      .range(d3.schemeOranges[9] as any);

    // leaves legendData[0][0] & legendData[8][1] as undefined, so they don't get a width
    const legendData = educationColorScale.range().map((d) => educationColorScale.invertExtent(d));

    // create legend colored squares
    d3.select('#legend')
      .append('g')
      .selectAll('rect')
      .data(legendData as number[][])
      .enter()
      .append('rect')
      .attr('x', (d) => educationScale(d[0]))
      .attr('width', (d) => (d[0] && d[1] ? educationScale(d[1]) - educationScale(d[0]) : null))
      .attr('y', 0)
      .attr('height', 15)
      .style('fill', (d) => educationColorScale(d[0]));

    // move legend position
    d3.select('#legend').attr('transform', `translate(${625}, ${margin - 20})`);

    // ------------------------us map-----------------------------

    // create us map
    d3.select('.plot-area')
      .append('g')
      .attr('class', 'counties')
      .selectAll('path')
      // @ts-expect-error features does exist here
      .data(topojson.feature(cData, cData.objects.counties).features as any)
      .enter()
      .append('path')
      .attr('class', 'county')
      .attr('fill', (d: any) => {
        const result = eData.filter((obj) => obj.fips === d.id);

        if (result[0]) return educationColorScale(result[0].bachelorsOrHigher);
        return educationColorScale(0); // no matching fips to id in the data so default 0%
      })
      .attr('d', d3.geoPath() as any)
      .attr('data-fips', (d: any) => d.id)
      .attr('data-education', (d: any) => {
        const result = eData.filter((obj) => obj.fips === d.id);

        if (result[0]) return result[0].bachelorsOrHigher;
        return 0; // no matching fips to id in the data so default 0%
      })
      .attr('data-county', (d: any) => eData.filter((obj) => obj.fips === d.id)[0].area_name)
      .attr('data-state', (d: any) => eData.filter((obj) => obj.fips === d.id)[0].state);

    // create state boundaries
    d3.select('.plot-area')
      .append('path')
      .attr('class', 'states')
      .datum(topojson.mesh(cData, cData.objects.states, (a, b) => a !== b))
      .attr('d', d3.geoPath());

    // ------------------------tooltip---------------------------
    const tooltip = d3.select('#tooltip');

    d3.selectAll('.county')
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
              ${ld.county}, ${ld.state}<br>
              ${ld.education}%
            </small>`,
          )
          .attr('data-education', ld.education)
          .style('left', `${e.pageX - mouseXOffset}px`)
          .style('top', `${e.pageY - mouseYOffset}px`);
      })
      .on('mouseleave', () => tooltip.style('display', 'none'));
  };

  // fetch data from freeCodeCamp onMount
  useEffect(() => {
    // const getData = () =>
    //   getDataFromAPI(
    //     `https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json`,
    //     setLoading,
    //     setError,
    //     setData,
    //   );

    // getData();

    const tempData = () => {
      setCountyData(fakeCountyData);
      setEducationData(fakeEducationData);
      setLoading(false);
      setError(null);
    };

    tempData();
  }, []);

  // add data to bar chart svg
  useEffect(() => {
    countyData && educationData && createChoroplethMap(countyData, educationData);
  }, [countyData, educationData]);

  return (
    <ChoroplethMapPageContainer>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {countyData && educationData && !loading && !error && (
        <>
          <h1 id="title" tw="text-center text-2xl font-medium">
            U.S. Educational Attainment
          </h1>
          <h2 id="description" tw="text-center text-xl font-light">
            Adults (aged 25 and older) with a bachelor&apos;s degree or higher (2010 - 2014)
          </h2>

          <ChoroplethMapContainer>
            <D3ChoroplethMap ref={svgRef} preserveAspectRatio="xMinYMin meet">
              <g className="plot-area" />
              <g id="x-axis" />
              <g id="y-axis" />
              <g id="legend" />
            </D3ChoroplethMap>
            <D3ChoroplethMapToolTip id="tooltip" />
          </ChoroplethMapContainer>

          <DataInformation>
            <li key="0">
              Size:
              {'\u00A0'}
              <i>
                {(
                  new TextEncoder().encode(JSON.stringify(countyData)).length / 1024 +
                  new TextEncoder().encode(JSON.stringify(educationData)).length / 1024
                ).toFixed(2)}
                {'\u00A0'}
                KB
              </i>
            </li>
            <li key="1">
              <i>
                Data:
                <a
                  href="https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx"
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
    </ChoroplethMapPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default ChoroplethMap;
