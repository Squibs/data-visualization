import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import * as d3 from 'd3';
import { SmileyFace } from './charts';

/* --------------------------------- styles --------------------------------- */

const HomePageContainer = styled.div`
  ${tw`max-w-screen-md m-auto`}

  & a {
    ${tw`text-linkcolor hover:text-cyan-400`}
  }
`;

/* ---------------------------------- types --------------------------------- */

/* -------------------------------- component ------------------------------- */

const HomePage = () => {
  return (
    <HomePageContainer>
      <h1 tw="text-center text-2xl font-medium">About this Project</h1>
      {/* prettier-ignore */}
      <p tw="mt-8">
        A single site that is a collection of all the
        <a href="https://d3js.org/" target="_blank" rel="noreferrer"> D3 </a>
        projects I created that are required to get the freeCodeCamp
        <i> Data Visualization </i>
        certification (
          <a href="#">my certification</a>
        ).
      </p>
      <br />
      <p>
        Each of these charts pulls in the data from various freeCodeCamp supplied GitHub endpoints /
        repositories via fetch requests. The data is then processed through the use of D3 to provide
        a visualization of the data.
      </p>
      <div tw="flex flex-wrap justify-between mt-10">
        {d3.range(28).map(() => (
          <SmileyFace
            key={Math.random()}
            styles={{ width: '14.28%', marginBottom: '2.5rem' }}
            random
          />
        ))}
      </div>
    </HomePageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default HomePage;
