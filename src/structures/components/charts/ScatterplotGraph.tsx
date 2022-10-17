import React, { useEffect, useState } from 'react';
import tw from 'twin.macro';
import getDataFromAPI from '../../utils/getDataFromAPI';

/* --------------------------------- styles --------------------------------- */

const ScatterplotContainer = tw.div``;

/* ---------------------------------- types --------------------------------- */

/* -------------------------------- component ------------------------------- */

const ScatterplotGraph = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  useEffect(() => {
    // console.log(data);
    // console.log(loading);
    // console.log(error);
  }, [data, loading, error]);

  return (
    <ScatterplotContainer>
      {loading && <h1>Loading Data...</h1>}
      {error && <div>{`There was a problem fetching the data - ${error}`}</div>}
      {data && (
        <>
          <h1 id="title">TITLE OF MY CHART</h1>
          <div>do stuff with the data</div>
        </>
      )}
    </ScatterplotContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default ScatterplotGraph;
