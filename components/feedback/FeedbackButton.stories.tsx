// @ts-ignore: Storybook is optional in production
import type { Meta, StoryObj } from '@storybook/react';
import FeedbackButton from './FeedbackButton';

const meta = {
  title: 'Components/Feedback/FeedbackButton',
  component: FeedbackButton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '사용자 피드백을 수집하는 플로팅 버튼 컴포넌트입니다. 버그 리포트, 기능 요청, 일반 피드백을 지원합니다.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeedbackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '기본 피드백 버튼입니다. 화면 우측 하단에 고정되어 표시됩니다.',
      },
    },
  },
};

export const WithMockData: Story = {
  parameters: {
    docs: {
      description: {
        story: '피드백 폼이 열린 상태의 예시입니다.',
      },
    },
  },
  play: async ({ canvasElement }: any) => {
    const button = canvasElement.querySelector('button');
    if (button) {
      button.click();
    }
  },
};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: '모바일 화면에서의 피드백 버튼 표시입니다.',
      },
    },
  },
};

export const DarkMode: Story = {
  parameters: {
    darkMode: {
      current: 'dark',
    },
    docs: {
      description: {
        story: '다크 모드에서의 피드백 버튼 표시입니다.',
      },
    },
  },
};

export const AccessibilityFocus: Story = {
  parameters: {
    docs: {
      description: {
        story: '키보드 접근성 테스트를 위한 스토리입니다.',
      },
    },
  },
  play: async ({ canvasElement }: any) => {
    const button = canvasElement.querySelector('button');
    if (button) {
      button.focus();
    }
  },
};