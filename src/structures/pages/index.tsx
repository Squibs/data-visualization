import React from 'react';
import { graphql } from 'gatsby';
import { SEO } from '../components';

/* --------------------------------- styles --------------------------------- */

/* ---------------------------------- types --------------------------------- */

// type DataProps = {};
// type IndexPageProps = DataProps;

/* -------------------------------- component ------------------------------- */

const IndexPage = () => {
  return <h1>Data Visualization</h1>;
};

/* -------------------- default props / queries / exports ------------------- */

export default IndexPage;

// export const query = graphql``;

export const Head = () => <SEO title="Home Page" />;
