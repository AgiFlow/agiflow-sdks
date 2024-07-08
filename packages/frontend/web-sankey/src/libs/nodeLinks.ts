import findCircuits from 'elementary-circuits-directed-graph';
import { linkHorizontal } from 'd3-shape';
import { min, max } from 'd3-array';
import { getNodeID } from './helpers';
import { baseRadius, verticalMargin } from './constant';

// /////////////////////////////////////////////////////////////////////////////////
// Cycle functions
// portion of code to detect circular links based on Colin Fergus' bl.ock https://gist.github.com/cfergus/3956043

// Identify circles in the link objects
export function identifyCircles(graph, _, sortNodes) {
  let circularLinkID = 0;
  if (sortNodes === null) {
    // Building adjacency graph
    const adjList: any[] = [];
    for (let i = 0; i < graph.links.length; i++) {
      const link = graph.links[i];
      const source = link.source.index;
      const target = link.target.index;
      if (!adjList[source]) adjList[source] = [];
      if (!adjList[target]) adjList[target] = [];

      // Add links if not already in set
      if (adjList[source].indexOf(target) === -1) adjList[source].push(target);
    }

    // Find all elementary circuits
    const cycles = findCircuits(adjList);

    // Sort by circuits length
    cycles.sort(function (a, b) {
      return a.length - b.length;
    });

    const circularLinks = {};
    for (let i = 0; i < cycles.length; i++) {
      const cycle = cycles[i];
      const last = cycle.slice(-2);
      if (!circularLinks[last[0]]) circularLinks[last[0]] = {};
      circularLinks[last[0]][last[1]] = true;
    }

    graph.links.forEach(function (link) {
      const target = link.target.index;
      const source = link.source.index;
      // If self-linking or a back-edge
      if (target === source || (circularLinks[source] && circularLinks[source][target])) {
        link.circular = true;
        link.circularLinkID = circularLinkID;
        circularLinkID = circularLinkID + 1;
      } else {
        link.circular = false;
      }
    });
  } else {
    graph.links.forEach(function (link) {
      if (link.source[sortNodes] < link.target[sortNodes]) {
        link.circular = false;
      } else {
        link.circular = true;
        link.circularLinkID = circularLinkID;
        circularLinkID = circularLinkID + 1;
      }
    });
  }
}

// Assign a circular link type (top or bottom), based on:
// - if the source/target node already has circular links, then use the same type
// - if not, choose the type with fewer links
export function selectCircularLinkTypes(graph, id) {
  let numberOfTops = 0;
  let numberOfBottoms = 0;
  graph.links.forEach(function (link) {
    if (link.circular) {
      // if either souce or target has type already use that
      if (link.source.circularLinkType || link.target.circularLinkType) {
        // default to source type if available
        link.circularLinkType = link.source.circularLinkType
          ? link.source.circularLinkType
          : link.target.circularLinkType;
      } else {
        link.circularLinkType = numberOfTops < numberOfBottoms ? 'top' : 'bottom';
      }

      if (link.circularLinkType === 'top') {
        numberOfTops = numberOfTops + 1;
      } else {
        numberOfBottoms = numberOfBottoms + 1;
      }

      graph.nodes.forEach(function (node) {
        if (getNodeID(node, id) === getNodeID(link.source, id) || getNodeID(node, id) === getNodeID(link.target, id)) {
          node.circularLinkType = link.circularLinkType;
        }
      });
    }
  });

  //correct self-linking links to be same direction as node
  graph.links.forEach(function (link) {
    if (link.circular) {
      //if both source and target node are same type, then link should have same type
      if (link.source.circularLinkType === link.target.circularLinkType) {
        link.circularLinkType = link.source.circularLinkType;
      }
      //if link is selflinking, then link should have same type as node
      if (selfLinking(link, id)) {
        link.circularLinkType = link.source.circularLinkType;
      }
    }
  });
}

// Return the angle between a straight line between the source and target of the link, and the vertical plane of the node
export function linkAngle(link) {
  const adjacent = Math.abs(link.y1 - link.y0);
  const opposite = Math.abs(link.target.x0 - link.source.x1);

  return Math.atan(opposite / adjacent);
}

