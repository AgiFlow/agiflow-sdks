'use client';
import React, { useRef, useEffect, useState } from 'react';

interface IMeasuredContainerProps extends React.ComponentPropsWithoutRef<'div'> {}

export const MeasuredContainer = ({ children, className }: IMeasuredContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<{ width?: number }>({});
  useEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver(() => {
      setRect({
        width: ref.current?.clientWidth,
      });
    });
    resizeObserver.observe(ref.current);
    return () => resizeObserver.disconnect();
  }, []);
  return (
    <div className={className} ref={ref} style={rect}>
      {rect.width ? children : null}
    </div>
  );
};
