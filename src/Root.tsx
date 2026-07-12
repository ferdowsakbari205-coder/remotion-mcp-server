import React from 'react';
import {Composition} from 'remotion';
import {MyComp} from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MyComp"
      component={MyComp}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{text: 'Hello World'}}
    />
  );
};
