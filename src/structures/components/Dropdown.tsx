import React, { ReactNode, useState } from 'react';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import { BarChart, ScatterplotGraph, HeatMap, ChoroplethMap, TreemapDiagram } from './charts';
import HomePage from './HomePage';

/* ---------------------------------- types --------------------------------- */

type NavLinkProps = { firstOrLast: string };
type NavArrayLayout = [[number, string, string, ReactNode]];

type DropdownProps = {
  updateCurrentGraph: ({ project, title }: { project: ReactNode; title: string }) => void;
};

/* --------------------------------- styles --------------------------------- */

const StyledNav = tw.nav`inline-block relative`;

const NavButton = tw.button`bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded inline-flex items-center`;

const NavChevron = tw.svg`fill-current h-4 w-4`;

const NavListContainer = tw.ul`absolute hidden text-gray-700 pt-0.5`;

const NavLink = styled.button<NavLinkProps>`
  ${({ firstOrLast }) => (firstOrLast === '0' ? tw`rounded-t` : null)}
  ${({ firstOrLast }) => (firstOrLast === '5' ? tw`rounded-b` : null)}
  ${tw`py-2 px-4 block whitespace-nowrap w-full [text-align: left] bg-gray-200 hover:bg-gray-400`}
`;

/* -------------------------------- component ------------------------------- */

const Dropdown = ({ updateCurrentGraph }: DropdownProps) => {
  const [expandNav, setExpandNav] = useState(false);

  return (
    <StyledNav
      onBlur={(e) => (e.currentTarget.contains(e.relatedTarget) ? null : setExpandNav(false))}
    >
      <NavButton type="button" onClick={() => setExpandNav((p) => !p)}>
        <span tw="mr-1">Select a Chart:</span>
        <NavChevron xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </NavChevron>
      </NavButton>
      <NavListContainer
        css={css`
          ${expandNav ? 'display: block' : 'display: hidden'}
        `}
      >
        {(
          [
            [0, 'Home', '#', HomePage],
            [1, 'Bar Chart', '#bar-chart', BarChart],
            [2, 'Scatterplot Graph', '#scatterplot-graph', ScatterplotGraph],
            [3, 'Heat Map', '#heat-map', HeatMap],
            [4, 'Choropleth Map', '#choropleth-map', ChoroplethMap],
            [5, 'Treemap Diagram', '#treemap-diagram', TreemapDiagram],
          ] as unknown as NavArrayLayout
        ).map(([index, title, url, project]) => (
          <li key={index}>
            <NavLink
              firstOrLast={index.toString()}
              onClick={() => {
                updateCurrentGraph({ project, title });
                setExpandNav(false);
              }}
            >
              {title}
            </NavLink>
          </li>
        ))}
      </NavListContainer>
    </StyledNav>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default Dropdown;
