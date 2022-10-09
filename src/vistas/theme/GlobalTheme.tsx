import React from 'react';
import { ThemeProvider, DefaultTheme } from 'styled-components';
import { Colors, Breakpoints } from '../design';

const mediaQuery = (size: keyof typeof Breakpoints) => {
  if (size === 'for0PhoneOnly') {
    return (cssStyles: TemplateStringsArray) =>
      `@media screen and (max-width: ${Breakpoints[size]}) { ${cssStyles} }`;
  }

  if (size === 'for1SmallPhonesOnly') {
    return (cssStyles: TemplateStringsArray) =>
      `@media screen and (max-width: ${Breakpoints[size]}) { ${cssStyles} }`;
  }

  return (cssStyles: TemplateStringsArray) =>
    `@media screen and (min-width: ${Breakpoints[size]}) { ${cssStyles} }`;
};

/* ---------------------------------- theme --------------------------------- */

const theme: DefaultTheme = {
  breakpoints: {
    for0PhoneOnly: () => mediaQuery('for0PhoneOnly'),
    for1SmallPhonesOnly: () => mediaQuery('for1SmallPhonesOnly'),
    for2SlightlyBiggerPhoneUp: () => mediaQuery('for2SlightlyBiggerPhoneUp'),
    for3TabletPortraitUp: () => mediaQuery('for3TabletPortraitUp'),
    for4TabletLandscapeUp: () => mediaQuery('for4TabletLandscapeUp'),
    for5DesktopUp: () => mediaQuery('for5DesktopUp'),
    for6BigDesktopUp: () => mediaQuery('for6BigDesktopUp'),
  },

  colors: {
    primaryLight: Colors.primaryLight,
    primaryNeutral: Colors.primaryNeutral,
    primaryDark: Colors.primaryDark,
    accentOne: Colors.accentOne,
    accentTwo: Colors.accentTwo,
    whiteTint: Colors.whiteTint,
  },
};

/* ---------------------------------- types --------------------------------- */

type GlobalThemeProps = {
  children: React.ReactNode;
};

/* -------------------------------- component ------------------------------- */

const GlobalTheme = ({ children }: GlobalThemeProps) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default GlobalTheme;
