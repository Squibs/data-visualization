import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { navigate } from 'gatsby';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import twColors from 'tailwindcss/colors';
import { BarChart, ScatterplotGraph, HeatMap, ChoroplethMap, TreemapDiagram } from './charts';
import HomePage from './HomePage';

/* ---------------------------------- types --------------------------------- */

type IsLargeScreenProp = { isLargeScreen?: boolean };
type NavLinkProps = { firstOrLast: string } & IsLargeScreenProp;

type NavArrayLayout = [[number, string, string, ReactNode]];

type ProjectListProps = {
  updateCurrentGraph: (project: ReactNode, title: string) => void;
} & IsLargeScreenProp;

/* --------------------------------- styles --------------------------------- */

const StyledNav = styled.nav<IsLargeScreenProp>`
  ${tw`inline-block relative`}

  .active {
    background-color: ${twColors.gray[400]}; // bg-gray-400
  }

  ${({ isLargeScreen }) => isLargeScreen && tw`w-full lg:(max-w-fit flex m-auto)`}
`;

// mobile dropdown
const NavButton = tw.button`bg-gray-300 text-gray-700 py-2 px-3 rounded inline-flex items-center mr-0.5`;
const NavChevron = tw.svg`fill-current h-4 w-4`;

// list of nav items / charts <ul>
const NavListContainer = styled.ul<IsLargeScreenProp>`
  ${tw`absolute hidden text-gray-700 pt-0.5`}

  ${({ isLargeScreen }) =>
    isLargeScreen && tw`relative grid grid-cols-3 grid-rows-2 w-full lg:(flex w-full)`}
`;

// <li><button></li>
const NavLinkContainer = tw.li`lg:(mx-2)`;
const NavLink = styled.button<NavLinkProps>`
  ${tw`py-2 px-3 block whitespace-nowrap w-full [text-align: left] bg-gray-300 hover:(bg-gray-400) focus:(bg-gray-400)`}

  /* if the element is for large screens */
  ${({ isLargeScreen }) => isLargeScreen && tw`text-center rounded-none`}
`;

/* -------------------------------- component ------------------------------- */

const graphArray = [
  [0, 'Home', '/?', <HomePage />],
  [1, 'Bar Chart', '/?bar-chart', <BarChart />],
  [2, 'Scatterplot Graph', '/?scatterplot-graph', <ScatterplotGraph />],
  [3, 'Heat Map', '/?heat-map', <HeatMap />],
  [4, 'Choropleth Map', '/?choropleth-map', <ChoroplethMap />],
  [5, 'Treemap Diagram', '/?treemap-diagram', <TreemapDiagram />],
] as unknown as NavArrayLayout;

const ProjectList = ({ updateCurrentGraph, isLargeScreen = false }: ProjectListProps) => {
  const [expandNav, setExpandNav] = useState(false);
  const [activeURL, setActiveURL] = useState('/?');

  // get current url to check for active project (/? - home, /?bar-chart - Bar Chart)
  useEffect(() => {
    const windowLocation = window.location.search;
    let updatedLocation = windowLocation === '' ? '/?' : `/${window.location.search}`;

    // needed for freeCodeCamp, they append '=' at the end of my url for whatever reason
    // probably because i'm doing this all weird and using the usual query/search symbol '?'
    if (updatedLocation.endsWith('=')) updatedLocation = updatedLocation.slice(0, -1);

    setActiveURL(updatedLocation);

    const currentGraph = graphArray.find((graph) => graph[2] === `${updatedLocation}`);
    currentGraph && updateCurrentGraph(currentGraph[3], currentGraph[1]);
  }, [updateCurrentGraph]);

  return (
    <StyledNav
      isLargeScreen={isLargeScreen}
      onBlur={(e) => (e.currentTarget.contains(e.relatedTarget) ? null : setExpandNav(false))}
    >
      {!isLargeScreen && (
        <NavButton type="button" onClick={() => setExpandNav((p) => !p)}>
          <span tw="mr-1">Select a Chart:</span>
          <NavChevron xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </NavChevron>
        </NavButton>
      )}
      <NavListContainer
        isLargeScreen={isLargeScreen}
        css={css`
          ${expandNav ? 'display: block' : 'display: hidden'}
        `}
      >
        {graphArray.map(([index, title, url, project]) => (
          <NavLinkContainer key={index}>
            <NavLink
              isLargeScreen={isLargeScreen}
              type="button"
              firstOrLast={index.toString()}
              className={activeURL === url ? 'active' : ''}
              onClick={() => {
                setActiveURL(url);
                updateCurrentGraph(project, title);
                setExpandNav(false);
                navigate(url);
              }}
            >
              {title}
            </NavLink>
          </NavLinkContainer>
        ))}
      </NavListContainer>
    </StyledNav>
  );
};

/* -------------------- default props / queries / exports ------------------- */

ProjectList.defaultProps = {
  isLargeScreen: false,
};

export default ProjectList;
