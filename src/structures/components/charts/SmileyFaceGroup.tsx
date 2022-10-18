import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import tw from 'twin.macro';
import SmileyFace from './SmileyFace';

/* --------------------------------- styles --------------------------------- */

/* ---------------------------------- types --------------------------------- */

type SmileyFaceGroupProps = {
  generateNewFaces: number;
};

/* -------------------------------- component ------------------------------- */

const SmileyFaceGroup = () => {
  const [generateFaces, setGenerateFaces] = useState<number>(0);

  return (
    <div tw="flex flex-wrap justify-between mt-10">
      {d3.range(28).map((e, i) => (
        <SmileyFace
          key={Math.random()}
          styles={{ width: '14%', marginBottom: `${i > 20 ? '0' : '2rem'}` }}
          random
        />
      ))}
    </div>
  );
};

/* -------------------- default props / queries / exports ------------------- */

export default SmileyFaceGroup;
