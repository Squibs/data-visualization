import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import socialBanner from '../../images/url-thumbnail.png';

/* ---------------------------------- types --------------------------------- */

type SEOProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

/* -------------------------------- component ------------------------------- */

const SEO = ({ description, title, children }: SEOProps) => {
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
          }
        }
      }
    `,
  );

  const metaDescription = description || site.siteMetadata.description;
  const defaultTitle = site.siteMetadata?.title;

  return (
    <>
      <title>{defaultTitle ? `${title} | ${defaultTitle}` : title}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Data Visualization" />
      <meta property="og:image" content={socialBanner} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={site.siteMetadata?.author || ``} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={socialBanner} />
      {children}
    </>
  );
};

/* -------------------- default props / queries / exports ------------------- */

SEO.defaultProps = {
  description: ``,
  children: null,
};

export default SEO;
