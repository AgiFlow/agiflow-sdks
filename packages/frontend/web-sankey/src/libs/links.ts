import { line, curveMonotoneX, curveMonotoneY, curveNatural } from 'd3-shape';
import { DefaultLink, DefaultNode, SankeyLinkDatum } from '../types';

interface Distance {
  left: number;
  right: number;
  height: number;
}

export const sankeyLinkHorizontal = <N extends DefaultNode, L extends DefaultLink>() => {
  const lineGenerator = line().curve(curveMonotoneX);

  return (link: SankeyLinkDatum<N, L>, contract: number) => {
    const thickness = Math.min(Math.max(10, link.thickness - contract * 2), 50);
    const halfThickness = thickness / 2;
    const linkLength = link.target.x0 - link.source.x1;
    const padLength = linkLength * 0.12;

    const createLineLoop = (distance: Distance) => {
      const sourceX = link.circularPathData?.sourceX || 0;
      const sourceY = link.circularPathData?.sourceY || 0;
      const targetX = link.circularPathData?.targetX || 0;
      const targetY = link.circularPathData?.targetY || 0;
      const rad = link.source.y1 - sourceY;
      const height = rad * 2 + distance.height;
      const right = distance.right + rad;
      const left = distance.left + rad * 0.2;
      const dots: [number, number][] = [
        // 1
        [sourceX, sourceY - halfThickness],
        // 2
        [sourceX + right / 2 + halfThickness / 2, sourceY + height / 4 + padLength / 2 - halfThickness / 2],
        // 3
        [sourceX + right + halfThickness, sourceY + height / 2],
        // 4
        [sourceX + right / 2 + halfThickness / 2, sourceY + height - height / 4 + padLength / 2 + halfThickness / 2],
        // 5
        [sourceX, sourceY + height + halfThickness],
        // 6
        [targetX - left / 2 - halfThickness / 2, targetY + height - height / 4 + padLength / 2 + halfThickness / 2],
        // 7
        [targetX - left - halfThickness, targetY + height / 2],
        // 8
        [targetX - left / 2 - halfThickness / 2, targetY + height / 4 + padLength / 2 - halfThickness / 2],
        [targetX, targetY - halfThickness],
        // reverse
        [targetX, targetY + halfThickness],
        // 8
        [targetX - left / 2 + halfThickness / 2, targetY + height / 4 + padLength / 2 + halfThickness / 2],
        // 7
        [targetX - left + halfThickness, targetY + height / 2],
        // 6
        [targetX - left / 2 + halfThickness / 2, targetY + height - height / 4 + padLength / 2 - halfThickness / 2],
        // 5
        [sourceX, sourceY + height - halfThickness],
        // 4
        [sourceX + right / 2 - halfThickness / 2, sourceY + height - height / 4 + padLength / 2 - halfThickness / 2],
        // 3
        [sourceX + right - halfThickness, sourceY + height / 2],
        // 2
        [sourceX + right / 2 - halfThickness / 2, sourceY + height / 4 + padLength / 2 + halfThickness / 2],
        // 0
        [sourceX, sourceY + halfThickness],
        // 0
        [sourceX, sourceY - halfThickness],
      ];
      return dots;
    };

    const createLine = (distance: Distance) => {
      const sourceX = link.circularPathData?.sourceX || 0;
      const sourceY = link.circularPathData?.sourceY || 0;
      const targetX = link.circularPathData?.targetX || 0;
      const targetY = link.circularPathData?.targetY || 0;
      const sourceRad = link.source.y1 - sourceY;
      const sourceHeight = sourceRad * 2 + distance.height;
      const sourceRight = distance.right + sourceRad * 0.2;
      const targetRad = link.target.y1 - targetY + distance.height;
      const targetHeight = targetRad * 2;
      const targetLeft = distance.left + targetRad * 0.2;
      const dots: [number, number][] = [
        // 1
        [sourceX, sourceY - halfThickness],
        // 2
        [sourceX + sourceRight + halfThickness, sourceY - halfThickness],
        // 3
        [sourceX + sourceRight + halfThickness, sourceY + sourceHeight + halfThickness],
        // 4
        [targetX - targetLeft - halfThickness, targetY + targetHeight + halfThickness],
        // 5
        [targetX - targetLeft - halfThickness, targetY - halfThickness],
        // 6
        [targetX, targetY - halfThickness],
        // reverse
        // 6
        [targetX, targetY + halfThickness],
        // 5
        [targetX - targetLeft + halfThickness, targetY + halfThickness],
        // 4
        [targetX - targetLeft + halfThickness, targetY + targetHeight - halfThickness],
        // 3
        [sourceX + sourceRight - halfThickness, sourceY + sourceHeight - halfThickness],
        // 2
        [sourceX + sourceRight - halfThickness, sourceY + halfThickness],
        // 1
        [sourceX, sourceY + halfThickness],
        [sourceX, sourceY - halfThickness],
      ];
      return dots;
    };

    if (link.circular) {
      const lineGenerator = line().curve(curveNatural);
      const isSame = link.source.id === link.target.id;
      if (isSame) {
        const dots = createLineLoop({ left: 40, right: 50, height: 20 });
        return lineGenerator(dots) + 'Z';
      } else {
        const dots = createLine({ left: 20, right: 20, height: 20 });
        return lineGenerator(dots) + 'Z';
      }
    }

    const dots: [number, number][] = [
      [link.source.x1, link.pos0 - halfThickness],
      [link.source.x1 + padLength, link.pos0 - halfThickness],
      [link.target.x0 - padLength, link.pos1 - halfThickness],
      [link.target.x0, link.pos1 - halfThickness],
      [link.target.x0, link.pos1 + halfThickness],
      [link.target.x0 - padLength, link.pos1 + halfThickness],
      [link.source.x1 + padLength, link.pos0 + halfThickness],
      [link.source.x1, link.pos0 + halfThickness],
      [link.source.x1, link.pos0 - halfThickness],
    ];

    return lineGenerator(dots) + 'Z';
  };
};

export const sankeyLinkVertical = <N extends DefaultNode, L extends DefaultLink>() => {
  const lineGenerator = line().curve(curveMonotoneY);

  return (link: SankeyLinkDatum<N, L>, contract: number) => {
    const thickness = Math.max(1, link.thickness - contract * 2);
    const halfThickness = thickness / 2;
    const linkLength = link.target.y0 - link.source.y1;
    const padLength = linkLength * 0.12;

    const dots: [number, number][] = [
      [link.pos0 + halfThickness, link.source.y1],
      [link.pos0 + halfThickness, link.source.y1 + padLength],
      [link.pos1 + halfThickness, link.target.y0 - padLength],
      [link.pos1 + halfThickness, link.target.y0],
      [link.pos1 - halfThickness, link.target.y0],
      [link.pos1 - halfThickness, link.target.y0 - padLength],
      [link.pos0 - halfThickness, link.source.y1 + padLength],
      [link.pos0 - halfThickness, link.source.y1],
      [link.pos0 + halfThickness, link.source.y1],
    ];

    return lineGenerator(dots) + 'Z';
  };
};
