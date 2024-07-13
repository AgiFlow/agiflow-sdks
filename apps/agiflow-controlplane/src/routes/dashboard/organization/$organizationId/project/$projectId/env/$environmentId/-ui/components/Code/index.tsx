import { Highlight, HighlightProps, themes } from 'prism-react-renderer';
import { MeasuredContainer, cn, ClipBoardButton } from '@agiflowai/frontend-web-ui';

interface CodeProps extends Omit<HighlightProps, 'theme' | 'children'> {}
export const Code = (props: CodeProps) => (
  <Highlight theme={themes.oneDark} {...props}>
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <MeasuredContainer className='relative flex w-full items-start justify-end' style={{ height: 'auto' }}>
        <pre style={style} className={cn(className, 'flex-1 !overflow-x-auto rounded-md p-4 !text-sm')}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
        <div className='absolute'>
          <ClipBoardButton text={props.code} textNode={<div />} className='h-8 w-8 p-2' variant='ghost' />
        </div>
      </MeasuredContainer>
    )}
  </Highlight>
);
