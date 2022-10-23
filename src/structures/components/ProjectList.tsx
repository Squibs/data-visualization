import React, { ReactNode, useCallback, useLayoutEffect, useState } from 'react';
import { navigate } from 'gatsby';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import twColors from 'tailwindcss/colors';
import { BarChart, ScatterplotGraph, HeatMap, ChoroplethMap, TreemapDiagram } from './charts';
import HomePage from './HomePage';

/* ---------------------------------- types --------------------------------- */

type IsLargeScreenProp = { isLargeScreen?: boolean };
type NavLinkProps = { firstOrLast: string } & IsLargeScreenProp;

type NavArrayLayout = [[number, string, string, ReactNode, string]];

type ProjectListProps = {
  updateCurrentGraph: (project: ReactNode, title: string, description: string) => void;
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
  [
    0,
    'Home',
    '/?',
    <HomePage />,
    'A combination of all my freeCodeCamp Data Visualization projects created using D3.js.',
  ],
  [
    1,
    'Bar Chart',
    '/?bar-chart',
    <BarChart />,
    'Data visualization project, bar chart, displaying information about the United States GDP over 68 years.',
  ],
  [
    2,
    'Scatterplot Graph',
    '/?scatterplot-graph',
    <ScatterplotGraph />,
    'Data visualization project, scatterplot graph, displaying information about doping allegations in professional bicycling.',
  ],
  [
    3,
    'Heat Map',
    '/?heat-map',
    <HeatMap />,
    'Data visualization project, heat map, displaying information about the global land-surface temperatures over 262 years.',
  ],
  [
    4,
    'Choropleth Map',
    '/?choropleth-map',
    <ChoroplethMap />,
    'Data visualization project, choropleth map, displaying information about the United States educational attainment from 2010 - 2014.',
  ],
  [
    5,
    'Treemap Diagram',
    '/?treemap-diagram',
    <TreemapDiagram />,
    'Data visualization project, treemap diagram, featuring three different graphs relating to video game sales, kickstarter pledges, and movie sales.',
  ],
] as unknown as NavArrayLayout;

const ProjectList = ({ updateCurrentGraph, isLargeScreen = false }: ProjectListProps) => {
  const [expandNav, setExpandNav] = useState(false);
  const [activeURL, setActiveURL] = useState('/?');

  // shared between page load and navigation
  const getLocationAndDataFromURL = () => {
    const windowLocation = window.location.search;
    let updatedLocation = windowLocation === '' ? '/?' : `/${window.location.search}`;

    // needed for freeCodeCamp, they append '=' at the end of my url for whatever reason
    // probably because i'm doing this all weird and using the usual query/search symbol '?'
    if (updatedLocation.endsWith('=')) updatedLocation = updatedLocation.slice(0, -1);

    // store only the first data parameter if multiple exist
    const queryParams = new URLSearchParams(updatedLocation);
    // const data = `&treemap-data=${queryParams.get('treemap-data')}`;
    let data = '';

    if (queryParams.get('treemap-data')) {
      data = `&treemap-data=${queryParams.get('treemap-data')}`;
    } else {
      data = '';
    }

    return [updatedLocation, data || ''];
  };

  const handleNavigation = (
    project: React.ReactNode,
    title: string,
    url: string,
    description: string,
  ) => {
    const locationAndData = getLocationAndDataFromURL();
    let location = locationAndData[0];
    const data = locationAndData[1];

    location = `${url}${data}`;

    setActiveURL(location);
    navigate(location);

    updateCurrentGraph(project, title, description);
  };

  const onPageLoad = useCallback(() => {
    const locationAndData = getLocationAndDataFromURL();
    const location = locationAndData[0] as string;

    // remove all but the base url
    let updatedLocation: string | null = null;
    const availableURLs = graphArray.map((u) => u[2]).slice(1);
    availableURLs.forEach((u) => {
      if (location.includes(u)) updatedLocation = u;
    });

    setActiveURL(updatedLocation || '/?');

    const currentGraph = graphArray.find((graph) => graph[2] === `${updatedLocation || '/?'}`);
    currentGraph && updateCurrentGraph(currentGraph[3], currentGraph[1], currentGraph[4]);
  }, [updateCurrentGraph]);

  useLayoutEffect(() => {
    onPageLoad();
  }, [onPageLoad]);

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
        {graphArray.map(([index, title, url, project, description]) => (
          <NavLinkContainer key={index}>
            <NavLink
              isLargeScreen={isLargeScreen}
              type="button"
              firstOrLast={index.toString()}
              className={activeURL === url ? 'active' : ''}
              onClick={() => {
                handleNavigation(project, title, url, description);
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
