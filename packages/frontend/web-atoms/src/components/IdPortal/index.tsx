'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';

export interface IdPortalProps {
  id: string;
  children?: React.ReactNode;
}
export const IdPortal = ({ id, children }: IdPortalProps) => {
  const [domNode, setDomNode] = React.useState<null | HTMLElement>(null);

  React.useEffect(() => {
    const dom = document.getElementById(id);
    if (dom) {
      setDomNode(dom);
    }
  }, []);

  if (!domNode) return null;

  return createPortal(children, domNode);
};
