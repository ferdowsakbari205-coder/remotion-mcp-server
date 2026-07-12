import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

export const MyComp: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          opacity,
          color: 'white',
          fontSize: 80,
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '0 40px',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