// Check if two circular links potentially overlap
export function circularLinksCross(link1, link2) {
  if (link1.source.column < link2.target.column) {
    return false;
  } else if (link1.target.column > link2.source.column) {
    return false;
  } else {
    return true;
  }
}

// Return the number of circular links for node, not including self linking links
export function numberOfNonSelfLinkingCycles(node, id) {
  let sourceCount = 0;
  node.sourceLinks.forEach(function (l) {
    sourceCount = l.circular && !selfLinking(l, id) ? sourceCount + 1 : sourceCount;
  });

  let targetCount = 0;
  node.targetLinks.forEach(function (l) {
    targetCount = l.circular && !selfLinking(l, id) ? targetCount + 1 : targetCount;
  });

  return sourceCount + targetCount;
}

// Check if a circular link is the only circular link for both its source and target node
export function onlyCircularLink(link) {
  const nodeSourceLinks = link.source.sourceLinks;
  let sourceCount = 0;
  nodeSourceLinks.forEach(function (l) {
    sourceCount = l.circular ? sourceCount + 1 : sourceCount;
  });

  const nodeTargetLinks = link.target.targetLinks;
  let targetCount = 0;
  nodeTargetLinks.forEach(function (l) {
    targetCount = l.circular ? targetCount + 1 : targetCount;
  });

  if (sourceCount > 1 || targetCount > 1) {
    return false;
  } else {
    return true;
  }
}

// creates vertical buffer values per set of top/bottom links
export function calcVerticalBuffer(links, circularLinkGap, id) {
  links.sort(sortLinkColumnAscending);
  links.forEach(function (link, i) {
    let buffer = 0;

    if (selfLinking(link, id) && onlyCircularLink(link)) {
      link.circularPathData.verticalBuffer = buffer + link.width / 2;
    } else {
      let j = 0;
      for (j; j < i; j++) {
        if (circularLinksCross(links[i], links[j])) {
          const bufferOverThisLink = links[j].circularPathData.verticalBuffer + links[j].width / 2 + circularLinkGap;
          buffer = bufferOverThisLink > buffer ? bufferOverThisLink : buffer;
        }
      }

      link.circularPathData.verticalBuffer = buffer + link.width / 2;
    }
  });

  return links;
}

