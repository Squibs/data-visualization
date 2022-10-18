import React, { useEffect, useRef, useState } from 'react';
import tw from 'twin.macro';
import getDataFromAPI from '../../utils/getDataFromAPI';
import fakeData from '../../../data/data-backup-scatterplot-graph-(Cyclist Data).json';

/* --------------------------------- styles --------------------------------- */

const ScatterplotGraphPageContainer = tw.div``;
const ScatterplotGraphContainer = tw.div``;
const D3ScatterplotGraph = tw.svg``;
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
  const [data, setData] = useState<CyclistData | null>(null);

  const svgRef = useRef(null);

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
      setData(fakeData as unknown as CyclistData);
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
            <D3ScatterplotGraph ref={svgRef}>
              <text className="y-axis-label" style={{ fill: '#9d9d9d' }}>
                {/* <tspan>Gross Domestic Product</tspan>
                <tspan x="45" dy="1.2em">
                  (In Billions)
                </tspan> */}
              </text>
              <g className="plot-area" />
              <g id="x-axis" />
              <g id="y-axis" />
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
                  href="https://fred.stlouisfed.org/data/GDP.txt"
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
