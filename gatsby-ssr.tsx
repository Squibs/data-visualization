/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/ssr-apis/
 */

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import type { GatsbyBrowser } from 'gatsby';
import { GlobalStyles } from './src/vistas/styles';
import { GlobalTheme } from './src/vistas/theme';
import { reduxStore } from './src/store';

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({ element }) => {
  return (
    <ReduxProvider store={reduxStore}>
      <GlobalStyles />
      <GlobalTheme>{element}</GlobalTheme>
    </ReduxProvider>
  );
};