// calculate the optimum path for a link to reduce overlaps
export function addCircularPathData(graph, circularLinkGap, y1, id) {
  const buffer = 5;

  const minY = min(graph.links, function (link) {
    return link.source.y0;
  });

  // create object for circular Path Data
  graph.links.forEach(function (link) {
    if (link.circular) {
      link.circularPathData = {};
    }
  });

  // calc vertical offsets per top/bottom links
  const topLinks = graph.links.filter(function (l) {
    return l.circularLinkType === 'top';
  });
  /* topLinks = */ calcVerticalBuffer(topLinks, circularLinkGap, id);

  const bottomLinks = graph.links.filter(function (l) {
    return l.circularLinkType === 'bottom';
  });
  /* bottomLinks = */ calcVerticalBuffer(bottomLinks, circularLinkGap, id);

  // add the base data for each link
  graph.links.forEach(function (link) {
    if (link.circular) {
      link.circularPathData.arcRadius = link.width + baseRadius;
      link.circularPathData.leftNodeBuffer = buffer;
      link.circularPathData.rightNodeBuffer = buffer;
      link.circularPathData.sourceWidth = link.source.x1 - link.source.x0;
      link.circularPathData.sourceX = link.source.x0 + link.circularPathData.sourceWidth;
      link.circularPathData.targetX = link.target.x0;
      link.circularPathData.sourceY = link.y0;
      link.circularPathData.targetY = link.y1;

      // for self linking paths, and that the only circular link in/out of that node
      if (selfLinking(link, id) && onlyCircularLink(link)) {
        link.circularPathData.leftSmallArcRadius = baseRadius + link.width / 2;
        link.circularPathData.leftLargeArcRadius = baseRadius + link.width / 2;
        link.circularPathData.rightSmallArcRadius = baseRadius + link.width / 2;
        link.circularPathData.rightLargeArcRadius = baseRadius + link.width / 2;

        if (link.circularLinkType === 'bottom') {
          link.circularPathData.verticalFullExtent =
            link.source.y1 + verticalMargin + link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent - link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent - link.circularPathData.rightLargeArcRadius;
        } else {
          // top links
          link.circularPathData.verticalFullExtent =
            link.source.y0 - verticalMargin - link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent + link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent + link.circularPathData.rightLargeArcRadius;
        }
      } else {
        // else calculate normally
        // add left extent coordinates, based on links with same source column and circularLink type
        let thisColumn = link.source.column;
        const thisCircularLinkType = link.circularLinkType;
        let sameColumnLinks = graph.links.filter(function (l) {
          return l.source.column === thisColumn && l.circularLinkType === thisCircularLinkType;
        });

        if (link.circularLinkType === 'bottom') {
          sameColumnLinks.sort(sortLinkSourceYDescending);
        } else {
          sameColumnLinks.sort(sortLinkSourceYAscending);
        }

        let radiusOffset = 0;
        sameColumnLinks.forEach(function (l, i) {
          if (l.circularLinkID === link.circularLinkID) {
            link.circularPathData.leftSmallArcRadius = baseRadius + link.width / 2 + radiusOffset;
            link.circularPathData.leftLargeArcRadius = baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
          }
          radiusOffset = radiusOffset + l.width;
        });

        // add right extent coordinates, based on links with same target column and circularLink type
        thisColumn = link.target.column;
        sameColumnLinks = graph.links.filter(function (l) {
          return l.target.column === thisColumn && l.circularLinkType === thisCircularLinkType;
        });
        if (link.circularLinkType === 'bottom') {
          sameColumnLinks.sort(sortLinkTargetYDescending);
        } else {
          sameColumnLinks.sort(sortLinkTargetYAscending);
        }

        radiusOffset = 0;
        sameColumnLinks.forEach(function (l, i) {
          if (l.circularLinkID === link.circularLinkID) {
            link.circularPathData.rightSmallArcRadius = baseRadius + link.width / 2 + radiusOffset;
            link.circularPathData.rightLargeArcRadius =
              baseRadius + link.width / 2 + i * circularLinkGap + radiusOffset;
          }
          radiusOffset = radiusOffset + l.width;
        });

        // bottom links
        if (link.circularLinkType === 'bottom') {
          link.circularPathData.verticalFullExtent =
            Math.max(y1, link.source.y1, link.target.y1) + verticalMargin + link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent - link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent - link.circularPathData.rightLargeArcRadius;
        } else {
          // top links
          link.circularPathData.verticalFullExtent = minY - verticalMargin - link.circularPathData.verticalBuffer;
          link.circularPathData.verticalLeftInnerExtent =
            link.circularPathData.verticalFullExtent + link.circularPathData.leftLargeArcRadius;
          link.circularPathData.verticalRightInnerExtent =
            link.circularPathData.verticalFullExtent + link.circularPathData.rightLargeArcRadius;
        }
      }

      // all links
      link.circularPathData.leftInnerExtent = link.circularPathData.sourceX + link.circularPathData.leftNodeBuffer;
      link.circularPathData.rightInnerExtent = link.circularPathData.targetX - link.circularPathData.rightNodeBuffer;
      link.circularPathData.leftFullExtent =
        link.circularPathData.sourceX + link.circularPathData.leftLargeArcRadius + link.circularPathData.leftNodeBuffer;
      link.circularPathData.rightFullExtent =
        link.circularPathData.targetX -
        link.circularPathData.rightLargeArcRadius -
        link.circularPathData.rightNodeBuffer;
    }

    if (link.circular) {
      link.path = createCircularPathString(link);
    } else {
      const normalPath = linkHorizontal()
        .source(function (d) {
          const x = d.source.x0 + (d.source.x1 - d.source.x0);
          const y = d.y0;
          return [x, y];
        })
        .target(function (d) {
          const x = d.target.x0;
          const y = d.y1;
          return [x, y];
        });
      link.path = normalPath(link);
    }
  });
}

