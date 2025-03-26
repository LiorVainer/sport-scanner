declare module '*.module.css';
declare module '*.module.scss';
// styles.d.ts
declare module '*.scss' {
    const content: { [key: string]: string };
    export default content;
}
declare module '*.svg' {
    import * as React from 'react';
    const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
}
