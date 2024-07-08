'use client';
import React, { useRef, useEffect, useState } from 'react';

interface IMeasuredContainerProps extends React.ComponentPropsWithoutRef<'div'> {}

export const MeasuredContainer = ({ children, className }: IMeasuredContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ width?: number; height?: number }>({});
  useEffect(() => {
    if (ref.current) {
      setRect({
        width: ref.current.clientWidth,
        height: ref.current.clientHeight,
      });
    }
  }, []);
  return (
    <div className={className} ref={ref} style={rect}>
      {rect.width ? children : null}
    </div>
  );
};
