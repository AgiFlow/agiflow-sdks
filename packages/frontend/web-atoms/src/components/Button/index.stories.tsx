import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Button, ButtonProps } from '.';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Buttons/Button',
};

export default meta;
type Story = StoryObj<ButtonProps>;

export const Default: Story = {
  render: args => (
    <div className='grid gap-3'>
      <Button {...args} className='w-full' />
    </div>
  ),
};
Default.args = {
  children: 'Default Button',
};
