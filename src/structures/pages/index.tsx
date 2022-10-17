import React, { ReactNode, useCallback, useState } from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { ProjectList, HomePage, SEO } from '../components';
import { useMediaQuery } from '../hooks';

/* ---------------------------------- types --------------------------------- */

/* --------------------------------- styles --------------------------------- */

const PageContainer = styled.div`
  ${tw`h-1 min-w-[230px]`}

  .dropdown-menu {
    display: block;
  }
`;

const PageTitle = tw.h1`text-2xl m-4 text-center`;

const ProjectDisplayControls = tw.div`flex justify-between px-0.5 xs:(px-2) sm:(px-5)`;
const ProjectDisplayTitle = tw.span`flex-1 grid place-items-center text-center`;

const ProjectContainer = tw.div`m-5`;

/* -------------------------------- component ------------------------------- */

const IndexPage = () => {
  const [currentGraph, setCurrentGraph] = useState<ReactNode>(HomePage);
  const [currentGraphTitle, setCurrentGraphTitle] = useState<string>('Home');

  // used to get current graph from dropdown
  const updateCurrentGraph = useCallback((project: ReactNode, title: string) => {
    setCurrentGraph(project);
    setCurrentGraphTitle(title);
  }, []);

  return (
    <PageContainer>
      <PageTitle>Data Visualization</PageTitle>
      {useMediaQuery(`screen and (max-width: 639px)`) ? (
        <ProjectDisplayControls>
          <ProjectList updateCurrentGraph={updateCurrentGraph} />
          <ProjectDisplayTitle>{currentGraphTitle}</ProjectDisplayTitle>
        </ProjectDisplayControls>
      ) : (
        <ProjectList updateCurrentGraph={updateCurrentGraph} isLargeScreen />
      )}
      <ProjectContainer>{currentGraph}</ProjectContainer>
    </PageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default IndexPage;

export const Head = () => <SEO title="Home Page" />;
