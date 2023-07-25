import { mergeBoundingClientRects } from 'autoql-fe-utils';

export const getRenderedChartDimensions = (chartComponent) => {
    const axes = chartComponent?.axesWrapper;

    if (!axes) {
        console.warn('Unable to get chart dimensions - couldnt find axes element');
        return {};
    }

    try {
        const leftAxisBBox = axes.select('.autoql-vanilla-axis-left')?.node()?.getBoundingClientRect();
        const topAxisBBox = axes.select('.autoql-vanilla-axis-top')?.node()?.getBoundingClientRect();
        const bottomAxisBBox = axes.select('.autoql-vanilla-axis-bottom')?.node()?.getBoundingClientRect();
        const rightAxisBBox = axes.select('.autoql-vanilla-axis-right')?.node()?.getBoundingClientRect();
        const clippedLegendBBox = axes
            .select('.autoql-vanilla-chart-legend-clipping-container')
            ?.node()
            ?.getBoundingClientRect();

        const axesBBox = mergeBoundingClientRects([
            leftAxisBBox,
            bottomAxisBBox,
            rightAxisBBox,
            topAxisBBox,
            clippedLegendBBox,
        ]);

        const axesWidth = axesBBox?.width ?? 0;
        const axesHeight = axesBBox?.height ?? 0;
        const axesX = axesBBox?.x ?? 0;
        const axesY = axesBBox?.y ?? 0;

        return {
            chartHeight: axesHeight,
            chartWidth: axesWidth,
            chartX: axesX,
            chartY: axesY,
        };
    } catch (error) {
        console.error(error);
        return {};
    }
};

export const getInnerDimensions = (chartComponent, containerHeight, containerWidth) => {
    try {
        const { chartWidth, chartHeight } = getRenderedChartDimensions(chartComponent);
        if (!chartWidth || !chartHeight) {
            return {};
        }

        const CHART_PADDING = 0;

        const xScale = chartComponent?.xScale;
        const yScale = chartComponent?.yScale;

        let innerWidth = containerWidth - 2 * CHART_PADDING;
        if (xScale && chartWidth) {
            const rangeInPx = xScale.range()[1] - xScale.range()[0];
            const totalHorizontalMargins = chartWidth - rangeInPx;
            innerWidth = containerWidth - totalHorizontalMargins - 2 * CHART_PADDING;
        }

        let innerHeight = containerHeight - 2 * CHART_PADDING;
        if (yScale && chartHeight) {
            const rangeInPx = yScale.range()[0] - yScale.range()[1];
            const totalVerticalMargins = chartHeight - rangeInPx;
            innerHeight = containerHeight - totalVerticalMargins - 2 * CHART_PADDING;
        }

        if (innerWidth < 1) {
            innerWidth = 1;
        }

        if (innerHeight < 1) {
            innerHeight = 1;
        }

        return { innerWidth, innerHeight };
    } catch (error) {
        console.error(error);
        return {};
    }
};

export const getDeltas = (chartComponent) => {
    try {
        const CHART_PADDING = 0; // TODO remove or move
        const axesBBox = chartComponent?.axesWrapper?.node()?.getBBox();

        // Get distance in px to shift to the right
        const axesBBoxX = Math.ceil(axesBBox?.x ?? 0);
        const deltaX = -1 * axesBBoxX + CHART_PADDING;

        // Get distance in px to shift down
        const axesBBoxY = Math.ceil(axesBBox?.y ?? 0);
        const deltaY = -1 * axesBBoxY + CHART_PADDING;

        return { deltaX, deltaY };
    } catch (error) {
        console.error(error);
        return {};
    }
};
