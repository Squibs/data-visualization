import React, { ReactNode, useCallback, useState } from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { ProjectList, HomePage, SEO } from '../components';
import { useMediaQuery } from '../hooks';

/* ---------------------------------- types --------------------------------- */

/* --------------------------------- styles --------------------------------- */

const PageContainer = styled.div`
  ${tw`min-w-[230px] flex flex-col h-full`}

  background-color: #2c2c2c;
  color: #9d9d9d;

  & div:first-child {
    flex: 1 0 auto;
  }

  .dropdown-menu {
    display: block;
  }
`;

const PageTitle = tw.h1`text-2xl m-4 text-center`;

const ProjectDisplayControls = tw.div`flex justify-between px-0.5 xs:(px-2) sm:(px-5)`;
const ProjectDisplayTitle = tw.span`flex-1 grid place-items-center text-center`;

const ProjectContainer = tw.div`max-w-screen-xl m-auto p-5 pb-0`;

const StyledFooter = styled.footer`
  ${tw`text-center pb-2`}

  flex-shrink: 0;
  font-family: 'Righteous', cursive;
  overflow: hidden;
  display: inline-flex;
  margin: auto;
  flex-wrap: wrap;
  justify-content: center;
  background-color: #2c2c2c;
  width: 100%;

  & a {
    text-decoration: none;
    ${tw`text-linkcolor hover:text-cyan-400`}
  }
`;

/* -------------------------------- component ------------------------------- */

const IndexPage = () => {
  const [currentGraph, setCurrentGraph] = useState<ReactNode>(<HomePage />);
  const [currentGraphTitle, setCurrentGraphTitle] = useState<string>('Home');

  // used to get current graph from dropdown
  const updateCurrentGraph = useCallback((project: ReactNode, title: string) => {
    setCurrentGraph(project);
    setCurrentGraphTitle(title);
  }, []);

  return (
    <PageContainer>
      <div style={{ backgroundColor: '#2c2c2c' }}>
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
      </div>
      <StyledFooter>
        <span>Designed &amp; Coded by&nbsp;</span>
        <span>
          <a href="https://zachary-holman.netlify.app/">Zachary Holman</a>
        </span>
      </StyledFooter>
    </PageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default IndexPage;

export const Head = () => <SEO title="Home Page" />;
