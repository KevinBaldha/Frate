import React from 'react';
import {part} from '../Assets/SVGs';
import {theme} from '../Utils';

const SVGPart = part;
const BackgroundChunk = (props) => {
  const {style} = props;
  return (
    <SVGPart
      width={theme.SCREENHEIGHT * 0.9}
      height={theme.SCREENHEIGHT * 0.9}
      style={style}
    />
  );
};

export default BackgroundChunk;