// create a d path using the addCircularPathData
export function createCircularPathString(link) {
  let pathString = '';
  // 'pathData' is assigned a value but never used
  // const pathData = {}

  if (link.circularLinkType === 'top') {
    pathString =
      // start at the right of the source node
      'M' +
      link.circularPathData.sourceX +
      ' ' +
      link.circularPathData.sourceY +
      ' ' +
      // line right to buffer point
      'L' +
      link.circularPathData.leftInnerExtent +
      ' ' +
      link.circularPathData.sourceY +
      ' ' +
      // Arc around: Centre of arc X and  //Centre of arc Y
      'A' +
      link.circularPathData.leftLargeArcRadius +
      ' ' +
      link.circularPathData.leftSmallArcRadius +
      ' 0 0 0 ' +
      // End of arc X //End of arc Y
      link.circularPathData.leftFullExtent +
      ' ' +
      (link.circularPathData.sourceY - link.circularPathData.leftSmallArcRadius) +
      ' ' + // End of arc X
      // line up to buffer point
      'L' +
      link.circularPathData.leftFullExtent +
      ' ' +
      link.circularPathData.verticalLeftInnerExtent +
      ' ' +
      // Arc around: Centre of arc X and  //Centre of arc Y
      'A' +
      link.circularPathData.leftLargeArcRadius +
      ' ' +
      link.circularPathData.leftLargeArcRadius +
      ' 0 0 0 ' +
      // End of arc X //End of arc Y
      link.circularPathData.leftInnerExtent +
      ' ' +
      link.circularPathData.verticalFullExtent +
      ' ' + // End of arc X
      // line left to buffer point
      'L' +
      link.circularPathData.rightInnerExtent +
      ' ' +
      link.circularPathData.verticalFullExtent +
      ' ' +
      // Arc around: Centre of arc X and  //Centre of arc Y
      'A' +
      link.circularPathData.rightLargeArcRadius +
      ' ' +
      link.circularPathData.rightLargeArcRadius +
      ' 0 0 0 ' +
      // End of arc X //End of arc Y
      link.circularPathData.rightFullExtent +
      ' ' +
      link.circularPathData.verticalRightInnerExtent +
      ' ' + // End of arc X
      // line down
      'L' +
      link.circularPathData.rightFullExtent +
      ' ' +
      (link.circularPathData.targetY - link.circularPathData.rightSmallArcRadius) +
      ' ' +
      // Arc around: Centre of arc X and  //Centre of arc Y
      'A' +
      link.circularPathData.rightLargeArcRadius +
      ' ' +
      link.circularPathData.rightSmallArcRadius +
      ' 0 0 0 ' +
      // End of arc X //End of arc Y
      link.circularPathData.rightInnerExtent +
      ' ' +
      link.circularPathData.targetY +
      ' ' + // End of arc X
      // line to end
      'L' +
      link.circularPathData.targetX +
      ' ' +
      link.circularPathData.targetY;
  } else {
    // bottom path
    pathString =
      // start at the right of the source node
      'M' +
      link.circularPathData.sourceX +
      ' ' +
      link.circularPathData.sourceY +
      ' ' +
      // line right to buffer point
      'L' +
      link.circularPathData.leftInnerExtent +
      ' ' +
      link.circularPathData.sourceY +
      ' ' +
      // Arc around: Centre of arc X and  //Centre of arc Y
      'A' +
      link.circularPathData.leftLargeArcRadius +
      ' ' +
      link.circularPathData.leftSmallArcRadius +
      ' 0 0 1 ' +
      // End of arc X //End of arc Y
      link.circularPathData.leftFullExtent +
      ' ' +
      (link.circularPathData.sourceY + link.circularPathData.leftSmallArcRadius) +
      ' ' + // End of arc X
      // line down to buffer point
      'L' +
      link.circularPathData.leftFullExtent +
      ' ' +
      link.circularPathData.verticalLeftInnerExtent +
      ' ' +
      // Arc around: Centre of arc X and  //Centre of arc Y
      'A' +
      link.circularPathData.leftLargeArcRadius +
      ' ' +
      link.circularPathData.leftLargeArcRadius +
      ' 0 0 1 ' +
      // End of arc X //End of arc Y
      link.circularPathData.leftInnerExtent +
      ' ' +
      link.circularPathData.verticalFullExtent +
      ' ' + // End of arc X
      // line left to buffer point
      'L' +
      link.circularPathData.rightInnerExtent +
      ' ' +
      link.circularPathData.verticalFullExtent +
      ' ' +
      // Arc around: Centre of arc X and  //Centre of arc Y
      'A' +
      link.circularPathData.rightLargeArcRadius +
      ' ' +
      link.circularPathData.rightLargeArcRadius +
      ' 0 0 1 ' +
      // End of arc X //End of arc Y
      link.circularPathData.rightFullExtent +
      ' ' +
      link.circularPathData.verticalRightInnerExtent +
      ' ' + // End of arc X
      // line up
      'L' +
      link.circularPathData.rightFullExtent +
      ' ' +
      (link.circularPathData.targetY + link.circularPathData.rightSmallArcRadius) +
      ' ' +
      // Arc around: Centre of arc X and  //Centre of arc Y
      'A' +
      link.circularPathData.rightLargeArcRadius +
      ' ' +
      link.circularPathData.rightSmallArcRadius +
      ' 0 0 1 ' +
      // End of arc X //End of arc Y
      link.circularPathData.rightInnerExtent +
      ' ' +
      link.circularPathData.targetY +
      ' ' + // End of arc X
      // line to end
      'L' +
      link.circularPathData.targetX +
      ' ' +
      link.circularPathData.targetY;
  }

  return pathString;
}

