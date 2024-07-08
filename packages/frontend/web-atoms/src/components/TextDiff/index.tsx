import * as React from 'react';
import { diffChars } from 'diff';

export interface ITextDiffProps {
  prev?: string | null;
  cur?: string | null | any;
}

export const TextDiff = ({ prev, cur }: ITextDiffProps) => {
  const diffs = React.useMemo(() => {
    if (typeof cur === 'object') {
      return diffChars(prev || '', JSON.stringify(cur));
    }
    return diffChars(prev || '', cur || '');
  }, [prev, cur]);

  if (!prev) return cur;
  if (!cur) return cur;

  return (
    <>
      {(diffs || []).map(diff => {
        if (diff.added) {
          return <b className='font-bold text-info'>{diff.value}</b>;
        }
        if (diff.removed) {
          return <b className='text-error line-through'>{diff.value}</b>;
        }
        return diff.value;
      })}
    </>
  );
};
