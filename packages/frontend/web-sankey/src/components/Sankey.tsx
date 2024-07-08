import React, { createElement, Fragment, ReactNode } from 'react';
import { SvgWrapper, useDimensions, Container } from '@nivo/core';
import { BoxLegendSvg } from '@nivo/legends';
import { svgDefaultProps } from './props';
import { useSankey } from './hooks';
import { SankeyNodes } from './SankeyNodes';
import { SankeyLinks } from './SankeyLinks';
import { SankeyLabels } from './SankeyLabels';
import { DefaultLink, DefaultNode, SankeyLayerId, SankeyLinkDatum, SankeyNodeDatum, SankeySvgProps } from '../types';

type InnerSankeyProps<N extends DefaultNode, L extends DefaultLink> = Omit<
  SankeySvgProps<N, L>,
  'animate' | 'motionConfig' | 'renderWrapper' | 'theme'
>;

const InnerSankey = <N extends DefaultNode, L extends DefaultLink>({
  data,
  valueFormat,
  layout = svgDefaultProps.layout,
  sort = svgDefaultProps.sort,
  align = svgDefaultProps.align,
  width,
  height,
  margin: partialMargin,
  colors = svgDefaultProps.colors,
  nodeThickness = svgDefaultProps.nodeThickness,
  nodeSpacing = svgDefaultProps.nodeThickness,
  nodeInnerPadding = svgDefaultProps.nodeInnerPadding,
  nodeBorderColor = svgDefaultProps.nodeBorderColor,
  nodeOpacity = svgDefaultProps.nodeOpacity,
  nodeHoverOpacity = svgDefaultProps.nodeHoverOpacity,
  nodeHoverOthersOpacity = svgDefaultProps.nodeHoverOthersOpacity,
  nodeBorderWidth = svgDefaultProps.nodeBorderWidth,
  nodeBorderRadius = svgDefaultProps.nodeBorderRadius,
  linkOpacity = svgDefaultProps.linkOpacity,
  linkHoverOpacity = svgDefaultProps.linkHoverOpacity,
  linkHoverOthersOpacity = svgDefaultProps.linkHoverOthersOpacity,
  linkContract = svgDefaultProps.linkContract,
  linkBlendMode = svgDefaultProps.linkBlendMode,
  enableLinkGradient = svgDefaultProps.enableLinkGradient,
  enableLabels = svgDefaultProps.enableLabels,
  labelPosition = svgDefaultProps.labelPosition,
  labelPadding = svgDefaultProps.labelPadding,
  labelOrientation = svgDefaultProps.labelOrientation,
  label = svgDefaultProps.label,
  labelTextColor = svgDefaultProps.labelTextColor,
  nodeTooltip = svgDefaultProps.nodeTooltip,
  linkTooltip = svgDefaultProps.linkTooltip,
  isInteractive = svgDefaultProps.isInteractive,
  onClick,
  legends = svgDefaultProps.legends,
  layers = svgDefaultProps.layers,
  role = svgDefaultProps.role,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: InnerSankeyProps<N, L>) => {
  const { margin, innerWidth, innerHeight, outerWidth, outerHeight } = useDimensions(width, height, partialMargin);

  const {
    nodes,
    links,
    legendData,
    getNodeBorderColor,
    currentNode,
    setCurrentNode,
    currentLink,
    setCurrentLink,
    getLabelTextColor,
  } = useSankey<N, L>({
    data,
    valueFormat,
    layout,
    width: innerWidth,
    height: innerHeight,
    sort,
    align,
    colors,
    nodeThickness,
    nodeSpacing,
    nodeInnerPadding,
    nodeBorderColor,
    label,
    labelTextColor,
  });

  let isCurrentNode: (node: SankeyNodeDatum<N, L>) => boolean = () => false;
  let isCurrentLink: (link: SankeyLinkDatum<N, L>) => boolean = () => false;

  if (currentLink) {
    isCurrentNode = ({ id }: SankeyNodeDatum<N, L>) => id === currentLink.source.id || id === currentLink.target.id;
    isCurrentLink = ({ source, target, pos0, pos1 }: SankeyLinkDatum<N, L>) => {
      return (
        source.id === currentLink.source.id &&
        target.id === currentLink.target.id &&
        pos0 === currentLink.pos0 &&
        pos1 === currentLink.pos1
      );
    };
  }

  if (currentNode) {
    let currentNodeIds = [currentNode.id];
    links
      .filter(({ source, target }) => source.id === currentNode.id || target.id === currentNode.id)
      .forEach(({ source, target }) => {
        currentNodeIds.push(source.id);
        currentNodeIds.push(target.id);
      });

    currentNodeIds = Array.from(new Set(currentNodeIds));
    isCurrentNode = ({ id }) => currentNodeIds.includes(id);
    isCurrentLink = ({ source, target }) => source.id === currentNode.id || target.id === currentNode.id;
  }

  const layerProps = {
    links,
    nodes,
    margin,
    width,
    height,
    outerWidth,
    outerHeight,
  };

  const layerById: Record<SankeyLayerId, ReactNode> = {
    links: null,
    nodes: null,
    labels: null,
    legends: null,
  };

  if (layers.includes('links')) {
    layerById.links = (
      <SankeyLinks<N, L>
        key='links'
        links={links}
        layout={layout}
        linkContract={linkContract}
        linkOpacity={linkOpacity}
        linkHoverOpacity={linkHoverOpacity}
        linkHoverOthersOpacity={linkHoverOthersOpacity}
        linkBlendMode={linkBlendMode}
        enableLinkGradient={enableLinkGradient}
        setCurrentLink={setCurrentLink}
        currentNode={currentNode}
        currentLink={currentLink}
        isCurrentLink={isCurrentLink}
        isInteractive={isInteractive}
        onClick={onClick}
        tooltip={linkTooltip}
      />
    );
  }

  if (layers.includes('nodes')) {
    layerById.nodes = (
      <SankeyNodes<N, L>
        key='nodes'
        nodes={nodes}
        nodeOpacity={nodeOpacity}
        nodeHoverOpacity={nodeHoverOpacity}
        nodeHoverOthersOpacity={nodeHoverOthersOpacity}
        borderWidth={nodeBorderWidth}
        borderRadius={nodeBorderRadius}
        getBorderColor={getNodeBorderColor}
        setCurrentNode={setCurrentNode}
        currentNode={currentNode}
        currentLink={currentLink}
        isCurrentNode={isCurrentNode}
        isInteractive={isInteractive}
        onClick={onClick}
        tooltip={nodeTooltip}
      />
    );
  }

  if (layers.includes('labels') && enableLabels) {
    layerById.labels = (
      <SankeyLabels<N, L>
        key='labels'
        nodes={nodes}
        layout={layout}
        width={innerWidth}
        height={innerHeight}
        labelPosition={labelPosition}
        labelPadding={labelPadding}
        labelOrientation={labelOrientation}
        getLabelTextColor={getLabelTextColor}
        setCurrentNode={setCurrentNode}
      />
    );
  }

  if (layers.includes('legends')) {
    layerById.legends = (
      <Fragment key='legends'>
        {legends.map((legend, i) => (
          <BoxLegendSvg
            key={`legend${i}`}
            {...legend}
            containerWidth={innerWidth}
            containerHeight={innerHeight}
            data={legendData}
            onMouseEnter={e => {
              const node = nodes.find(n => n.label === e.label);
              if (node) {
                setCurrentNode(node);
              }
            }}
            onMouseLeave={_ => {
              setCurrentNode(null);
            }}
          />
        ))}
      </Fragment>
    );
  }

  return (
    <SvgWrapper
      width={outerWidth}
      height={outerHeight}
      margin={margin}
      role={role}
      ariaLabel={ariaLabel}
      ariaLabelledBy={ariaLabelledBy}
      ariaDescribedBy={ariaDescribedBy}
    >
      {layers.map((layer, i) => {
        if (typeof layer === 'function') {
          return <Fragment key={i}>{createElement(layer, layerProps)}</Fragment>;
        }

        return layerById?.[layer] ?? null;
      })}
    </SvgWrapper>
  );
};

export const Sankey = <N extends DefaultNode = DefaultNode, L extends DefaultLink = DefaultLink>({
  isInteractive = svgDefaultProps.isInteractive,
  animate = svgDefaultProps.animate,
  motionConfig = svgDefaultProps.motionConfig,
  theme,
  renderWrapper,
  ...otherProps
}: SankeySvgProps<N, L>) => (
  <Container
    {...{
      animate,
      isInteractive,
      motionConfig,
      renderWrapper,
      theme,
    }}
  >
    <InnerSankey<N, L> isInteractive={isInteractive} {...otherProps} />
  </Container>
);
