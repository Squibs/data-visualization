import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

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
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content={site.siteMetadata?.author || ``} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
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
