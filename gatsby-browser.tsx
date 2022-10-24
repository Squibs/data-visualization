/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import type { GatsbyBrowser } from 'gatsby';
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