// sort links based on the distance between the source and tartget node columns
// if the same, then use Y position of the source node
export function sortLinkColumnAscending(link1, link2) {
  if (linkColumnDistance(link1) === linkColumnDistance(link2)) {
    return link1.circularLinkType === 'bottom'
      ? sortLinkSourceYDescending(link1, link2)
      : sortLinkSourceYAscending(link1, link2);
  } else {
    return linkColumnDistance(link2) - linkColumnDistance(link1);
  }
}

// sort ascending links by their source vertical position, y0
export function sortLinkSourceYAscending(link1, link2) {
  return link1.y0 - link2.y0;
}

// sort descending links by their source vertical position, y0
export function sortLinkSourceYDescending(link1, link2) {
  return link2.y0 - link1.y0;
}

// sort ascending links by their target vertical position, y1
export function sortLinkTargetYAscending(link1, link2) {
  return link1.y1 - link2.y1;
}

// sort descending links by their target vertical position, y1
export function sortLinkTargetYDescending(link1, link2) {
  return link2.y1 - link1.y1;
}

// return the distance between the link's target and source node, in terms of the nodes' column
export function linkColumnDistance(link) {
  return link.target.column - link.source.column;
}

// return the distance between the link's target and source node, in terms of the nodes' X coordinate
export function linkXLength(link) {
  return link.target.x0 - link.source.x1;
}

// Return the Y coordinate on the longerLink path * which is perpendicular shorterLink's source.
// * approx, based on a straight line from target to source, when in fact the path is a bezier
export function linkPerpendicularYToLinkSource(longerLink, shorterLink) {
  // get the angle for the longer link
  const angle = linkAngle(longerLink);

  // get the adjacent length to the other link's x position
  const heightFromY1ToPependicular = linkXLength(shorterLink) / Math.tan(angle);

  // add or subtract from longer link1's original y1, depending on the slope
  const yPerpendicular =
    incline(longerLink) === 'up'
      ? longerLink.y1 + heightFromY1ToPependicular
      : longerLink.y1 - heightFromY1ToPependicular;

  return yPerpendicular;
}

// Return the Y coordinate on the longerLink path * which is perpendicular shorterLink's source.
// * approx, based on a straight line from target to source, when in fact the path is a bezier
export function linkPerpendicularYToLinkTarget(longerLink, shorterLink) {
  // get the angle for the longer link
  const angle = linkAngle(longerLink);

  // get the adjacent length to the other link's x position
  const heightFromY1ToPependicular = linkXLength(shorterLink) / Math.tan(angle);

  // add or subtract from longer link's original y1, depending on the slope
  const yPerpendicular =
    incline(longerLink) === 'up'
      ? longerLink.y1 - heightFromY1ToPependicular
      : longerLink.y1 + heightFromY1ToPependicular;

  return yPerpendicular;
}

