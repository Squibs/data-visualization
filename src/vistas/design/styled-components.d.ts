import 'styled-components';
import type {} from 'styled-components/cssprop';

declare module 'styled-components' {
  export interface DefaultTheme {
    breakpoints: {
      /** 1px - 599px: above for1SmallPhonesOnly to override styles at breakpoint */
      for0PhoneOnly: () => (cssStyles: TemplateStringsArray) => string;
      /** 1px - 350px */
      for1SmallPhonesOnly: () => (cssStyles: TemplateStringsArray) => string;
      /** 600px - 767px + */
      for2SlightlyBiggerPhoneUp: () => (cssStyles: TemplateStringsArray) => string;
      /** 768px - 899px + */
      for3TabletPortraitUp: () => (cssStyles: TemplateStringsArray) => string;
      /** 900px - 1199px + */
      for4TabletLandscapeUp: () => (cssStyles: TemplateStringsArray) => string;
      /** 1200px - 1799px + */
      for5DesktopUp: () => (cssStyles: TemplateStringsArray) => string;
      /** 1800px + */
      for6BigDesktopUp: () => (cssStyles: TemplateStringsArray) => string;
    };

    colors: {
      /** Light Gray: Black Font */
      primaryLight: string;
      /** Y In Mn Blue: White Font  */
      primaryNeutral: string;
      /** Gunmetal: White Font */
      primaryDark: string;
      /** Vegas Gold: Black Font */
      accentOne: string;
      /** Upsdell Red: White Font */
      accentTwo: string;
      /** Cultured: Black Font */
      whiteTint: string;
    };
  }
}
