declare module 'react-plotly.js' {
    import * as React from 'react';
    import * as Plotly from 'plotly.js';

    interface PlotlyComponentProps {
        data: Plotly.Data[];
        layout?: Partial<Plotly.Layout>;
        frames?: Plotly.Frame[];
        config?: Partial<Plotly.Config>;
        onInitialized?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void;
        onUpdate?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void;
        onPurge?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void;
        onError?: (err: Error) => void;
        onHover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
        onUnhover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
        onClick?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
        onSelected?: (event: Readonly<Plotly.PlotSelectionEvent>) => void;
        className?: string;
        style?: React.CSSProperties;
        useResizeHandler?: boolean;
        revision?: number;
    }

    class PlotlyComponent extends React.Component<PlotlyComponentProps> {}
    export default PlotlyComponent;
}