// Move any nodes that overlap links which span 2+ columns
export function resolveNodeLinkOverlaps(graph, y0, y1, id) {
  graph.links.forEach(function (link) {
    if (link.circular) {
      return;
    }

    if (link.target.column - link.source.column > 1) {
      const maxColumnToTest = link.target.column - 1;

      const numberOfColumnsToTest = maxColumnToTest - link.source.column + 2;

      for (let columnToTest = link.source.column + 1, i = 1; columnToTest <= maxColumnToTest; columnToTest++, i++) {
        graph.nodes.forEach(function (node) {
          if (node.column === columnToTest) {
            const t = i / (numberOfColumnsToTest + 1);

            // Find all the points of a cubic bezier curve in javascript
            // https://stackoverflow.com/questions/15397596/find-all-the-points-of-a-cubic-bezier-curve-in-javascript

            const B0_t = Math.pow(1 - t, 3);
            const B1_t = 3 * t * Math.pow(1 - t, 2);
            const B2_t = 3 * Math.pow(t, 2) * (1 - t);
            const B3_t = Math.pow(t, 3);

            const py_t = B0_t * link.y0 + B1_t * link.y0 + B2_t * link.y1 + B3_t * link.y1;

            const linkY0AtColumn = py_t - link.width / 2;
            const linkY1AtColumn = py_t + link.width / 2;
            let dy;

            // If top of link overlaps node, push node up
            if (linkY0AtColumn > node.y0 && linkY0AtColumn < node.y1) {
              dy = node.y1 - linkY0AtColumn + 10;
              dy = node.circularLinkType === 'bottom' ? dy : -dy;

              node = adjustNodeHeight(node, dy, y0, y1);

              // check if other nodes need to move up too
              graph.nodes.forEach(function (otherNode) {
                // don't need to check itself or nodes at different columns
                if (getNodeID(otherNode, id) === getNodeID(node, id) || otherNode.column !== node.column) {
                  return;
                }
                if (nodesOverlap(node, otherNode)) {
                  adjustNodeHeight(otherNode, dy, y0, y1);
                }
              });
            } else if (linkY1AtColumn > node.y0 && linkY1AtColumn < node.y1) {
              // If bottom of link overlaps node, push node down
              dy = linkY1AtColumn - node.y0 + 10;

              node = adjustNodeHeight(node, dy, y0, y1);

              // check if other nodes need to move down too
              graph.nodes.forEach(function (otherNode) {
                // don't need to check itself or nodes at different columns
                if (getNodeID(otherNode, id) === getNodeID(node, id) || otherNode.column !== node.column) {
                  return;
                }
                if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                  adjustNodeHeight(otherNode, dy, y0, y1);
                }
              });
            } else if (linkY0AtColumn < node.y0 && linkY1AtColumn > node.y1) {
              // if link completely overlaps node
              dy = linkY1AtColumn - node.y0 + 10;

              node = adjustNodeHeight(node, dy, y0, y1);

              graph.nodes.forEach(function (otherNode) {
                // don't need to check itself or nodes at different columns
                if (getNodeID(otherNode, id) === getNodeID(node, id) || otherNode.column !== node.column) {
                  return;
                }
                if (otherNode.y0 < node.y1 && otherNode.y1 > node.y1) {
                  adjustNodeHeight(otherNode, dy, y0, y1);
                }
              });
            }
          }
        });
      }
    }
  });
}

// check if two nodes overlap
export function nodesOverlap(nodeA, nodeB) {
  // test if nodeA top partially overlaps nodeB
  if (nodeA.y0 > nodeB.y0 && nodeA.y0 < nodeB.y1) {
    return true;
  } else if (nodeA.y1 > nodeB.y0 && nodeA.y1 < nodeB.y1) {
    // test if nodeA bottom partially overlaps nodeB
    return true;
  } else if (nodeA.y0 < nodeB.y0 && nodeA.y1 > nodeB.y1) {
    // test if nodeA covers nodeB
    return true;
  } else {
    return false;
  }
}

