import React, { useCallback, useEffect, useRef } from 'react';
import * as d3 from 'd3';

/* --------------------------------- styles --------------------------------- */

/* ---------------------------------- types --------------------------------- */

type SmileyFaceProps = {
  styles?: React.CSSProperties;
  random?: boolean;
};

/* -------------------------------- component ------------------------------- */

const SmileyFace = ({ styles, random }: SmileyFaceProps) => {
  const faceRef = useRef(null);
  const faceContainerRef = useRef(null);
  const faceBackgroundRef = useRef(null);
  const faceLeftEyeRef = useRef(null);
  const faceRightEyeRef = useRef(null);
  const faceMouthRef = useRef(null);

  const createSmileyFace = useCallback(() => {
    // credit goes to Curran Kelleher, I created this while going through his
    // Data Visualization with D3, JavaScript, React - Full Course [2021] freeCodeCamp video
    // https://www.youtube.com/watch?v=2LhoCfjm8R4
    const margin = 60;
    const width = 800;
    const height = 400;

    const adjustedWidth = width + margin * 2;
    const adjustedHeight = height + margin * 2;

    const strokeWidth = 12;
    const faceRadius = adjustedHeight / 2 - strokeWidth * 2;

    const eyeRadius = random ? 5 + Math.random() * 35 : 40;
    const eyeOffsetX = 90;
    const eyeOffsetY = -90;

    const mouthRadius = random ? 40 + Math.random() * 80 : 120;
    const mouthStroke = random ? 5 + Math.random() * 25 : 30;
    const mouthOffset = 20;
    const mouthArc = d3
      .arc()
      .innerRadius(mouthRadius)
      .outerRadius(mouthRadius + mouthStroke)
      .startAngle(Math.PI / (random ? 1.3 + Math.random() : 2))
      .endAngle((Math.PI * (random ? 1.85 + Math.random() * 1.15 : 3)) / 2);

    const randomColors = [
      '#94a3b8',
      '#a1a1aa',
      '#f87171',
      '#fb923c',
      '#fbbf24',
      '#facc15',
      '#a3e635',
      '#4ade80',
      '#34d399',
      '#2dd4bf',
      '#22d3ee',
      '#38bdf8',
      '#60a5fa',
      '#818cf8',
      '#a78bfa',
      '#c084fc',
      '#e879f9',
      '#f472b6',
      '#fb7185',
    ];

    d3.select(faceRef.current).attr('viewBox', `0 0 ${adjustedWidth} ${adjustedHeight}`);

    d3.select(faceContainerRef.current).attr(
      'transform',
      `translate(${adjustedWidth / 2}, ${adjustedHeight / 2})`,
    );

    d3.select(faceBackgroundRef.current)
      .attr('r', faceRadius)
      .attr(
        'fill',
        `${random ? randomColors[Math.floor(Math.random() * randomColors.length)] : 'yellow'}`,
      )
      .attr('stroke', 'black')
      .attr('stroke-width', strokeWidth);

    d3.select(faceLeftEyeRef.current)
      .attr('r', eyeRadius)
      .attr('fill', 'black')
      .attr('cx', -eyeOffsetX)
      .attr('cy', eyeOffsetY);

    d3.select(faceRightEyeRef.current)
      .attr('r', eyeRadius)
      .attr('fill', 'black')
      .attr('cx', eyeOffsetX)
      .attr('cy', eyeOffsetY);

    d3.select(faceMouthRef.current)
      .attr('d', mouthArc(null as unknown as d3.DefaultArcObject))
      .attr(
        'transform',
        // eslint-disable-next-line no-nested-ternary
        `translate(0, ${mouthOffset}) ${random ? (Math.random() > 0.5 ? 'scale(-1,1)' : '') : ''}`,
      );
  }, [random]);

  useEffect(() => {
    createSmileyFace();
  }, [createSmileyFace]);

  return (
    <svg className="face" style={styles} ref={faceRef}>
      <g className="face-container" ref={faceContainerRef}>
        <circle className="face-background" ref={faceBackgroundRef} />
        <circle className="face-left-eye" ref={faceLeftEyeRef} />
        <circle className="face-right-eye" ref={faceRightEyeRef} />
        <path className="face-mouth" ref={faceMouthRef} />
      </g>
    </svg>
  );
};

/* -------------------- default props / queries / exports ------------------- */

SmileyFace.defaultProps = {
  styles: {},
  random: false,
};

export default SmileyFace;
