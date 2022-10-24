/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import type { GatsbyBrowser, RenderBodyArgs } from 'gatsby';
import { reduxStore } from './src/store';
import { GlobalStyles } from './src/vistas/styles';
import { GlobalTheme } from './src/vistas/theme';
import { GlobalLayout } from './src/structures/layouts';

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({ element }) => {
  return (
    <ReduxProvider store={reduxStore}>
      <GlobalStyles />
      <GlobalTheme>
        <GlobalLayout>{element}</GlobalLayout>
      </GlobalTheme>
    </ReduxProvider>
  );
};

export const onRenderBody = ({ setPostBodyComponents }: RenderBodyArgs) => {
  setPostBodyComponents([
    /* i'm not using alerts, and fcc tests has an alert for non chrome/firefox that I do not want */
    <script key="fccTestableProjectsFix">{`window.alert = function () {};`}</script>,
    <script
      key="fccTestableProjects"
      src="https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js"
    />,
  ]);
};
