import * as React from 'react';

export const Level = ({ level }: { level: number }) => {
  return new Array(level).fill(0).map((_, index) => (
    <span key={index} className='text-background-shade'>
      {index + 1}
    </span>
  ));
};
