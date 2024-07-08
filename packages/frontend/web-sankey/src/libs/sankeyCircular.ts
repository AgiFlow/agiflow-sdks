/// https://github.com/tomshanley/d3-sankeyCircular-circular
// fork of https://github.com/d3/d3-sankeyCircular copyright Mike Bostock
import { ascending, min, max, mean, sum } from 'd3-array';
import { nest } from 'd3-collection';
import { justify } from './align';
import constant from './constant';
import {
  value,
  nodeCenter,
  linkSourceCenter,
  linkTargetCenter,
  defaultId,
  defaultNodes,
  defaultLinks,
  find,
} from './helpers';
import {
  identifyCircles,
  selectCircularLinkTypes,
  sortSourceLinks,
  sortTargetLinks,
  resolveNodeLinkOverlaps,
  fillHeight,
  addCircularPathData,
  numberOfNonSelfLinkingCycles,
} from './nodeLinks';
import { verticalMargin, baseRadius, scale } from './constant';

export default function () {
  // Set the default values
  let x0 = 0,
    y0 = 0,
    x1 = 1,
    y1 = 1, // extent
    dx = 24, // nodeWidth
    py = 0, // nodePadding, for vertical postioning
    id = defaultId,
    align = justify,
    nodes = defaultNodes,
    links = defaultLinks,
    iterations = 32,
    circularLinkGap = 2,
    paddingRatio,
    sortNodes = null,
    nodeSort = null;

  function sankeyCircular(data: any) {
    const graph = {
      nodes: data?.nodes || nodes,
      links: data?.links || links,
    };

    // Process the graph's nodes and links, setting their positions

    // 1.  Associate the nodes with their respective links, and vice versa
    computeNodeLinks(graph);

    // 2.  Determine which links result in a circular path in the graph
    identifyCircles(graph, id, sortNodes);

    // 4. Calculate the nodes' values, based on the values of the incoming and outgoing links
    computeNodeValues(graph);

    // 5.  Calculate the nodes' depth based on the incoming and outgoing links
    //     Sets the nodes':
    //     - depth:  the depth in the graph
    //     - column: the depth (0, 1, 2, etc), as is relates to visual position from left to right
    //     - x0, x1: the x coordinates, as is relates to visual position from left to right
    computeNodeDepths(graph);

    // 3.  Determine how the circular links will be drawn,
    //     either travelling back above the main chart ("top")
    //     or below the main chart ("bottom")
    selectCircularLinkTypes(graph, id);

    // 6.  Calculate the nodes' and links' vertical position within their respective column
    //     Also readjusts sankeyCircular size if circular links are needed, and node x's
    computeNodeBreadths(graph, iterations, id);
    computeLinkBreadths(graph);

    // 7.  Sort links per node, based on the links' source/target nodes' breadths
    // 8.  Adjust nodes that overlap links that span 2+ columns
    const linkSortingIterations = 4; //Possibly let user control this number, like the iterations over node placement
    for (let iteration = 0; iteration < linkSortingIterations; iteration++) {
      sortSourceLinks(graph, y1, id);
      sortTargetLinks(graph, y1, id);
      resolveNodeLinkOverlaps(graph, y0, y1, id);
      sortSourceLinks(graph, y1, id);
      sortTargetLinks(graph, y1, id);
    }

    // 8.1  Fix nodes overlapping after sortNodes
    resolveNodesOverlap(graph, y0, py);

    // 8.2  Adjust node and link positions back to fill height of chart area if compressed
    fillHeight(graph, y0, y1);

    // 9. Calculate visually appealling path for the circular paths, and create the "d" string
    addCircularPathData(graph, circularLinkGap, y1, id);

    return graph;
  } // end of sankeyCircular function

  // sort links' breadth (ie top to bottom in a column), based on their source nodes' breadths
  function ascendingSourceBreadth(a, b) {
    return ascendingBreadth(a.source, b.source) || a.index - b.index;
  }

  // sort links' breadth (ie top to bottom in a column), based on their target nodes' breadths
  function ascendingTargetBreadth(a, b) {
    return ascendingBreadth(a.target, b.target) || a.index - b.index;
  }

  // sort nodes' breadth (ie top to bottom in a column)
  // if both nodes have circular links, or both don't have circular links, then sort by the top (y0) of the node
  // else push nodes that have top circular links to the top, and nodes that have bottom circular links to the bottom
  function ascendingBreadth(a, b) {
    if (a.partOfCycle === b.partOfCycle) {
      if (nodeSort) return (nodeSort as any)(a, b) || a.y0 - b.y0;
      return a.y0 - b.y0;
    } else {
      if (a.circularLinkType === 'top' || b.circularLinkType === 'bottom') {
        return -1;
      } else {
        return 1;
      }
    }
  }

  // Set the sankeyCircular parameters
  // nodeID, nodeAlign, nodeWidth, nodePadding, nodes, links, size, extent, iterations, nodePaddingRatio, circularLinkGap
  sankeyCircular.nodeId = function (_) {
    return arguments.length ? ((id = typeof _ === 'function' ? _ : constant(_)), sankeyCircular) : id;
  };

  sankeyCircular.nodeAlign = function (_) {
    return arguments.length ? ((align = typeof _ === 'function' ? _ : constant(_)), sankeyCircular) : align;
  };

  sankeyCircular.nodeWidth = function (_) {
    return arguments.length ? ((dx = +_), sankeyCircular) : dx;
  };

  sankeyCircular.nodePadding = function (_) {
    return arguments.length ? ((py = +_), sankeyCircular) : py;
  };

  sankeyCircular.nodes = function (_) {
    return arguments.length ? ((nodes = typeof _ === 'function' ? _ : constant(_)), sankeyCircular) : nodes;
  };

  sankeyCircular.links = function (_) {
    return arguments.length ? ((links = typeof _ === 'function' ? _ : constant(_)), sankeyCircular) : links;
  };

  sankeyCircular.size = function (_) {
    const val = arguments.length ? ((x0 = y0 = 0), (x1 = +_[0]), (y1 = +_[1]), sankeyCircular) : [x1 - x0, y1 - y0];
    return val;
  };

  sankeyCircular.extent = function (_) {
    return arguments.length
      ? ((x0 = +_[0][0]), (x1 = +_[1][0]), (y0 = +_[0][1]), (y1 = +_[1][1]), sankeyCircular)
      : [
          [x0, y0],
          [x1, y1],
        ];
  };

  sankeyCircular.iterations = function (_) {
    return arguments.length ? ((iterations = +_), sankeyCircular) : iterations;
  };

  sankeyCircular.circularLinkGap = function (_) {
    return arguments.length ? ((circularLinkGap = +_), sankeyCircular) : circularLinkGap;
  };

  sankeyCircular.nodePaddingRatio = function (_) {
    return arguments.length ? ((paddingRatio = +_), sankeyCircular) : paddingRatio;
  };

  sankeyCircular.sortNodes = function (_) {
    return arguments.length ? ((sortNodes = _), sankeyCircular) : sortNodes;
  };

  sankeyCircular.nodeSort = function (_) {
    return arguments.length ? ((nodeSort = _), sankeyCircular) : nodeSort;
  };

  sankeyCircular.update = function (graph) {
    // 5.  Calculate the nodes' depth based on the incoming and outgoing links
    //     Sets the nodes':
    //     - depth:  the depth in the graph
    //     - column: the depth (0, 1, 2, etc), as is relates to visual position from left to right
    //     - x0, x1: the x coordinates, as is relates to visual position from left to right
    // computeNodeDepths(graph)

    // 3.  Determine how the circular links will be drawn,
    //     either travelling back above the main chart ("top")
    //     or below the main chart ("bottom")
    selectCircularLinkTypes(graph, id);

    // 6.  Calculate the nodes' and links' vertical position within their respective column
    //     Also readjusts sankeyCircular size if circular links are needed, and node x's
    // computeNodeBreadths(graph, iterations, id)
    computeLinkBreadths(graph);

    // Force position of circular link type based on position
    graph.links.forEach(function (link) {
      if (link.circular) {
        link.circularLinkType = link.y0 + link.y1 < y1 ? 'top' : 'bottom';

        link.source.circularLinkType = link.circularLinkType;
        link.target.circularLinkType = link.circularLinkType;
      }
    });

    sortSourceLinks(graph, y1, id, false); // Sort links but do not move nodes
    sortTargetLinks(graph, y1, id);

    // 7.  Sort links per node, based on the links' source/target nodes' breadths
    // 8.  Adjust nodes that overlap links that span 2+ columns
    // const linkSortingIterations = 4; //Possibly let user control this number, like the iterations over node placement
    // for (const iteration = 0; iteration < linkSortingIterations; iteration++) {
    //
    //   sortSourceLinks(graph, y1, id)
    //   sortTargetLinks(graph, y1, id)
    //   resolveNodeLinkOverlaps(graph, y0, y1, id)
    //   sortSourceLinks(graph, y1, id)
    //   sortTargetLinks(graph, y1, id)
    //
    // }

    // 8.1  Adjust node and link positions back to fill height of chart area if compressed
    // fillHeight(graph, y0, y1)

    // 9. Calculate visually appealling path for the circular paths, and create the "d" string
    addCircularPathData(graph, circularLinkGap, y1, id);
    return graph;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks(graph) {
    graph.nodes.forEach(function (node, i) {
      node.index = i;
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    const nodeById = new Map();
    graph.nodes.forEach(node => nodeById.set(node['id'], node));
    graph.links.forEach(function (link, i) {
      link.index = i;
      let source = link.source;
      let target = link.target;
      if (typeof source !== 'object') {
        source = link.source = find(nodeById, source);
      }
      if (typeof target !== 'object') {
        target = link.target = find(nodeById, target);
      }
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
    return graph;
  }

  // Compute the value (size) and cycleness of each node by summing the associated links.
  function computeNodeValues(graph) {
    graph.nodes.forEach(function (node) {
      node.partOfCycle = false;
      node.value = Math.max(sum(node.sourceLinks, value), sum(node.targetLinks, value));
      node.sourceLinks.forEach(function (link) {
        if (link.circular) {
          node.partOfCycle = true;
          node.circularLinkType = link.circularLinkType;
        }
      });
      node.targetLinks.forEach(function (link) {
        if (link.circular) {
          node.partOfCycle = true;
          node.circularLinkType = link.circularLinkType;
        }
      });
    });
  }

  function getCircleMargins(graph) {
    let totalTopLinksWidth = 0,
      totalBottomLinksWidth = 0,
      totalRightLinksWidth = 0,
      totalLeftLinksWidth = 0;

    const maxColumn = max(graph.nodes, function (node) {
      return node.column;
    });

    graph.links.forEach(function (link) {
      if (link.circular) {
        if (link.circularLinkType === 'top') {
          totalTopLinksWidth = totalTopLinksWidth + link.width;
        } else {
          totalBottomLinksWidth = totalBottomLinksWidth + link.width;
        }

        if (link.target.column === 0) {
          totalLeftLinksWidth = totalLeftLinksWidth + link.width;
        }

        if (link.source.column === maxColumn) {
          totalRightLinksWidth = totalRightLinksWidth + link.width;
        }
      }
    });

    //account for radius of curves and padding between links
    totalTopLinksWidth = totalTopLinksWidth > 0 ? totalTopLinksWidth + verticalMargin + baseRadius : totalTopLinksWidth;
    totalBottomLinksWidth =
      totalBottomLinksWidth > 0 ? totalBottomLinksWidth + verticalMargin + baseRadius : totalBottomLinksWidth;
    totalRightLinksWidth =
      totalRightLinksWidth > 0 ? totalRightLinksWidth + verticalMargin + baseRadius : totalRightLinksWidth;
    totalLeftLinksWidth =
      totalLeftLinksWidth > 0 ? totalLeftLinksWidth + verticalMargin + baseRadius : totalLeftLinksWidth;

    return {
      top: totalTopLinksWidth,
      bottom: totalBottomLinksWidth,
      left: totalLeftLinksWidth,
      right: totalRightLinksWidth,
    };
  }

  function resolveNodesOverlap(graph, y0, py) {
    const columns = nest()
      .key(function (d) {
        return d.column;
      })
      .sortKeys(ascending)
      .entries(graph.nodes)
      .map(function (d) {
        return d.values;
      });

    columns.forEach(function (nodes) {
      let node,
        dy,
        y = y0,
        n = nodes.length,
        i;
      // Push any overlapping nodes down.
      nodes.sort(ascendingBreadth);

      for (i = 0; i < n; ++i) {
        node = nodes[i];
        dy = y - node.y0;

        if (dy > 0) {
          node.y0 += dy;
          node.y1 += dy;
          node.targetLinks.forEach(function (l) {
            l.y1 = l.y1 + dy;
          });
          node.sourceLinks.forEach(function (l) {
            l.y0 = l.y0 + dy;
          });
        }
        y = node.y1 + py;
      }
    });
  }

  // Update the x0, y0, x1 and y1 for the sankeyCircular, to allow space for any circular links
  function scaleSankeySize(graph, margin) {
    const maxColumn = max(graph.nodes, function (node) {
      return node.column;
    });

    const currentWidth = x1 - x0;
    const currentHeight = y1 - y0;

    const newWidth = currentWidth + margin.right + margin.left;
    const newHeight = currentHeight + margin.top + margin.bottom;

    const scaleX = currentWidth / newWidth;
    const scaleY = currentHeight / newHeight;

    x0 = x0 * scaleX + margin.left;
    x1 = margin.right === 0 ? x1 : x1 * scaleX;
    y0 = y0 * scaleY + margin.top;
    y1 = y1 * scaleY;

    graph.nodes.forEach(function (node) {
      node.x0 = x0 + node.column * ((x1 - x0 - dx) / maxColumn);
      node.x1 = node.x0 + dx;
    });

    return scaleY;
  }

  // Iteratively assign the depth for each node.
  // Nodes are assigned the maximum depth of incoming neighbors plus one;
  // nodes with no incoming links are assigned depth zero, while
  // nodes with no outgoing links are assigned the maximum depth.
  function computeNodeDepths(graph) {
    let nodes, next, x;

    for (nodes = graph.nodes, next = [], x = 0; nodes.length; ++x, nodes = next, next = []) {
      nodes.forEach(function (node) {
        node.depth = x;
        node.sourceLinks.forEach(function (link) {
          if (next.indexOf(link.target) < 0 && !link.circular) {
            next.push(link.target);
          }
        });
      });
    }

    for (nodes = graph.nodes, next = [], x = 0; nodes.length; ++x, nodes = next, next = []) {
      nodes.forEach(function (node) {
        node.height = x;
        node.targetLinks.forEach(function (link) {
          if (next.indexOf(link.source) < 0 && !link.circular) {
            next.push(link.source);
          }
        });
      });
    }

    // assign column numbers, and get max value
    graph.nodes.forEach(function (node) {
      node.column = sortNodes !== null ? node[sortNodes] : Math.floor(align.call(null, node, x));
    });
  }

  // Assign nodes' breadths, and then shift nodes that overlap (resolveCollisions)
  function computeNodeBreadths(graph, iterations, id) {
    const columns = nest()
      .key(function (d) {
        return d.column;
      })
      .sortKeys(ascending)
      .entries(graph.nodes)
      .map(function (d) {
        return d.values;
      });

    initializeNodeBreadth(id);
    resolveCollisions();

    for (let alpha = 1, n = iterations; n > 0; --n) {
      relaxLeftAndRight((alpha *= 0.99));
      resolveCollisions();
    }

    function initializeNodeBreadth(id) {
      //override py if nodePadding has been set
      if (paddingRatio) {
        let padding = Infinity;
        columns.forEach(function (nodes) {
          const thisPadding = (y1 * paddingRatio) / (nodes.length + 1);
          padding = thisPadding < padding ? thisPadding : padding;
        });
        py = padding;
      }

      let ky = min(columns, function (nodes) {
        return (y1 - y0 - (nodes.length - 1) * py) / sum(nodes, value);
      });

      //calculate the widths of the links
      ky = ky * scale;

      graph.links.forEach(function (link) {
        link.width = link.value * ky;
      });

      //determine how much to scale down the chart, based on circular links
      const margin = getCircleMargins(graph);
      const ratio = scaleSankeySize(graph, margin);

      //re-calculate widths
      ky = ky * ratio;

      graph.links.forEach(function (link) {
        link.width = link.value * ky;
      });

      columns.forEach(function (nodes) {
        const nodesLength = nodes.length;
        nodes.forEach(function (node, i) {
          if (node.depth === columns.length - 1 && nodesLength === 1) {
            node.y0 = y1 / 2 - node.value * ky;
            node.y1 = node.y0 + node.value * ky;
          } else if (node.depth === 0 && nodesLength === 1) {
            node.y0 = y1 / 2 - node.value * ky;
            node.y1 = node.y0 + node.value * ky;
          } else if (node.partOfCycle) {
            if (numberOfNonSelfLinkingCycles(node, id) === 0) {
              node.y0 = y1 / 2 + i;
              node.y1 = node.y0 + node.value * ky;
            } else if (node.circularLinkType === 'top') {
              node.y0 = y0 + i;
              node.y1 = node.y0 + node.value * ky;
            } else {
              node.y0 = y1 - node.value * ky - i;
              node.y1 = node.y0 + node.value * ky;
            }
          } else {
            if (margin.top === 0 || margin.bottom === 0) {
              node.y0 = ((y1 - y0) / nodesLength) * i;
              node.y1 = node.y0 + node.value * ky;
            } else {
              node.y0 = (y1 - y0) / 2 - nodesLength / 2 + i;
              node.y1 = node.y0 + node.value * ky;
            }
          }
        });
      });
    }

    // For each node in each column, check the node's vertical position in relation to its targets and sources vertical position
    // and shift up/down to be closer to the vertical middle of those targets and sources
    function relaxLeftAndRight(alpha) {
      columns.forEach(function (nodes) {
        nodes.forEach(function (node) {
          // check the node is not an orphan
          let nodeHeight;
          if (node.sourceLinks.length || node.targetLinks.length) {
            nodeHeight = node.y1 - node.y0;
            node.y0 = y1 / 2 - nodeHeight / 2;
            node.y1 = y1 / 2 + nodeHeight / 2;
            let avg = 0;

            const avgTargetY = mean(node.sourceLinks, linkTargetCenter);
            const avgSourceY = mean(node.targetLinks, linkSourceCenter);
            if (avgTargetY && avgSourceY) {
              avg = (avgTargetY + avgSourceY) / 2;
            } else {
              avg = avgTargetY || avgSourceY;
            }
            const dy = (avg - nodeCenter(node)) * alpha;
            // positive if it node needs to move down
            node.y0 += dy;
            node.y1 += dy;
          }
        });
      });
    }

    // For each column, check if nodes are overlapping, and if so, shift up/down
    function resolveCollisions() {
      columns.forEach(function (nodes) {
        let node,
          dy,
          y = y0,
          n = nodes.length,
          i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingBreadth);

        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y - node.y0;

          if (dy > 0) {
            node.y0 += dy;
            node.y1 += dy;
          }
          y = node.y1 + py;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y - py - y1;
        if (dy > 0) {
          y = node.y0 -= dy;
          node.y1 -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y1 + py - y;
            if (dy > 0) {
              node.y0 -= dy;
              node.y1 -= dy;
            }
            y = node.y0;
          }
        }
      });
    }
  }

  // Assign the links y0 and y1 based on source/target nodes position,
  // plus the link's relative position to other links to the same node
  function computeLinkBreadths(graph) {
    graph.nodes.forEach(function (node) {
      node.sourceLinks.sort(ascendingTargetBreadth);
      node.targetLinks.sort(ascendingSourceBreadth);
    });
    graph.nodes.forEach(function (node) {
      let y0 = node.y0;
      let y1 = y0;

      // start from the bottom of the node for cycle links
      let y0cycle = node.y1;
      let y1cycle = y0cycle;

      node.sourceLinks.forEach(function (link) {
        if (link.circular) {
          link.y0 = y0cycle - link.width / 2;
          y0cycle = y0cycle - link.width;
        } else {
          link.y0 = y0 + link.width / 2;
          y0 += link.width;
        }
      });
      node.targetLinks.forEach(function (link) {
        if (link.circular) {
          link.y1 = y1cycle - link.width / 2;
          y1cycle = y1cycle - link.width;
        } else {
          link.y1 = y1 + link.width / 2;
          y1 += link.width;
        }
      });
    });
  }

  return sankeyCircular;
}
