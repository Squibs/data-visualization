import React from 'react';
import { createGlobalStyle } from 'styled-components';
import { Normalize } from 'styled-normalize';
import { GlobalStyles as BaseStyles } from 'twin.macro';

/* --------------------------------- styles --------------------------------- */

const GlobalStyle = createGlobalStyle``;

/* -------------------------------- component ------------------------------- */

const GlobalStyles = () => {
  return (
    <>
      <Normalize />
      <BaseStyles />
      <GlobalStyle />
    </>
  );
};

export default GlobalStyles;
