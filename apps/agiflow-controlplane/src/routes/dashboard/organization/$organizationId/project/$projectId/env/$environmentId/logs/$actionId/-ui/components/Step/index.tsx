import { ReactNode } from 'react';
import { LabelledItem, Separator, cn, Badge, TextDiff } from '@agiflowai/frontend-web-ui';
import { getLocalCurrencyByCents } from '@/libs';
import { Step } from '../../queries';
import { InlineItem } from '../Item';
import { Tag } from '../Tag';
import { CorrectOuput } from '../CorrectOutput';
import { Evaluation } from '../Evaluation';

interface StepCompProps {
  step: Step;
  topSlot?: ReactNode;
}

export const StepComp = ({ step, topSlot }: StepCompProps) => {
  const { description, service, ...meta } = step.meta || ({} as any);

  const renderItem = obj => {
    if (!obj) return null;
    return Object.entries(obj).map(([key, value]) => {
      if (!value) return null;
      if (typeof value === 'object') {
        return renderItem(value);
      }
      return <LabelledItem label={key} value={value} key={key} />;
    });
  };

  const renderLLM = (str?: string | null) => {
    if (!str) return;
    let input: Record<string, any>[] = [];
    try {
      input = JSON.parse(str);
      if (typeof input === 'string') {
        input = JSON.parse(input);
      }
    } catch (_) {
      input = [{ user: str }];
    }
    return (
      <div className='flex w-full flex-col gap-3'>
        {input.map(item => {
          return Object.entries(item).map(([key, value]) => (
            <div className='grid w-full gap-2'>
              <div>
                <Badge className='rounded-md' variant='outline'>
                  {key}
                </Badge>
              </div>
              <pre className={cn('flex-1 text-wrap break-all rounded-md bg-background-shade p-3 text-xs')}>{value}</pre>
            </div>
          ));
        })}
      </div>
    );
  };

  return (
    <div className='grid gap-2 p-2'>
      <div className='inline-flex items-center gap-2'>
        <div className='inline-flex flex-1 items-center gap-2'>
          <Tag type={step.type} />
          <h5>{step.name}</h5>
        </div>
        {topSlot}
      </div>
      {meta?.description ? <p className='text-xs'>{meta.description}</p> : null}
      <div className='flex flex-row flex-wrap items-center gap-1'>
        <InlineItem label={'Kind'} value={step.kind} />
        <InlineItem label={'Temperature'} value={step.temperature} />
        <InlineItem label={'Model'} value={step.model} />
        <InlineItem label={'Vendor'} value={step.provider} />
        <InlineItem label={'OpenAI Api base'} value={step.llmUsages?.[0]?.openai_api_base} />
        <InlineItem label={'OpenAI Api version'} value={step.llmUsages?.[0]?.openai_api_version} />
        <InlineItem label={'Prompt Tokens'} value={step.llmUsages?.[0]?.prompt_tokens} />
        <InlineItem label={'Completion Tokens'} value={step.llmUsages?.[0]?.completion_tokens} />
        {step.running_cost ? (
          <InlineItem label={'LLM Cost'} value={getLocalCurrencyByCents(Number(step.running_cost))} />
        ) : null}
        {step.evaluation_cost ? (
          <InlineItem label={'LLM Cost'} value={getLocalCurrencyByCents(Number(step.evaluation_cost))} />
        ) : null}
        <InlineItem label={'Prompt Version'} value={step.prompt_version} />
      </div>
      <Evaluation step={step} />
      <Separator />
      {step.error_description ? (
        <LabelledItem label={'Error'} value={step.error_description} className='bg-error/10' />
      ) : null}
      {renderItem(meta)}
      {!step.is_llm ? (
        <LabelledItem label={'Input'} value={step.input} />
      ) : (
        <LabelledItem label={'Input'}>{renderLLM(step?.actual_input)}</LabelledItem>
      )}
      <LabelledItem
        key={step.id}
        label={'Output'}
        className={step.correction ? 'bg-primary/10' : ''}
        value={step.correction ? <TextDiff prev={step.output} cur={step.correction} /> : step.output}
        rightSlot={step?.is_llm ? <CorrectOuput step={step} /> : null}
        leftSlot={step.score ? <b className='text-sm'>* Score: {step.score}</b> : null}
      />
    </div>
  );
};
