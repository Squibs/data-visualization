import React, { ReactNode, useCallback, useState } from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import type { HeadProps } from 'gatsby';
import { Router, RouteComponentProps } from '@reach/router';
import { ProjectList, HomePage, SEO } from '../components';
import { useMediaQuery } from '../hooks';
import { metaData } from '../components/ProjectList';

/* ---------------------------------- types --------------------------------- */

interface IndexPageProps extends RouteComponentProps {}

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

// client only routes
// https://stackoverflow.com/questions/63771163/how-to-redirect-all-routes-to-gatsby-index
// which led me to gatsby example of client only routes https://github.com/gatsbyjs/gatsby/tree/master/examples/client-only-paths
const App = () => (
  <>
    <Router id="reach-router">
      <IndexPage path="/" />
      <IndexPage path="/bar-chart" />
      <IndexPage path="/scatterplot-graph" />
      <IndexPage path="/heat-map" />
      <IndexPage path="/choropleth-map" />
      <IndexPage path="/treemap-diagram" />
    </Router>
  </>
);

const IndexPage: React.FC<IndexPageProps> = () => {
  const [currentGraph, setCurrentGraph] = useState<ReactNode>(<HomePage />);
  const [currentGraphTitle, setCurrentGraphTitle] = useState<string>('Home');
  const [currentDescription, setCurrentDescription] = useState<string>('');

  // used to get current graph from dropdown
  const updateCurrentGraph = useCallback(
    (project: ReactNode, title: string, description: string) => {
      setCurrentGraph(project);
      setCurrentGraphTitle(title);
      setCurrentDescription(description);
    },
    [],
  );

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
          <a href="https://zachary-holman.netlify.app/" target="_blank" rel="noreferrer">
            Zachary Holman
          </a>
        </span>
      </StyledFooter>
    </PageContainer>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default App;

export const Head = ({ location }: HeadProps) => {
  const path = metaData[location.pathname];
  return <SEO title={path.title} description={path.description} />;
};