// update a node, and its associated links, vertical positions (y0, y1)
export function adjustNodeHeight(node, dy, sankeyY0, sankeyY1) {
  if (node.y0 + dy >= sankeyY0 && node.y1 + dy <= sankeyY1) {
    node.y0 = node.y0 + dy;
    node.y1 = node.y1 + dy;

    node.targetLinks.forEach(function (l) {
      l.y1 = l.y1 + dy;
    });

    node.sourceLinks.forEach(function (l) {
      l.y0 = l.y0 + dy;
    });
  }
  return node;
}

// sort and set the links' y0 for each node
export function sortSourceLinks(graph, y1, id, moveNodes?: any) {
  graph.nodes.forEach(function (node) {
    // move any nodes up which are off the bottom
    if (moveNodes && node.y + (node.y1 - node.y0) > y1) {
      node.y = node.y - (node.y + (node.y1 - node.y0) - y1);
    }

    const nodesSourceLinks = graph.links.filter(function (l) {
      return getNodeID(l.source, id) === getNodeID(node, id);
    });

    const nodeSourceLinksLength = nodesSourceLinks.length;

    // if more than 1 link then sort
    if (nodeSourceLinksLength > 1) {
      nodesSourceLinks.sort(function (link1, link2) {
        // if both are not circular...
        if (!link1.circular && !link2.circular) {
          // if the target nodes are the same column, then sort by the link's target y
          if (link1.target.column === link2.target.column) {
            return link1.y1 - link2.y1;
          } else if (!sameInclines(link1, link2)) {
            // if the links slope in different directions, then sort by the link's target y
            return link1.y1 - link2.y1;

            // if the links slope in same directions, then sort by any overlap
          } else {
            if (link1.target.column > link2.target.column) {
              const link2Adj = linkPerpendicularYToLinkTarget(link2, link1);
              return link1.y1 - link2Adj;
            }
            if (link2.target.column > link1.target.column) {
              const link1Adj = linkPerpendicularYToLinkTarget(link1, link2);
              return link1Adj - link2.y1;
            }
          }
        }

        // if only one is circular, the move top links up, or bottom links down
        if (link1.circular && !link2.circular) {
          return link1.circularLinkType === 'top' ? -1 : 1;
        } else if (link2.circular && !link1.circular) {
          return link2.circularLinkType === 'top' ? 1 : -1;
        }

        // if both links are circular...
        if (link1.circular && link2.circular) {
          // ...and they both loop the same way (both top)
          if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType === 'top') {
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.target.column === link2.target.column) {
              return link1.target.y1 - link2.target.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link2.target.column - link1.target.column;
            }
          } else if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType === 'bottom') {
            // ...and they both loop the same way (both bottom)
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.target.column === link2.target.column) {
              return link2.target.y1 - link1.target.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link1.target.column - link2.target.column;
            }
          } else {
            // ...and they loop around different ways, the move top up and bottom down
            return link1.circularLinkType === 'top' ? -1 : 1;
          }
        }
        return;
      });
    }

    // update y0 for links
    let ySourceOffset = node.y0;

    nodesSourceLinks.forEach(function (link) {
      link.y0 = ySourceOffset + link.width / 2;
      ySourceOffset = ySourceOffset + link.width;
    });

    // correct any circular bottom links so they are at the bottom of the node
    nodesSourceLinks.forEach(function (link, i) {
      if (link.circularLinkType === 'bottom') {
        let j = i + 1;
        let offsetFromBottom = 0;
        // sum the widths of any links that are below this link
        for (j; j < nodeSourceLinksLength; j++) {
          offsetFromBottom = offsetFromBottom + nodesSourceLinks[j].width;
        }
        link.y0 = node.y1 - offsetFromBottom - link.width / 2;
      }
    });
  });
}

