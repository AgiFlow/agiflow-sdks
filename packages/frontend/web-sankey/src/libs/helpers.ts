// return the value of a node or link
export function value(d) {
  return d.value;
}

// return the vertical center of a node
export function nodeCenter(node) {
  return (node.y0 + node.y1) / 2;
}

// return the vertical center of a link's source node
export function linkSourceCenter(link) {
  return nodeCenter(link.source);
}

// return the vertical center of a link's target node
export function linkTargetCenter(link) {
  return nodeCenter(link.target);
}

// Return the default value for ID for node, d.index
export function defaultId(d) {
  return d.index;
}

// Return the default object the graph's nodes, graph.nodes
export function defaultNodes(graph) {
  return graph.nodes;
}

// Return the default object the graph's nodes, graph.links
export function defaultLinks(graph) {
  return graph.links;
}

// Return the node from the collection that matches the provided ID, or throw an error if no match
export function find(nodeById, id) {
  const node = nodeById.get(id);
  if (!node) throw new Error('missing: ' + id);
  return node;
}

export function getNodeID(node, id) {
  return id(node);
}
