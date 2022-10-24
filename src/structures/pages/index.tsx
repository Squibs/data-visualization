import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { SEO, SmileyFaceGroup } from '../components';

/* --------------------------------- styles --------------------------------- */

const IndexPageContainer = styled.div`
  ${tw`max-w-screen-md m-auto`}

  & a {
    ${tw`text-linkcolor hover:text-cyan-400`}
  }
`;

const GenerateNewFacesButton = tw.button`flex m-auto mt-4 mb-4 py-2 px-3 rounded bg-gray-300 text-gray-700 hover:(bg-gray-400)`;

/* ---------------------------------- types --------------------------------- */

/* -------------------------------- component ------------------------------- */

const IndexPage: React.FC = () => {
  const [generateNewFaces, setGenerateNewFaces] = useState(0);

  return (
    <IndexPageContainer>
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
      <SmileyFaceGroup />
      <GenerateNewFacesButton type="button" onClick={() => setGenerateNewFaces(Math.random())}>
        Make New Faces
      </GenerateNewFacesButton>
    </IndexPageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default IndexPage;

export const Head = () => {
  return (
    <SEO
      title="Home"
      description="A combination of all my freeCodeCamp Data Visualization projects created using D3.js."
    />
  );
};