// sort and set the links' y1 for each node
export function sortTargetLinks(graph, _, id) {
  graph.nodes.forEach(function (node) {
    const nodesTargetLinks = graph.links.filter(function (l) {
      return getNodeID(l.target, id) === getNodeID(node, id);
    });

    const nodesTargetLinksLength = nodesTargetLinks.length;

    if (nodesTargetLinksLength > 1) {
      nodesTargetLinks.sort(function (link1, link2) {
        // if both are not circular, the base on the source y position
        if (!link1.circular && !link2.circular) {
          if (link1.source.column === link2.source.column) {
            return link1.y0 - link2.y0;
          } else if (!sameInclines(link1, link2)) {
            return link1.y0 - link2.y0;
          } else {
            // get the angle of the link to the further source node (ie the smaller column)
            if (link2.source.column < link1.source.column) {
              const link2Adj = linkPerpendicularYToLinkSource(link2, link1);

              return link1.y0 - link2Adj;
            }
            if (link1.source.column < link2.source.column) {
              const link1Adj = linkPerpendicularYToLinkSource(link1, link2);

              return link1Adj - link2.y0;
            }
          }
        }

        // if only one is circular, the move top links up, or bottom links down
        if (link1.circular && !link2.circular) {
          return link1.circularLinkType === 'top' ? -1 : 1;
        } else if (link2.circular && !link1.circular) {
          return link2.circularLinkType === 'top' ? 1 : -1;
        }

        // if both links are circular...
        if (link1.circular && link2.circular) {
          // ...and they both loop the same way (both top)
          if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType === 'top') {
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.source.column === link2.source.column) {
              return link1.source.y1 - link2.source.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link1.source.column - link2.source.column;
            }
          } else if (link1.circularLinkType === link2.circularLinkType && link1.circularLinkType === 'bottom') {
            // ...and they both loop the same way (both bottom)
            // ...and they both connect to a target with same column, then sort by the target's y
            if (link1.source.column === link2.source.column) {
              return link1.source.y1 - link2.source.y1;
            } else {
              // ...and they connect to different column targets, then sort by how far back they
              return link2.source.column - link1.source.column;
            }
          } else {
            // ...and they loop around different ways, the move top up and bottom down
            return link1.circularLinkType === 'top' ? -1 : 1;
          }
        }
        return;
      });
    }

    // update y1 for links
    let yTargetOffset = node.y0;

    nodesTargetLinks.forEach(function (link) {
      link.y1 = yTargetOffset + link.width / 2;
      yTargetOffset = yTargetOffset + link.width;
    });

    // correct any circular bottom links so they are at the bottom of the node
    nodesTargetLinks.forEach(function (link, i) {
      if (link.circularLinkType === 'bottom') {
        let j = i + 1;
        let offsetFromBottom = 0;
        // sum the widths of any links that are below this link
        for (j; j < nodesTargetLinksLength; j++) {
          offsetFromBottom = offsetFromBottom + nodesTargetLinks[j].width;
        }
        link.y1 = node.y1 - offsetFromBottom - link.width / 2;
      }
    });
  });
}

// test if links both slope up, or both slope down
export function sameInclines(link1, link2) {
  return incline(link1) === incline(link2);
}

// returns the slope of a link, from source to target
// up => slopes up from source to target
// down => slopes down from source to target
export function incline(link) {
  return link.y0 - link.y1 > 0 ? 'up' : 'down';
}

// check if link is self linking, ie links a node to the same node
export function selfLinking(link, id) {
  return getNodeID(link.source, id) === getNodeID(link.target, id);
}

export function fillHeight(graph, y0, y1) {
  const nodes = graph.nodes;
  const links = graph.links;

  let top = false;
  let bottom = false;

  links.forEach(function (link) {
    if (link.circularLinkType === 'top') {
      top = true;
    } else if (link.circularLinkType === 'bottom') {
      bottom = true;
    }
  });

  if (top === false || bottom === false) {
    const minY0 = min(nodes, function (node) {
      return node.y0;
    });
    const maxY1 = max(nodes, function (node) {
      return node.y1;
    });
    const currentHeight = maxY1 - minY0;
    const chartHeight = y1 - y0;
    const ratio = chartHeight / currentHeight;

    nodes.forEach(function (node) {
      const nodeHeight = (node.y1 - node.y0) * ratio;
      node.y0 = (node.y0 - minY0) * ratio;
      node.y1 = node.y0 + nodeHeight;
    });

    links.forEach(function (link) {
      link.y0 = (link.y0 - minY0) * ratio;
      link.y1 = (link.y1 - minY0) * ratio;
      link.width = link.width * ratio;
    });
  }
}
