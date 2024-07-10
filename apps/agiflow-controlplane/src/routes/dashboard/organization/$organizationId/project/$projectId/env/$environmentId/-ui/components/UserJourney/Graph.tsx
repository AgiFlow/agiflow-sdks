import { Sheet, SheetContent } from '@agiflowai/frontend-web-ui';
import { useState, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { ResponsiveSankey } from '@agiflowai/frontend-web-sankey';

import { TaskGraph } from '../../queries';
import { Workflow } from '../Workflow';
import { TASK_STATUSES, TASK_COLOURS } from '../../../tasks/$taskId/-ui/constants';

export const Graph = ({ graph }: { graph: TaskGraph }) => {
  const [workflowData, setWorkflowData] = useState<
    { sourceData: any; targetData: any; sourceLabel: string; targetLabel: string } | undefined
  >(undefined);
  const data = useMemo(() => {
    const item: TaskGraph = graph || { nodes: [], links: [] };
    item.links = (item.links || []).map(link => ({
      ...link,
      startColor: TASK_COLOURS[link.sourceStatus],
      endColor: TASK_COLOURS[link.targetStatus],
    }));
    return item;
  }, [graph]);
  if (!data?.links?.length) return null;
  if (!data?.nodes?.length) return null;
  return (
    <>
      <div className='inline-flex flex-wrap items-center gap-3'>
        <label className='text-xs font-bold'>Status color codes:</label>
        {Object.entries(TASK_STATUSES).map(([label, status]) => (
          <div className='inline-flex items-center gap-1' key={`${status}`}>
            <div className={'size-[18px] rounded-md'} style={{ backgroundColor: TASK_COLOURS[status] }} />
            <p className='text-2xs'>{label}</p>
          </div>
        ))}
      </div>
      <ResponsiveSankey
        data={data}
        linkBlendMode='normal'
        margin={{ top: 20, right: 250, bottom: 120, left: 80 }}
        align='justify'
        colors={{ scheme: 'blues' }}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderColor={{
          from: 'color',
          modifiers: [['darker', 0.8]],
        }}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient={true}
        labelPosition='outside'
        labelOrientation='vertical'
        labelPadding={16}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1]],
        }}
        onClick={(e: any) => {
          if (!e?.source || !e?.target) return;
          setWorkflowData({
            sourceLabel: e.source.label,
            sourceData: e.sourceData,
            targetData: e.targetData,
            targetLabel: e.target.label,
          });
        }}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            translateX: 250,
            itemWidth: 250,
            itemHeight: 14,
            itemDirection: 'right-to-left',
            itemsSpacing: 2,
            itemTextColor: '#999',
            symbolSize: 14,
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#000',
                },
              },
            ],
          },
        ]}
      />
      <Sheet open={!!workflowData} onOpenChange={() => setWorkflowData(undefined)}>
        <SheetContent className='overflow-y-auto sm:max-w-full'>
          {!!workflowData?.sourceLabel || !!workflowData?.targetLabel ? (
            <ReactFlowProvider>
              <Workflow queryData={workflowData} />
            </ReactFlowProvider>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
};
