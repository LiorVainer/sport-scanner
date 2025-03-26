import { PropsWithChildren } from 'react';
import { ConfigProvider, ThemeConfig } from 'antd';
import { ThemeColors } from '@theme/color.ts';

const config: ThemeConfig = {
    token: {
        colorPrimary: ThemeColors.action,
    },
};

export const AntdProvider = ({ children }: PropsWithChildren<{}>) => (
    <ConfigProvider theme={config}>{children}</ConfigProvider>
);
