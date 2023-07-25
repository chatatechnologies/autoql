import {
    LABEL_FONT_SIZE,
    VERTICAL_LEGEND_SPACING,
    applyLegendTitleStyles,
    getLegendScale,
    getMaxLegendSectionWidth,
    getlegendLabelSections,
    legendColor,
    mergeBboxes,
    LEGEND_SHAPE_SIZE,
    getMaxLegendHeight,
    getTotalVerticalPadding,
    getTotalHorizontalPadding,
    LEGEND_BORDER_PADDING,
    LEGEND_BORDER_THICKNESS,
    LEGEND_TOP_ADJUSTMENT,
    removeHiddenLegendLabels,
    getTotalLeftPadding,
    getTotalTopPadding,
    applyStylesForHiddenSeries,
    LOAD_MORE_DROPDOWN_PADDING_BOTTOM,
    TITLE_FONT_SIZE,
} from 'autoql-fe-utils';

import { symbol, symbolSquare } from 'd3-shape';

export function Legend(container, params = {}) {
    const {
        labels,
        labels2,
        height,
        outerHeight,
        outerWidth,
        orientation = 'vertical',
        hasSecondAxis,
        title,
        shape,
        onLegendClick,
    } = params;

    this.legendElements = [];

    const legendPadding = { top: 0, bottom: 0, left: 20, right: 0 };
    if (orientation === 'horizontal') {
        legendPadding.right = legendPadding.left = LEGEND_BORDER_PADDING;
        legendPadding.top = LOAD_MORE_DROPDOWN_PADDING_BOTTOM;
    }

    const translateX = getTotalLeftPadding(legendPadding);
    const translateY = getTotalTopPadding(legendPadding) + LEGEND_TOP_ADJUSTMENT;

    const onLegendCellClick = (labelText, legendLabels) => {
        const label = legendLabels?.find((l) => l.label === labelText);
        if (!label) {
            return;
        }

        const isHidingLabel = !label.hidden;
        const visibleLegendLabels = legendLabels?.filter((l) => !l.hidden);
        const allowClick = !isHidingLabel || visibleLegendLabels?.length > 1;
        if (allowClick) {
            onLegendClick(label);
        }
    };

    const createLegend = (legendLabels, sectionIndex) => {
        if (!legendLabels?.length) {
            return;
        }

        const self = this;

        const legendNumber = legendLabels[0]?.legendNumber;
        const isFirstSection = !!legendLabels[0]?.isFirst;
        const isSecondLegend = legendNumber === 2;
        const allLabels = legendNumber === 2 ? labels2 : labels;
        const legendScale = getLegendScale(legendLabels);
        const maxSectionWidth = getMaxLegendSectionWidth({ orientation, outerWidth, legendPadding });

        var legendOrdinal = legendColor()
            .orient('vertical')
            .path(symbol().type(symbolSquare).size(LEGEND_SHAPE_SIZE)())
            .shapePadding(8)
            .labelWrap(maxSectionWidth - 20)
            .labelOffset(10)
            .scale(legendScale)
            .title(title)
            .titleWidth(maxSectionWidth)
            .on('cellclick', function () {
                onLegendCellClick(this['__data__'], allLabels);
            });

        if (isSecondLegend) {
            legendOrdinal.shape('line');
        } else if (shape) {
            legendOrdinal.shape(shape);
        }

        var legendElement = this.legendElementContainer.append('g');
        // .attr('transform', `translate(${translateX},${translateY})`);

        legendElement
            .call(legendOrdinal)
            .attr('class', 'legendOrdinal')
            .style('fill', 'currentColor')
            .style('fill-opacity', '1')
            .style('font-family', 'inherit')
            .style('font-size', `${TITLE_FONT_SIZE}px`);

        legendElement.selectAll('.cell text.label').style('font-size', `${LABEL_FONT_SIZE}px`);

        this.legendElements.push(legendElement.node());

        if (sectionIndex > 0) {
            const previousLegendSectionsBBox = mergeBboxes(
                this.legendElements.filter((el, i) => el && i < sectionIndex).map((el) => el.getBoundingClientRect()),
            );

            if (orientation === 'vertical') {
                const sectionShift = (previousLegendSectionsBBox?.height ?? 0) + VERTICAL_LEGEND_SPACING;
                legendElement.attr('transform', `translate(0,${sectionShift})`);
            } else if (orientation === 'horizontal') {
                const sectionShift = (previousLegendSectionsBBox?.width ?? 0) + HORIZONTAL_LEGEND_SPACING;
                legendElement.attr('transform', `translate(${sectionShift},0)`);
            }
        }

        applyLegendTitleStyles({
            title,
            isFirstSection,
            legendElement: legendElement.node(),
        });

        const mergedBBox = mergeBboxes(this.legendElements.map((el) => el?.getBoundingClientRect()));

        this.combinedLegendWidth = !isNaN(mergedBBox?.width) ? mergedBBox?.width : 0;
        this.combinedLegendHeight = !isNaN(mergedBBox?.height) ? mergedBBox?.height : 0;

        const totalHorizontalPadding = getTotalHorizontalPadding(legendPadding);
        const totalVerticalPadding = getTotalVerticalPadding(legendPadding);

        const maxLegendWidth = outerWidth - totalHorizontalPadding;
        const maxLegendHeight = getMaxLegendHeight({ orientation, outerHeight, height, legendPadding });

        const legendHeight = this.combinedLegendHeight <= maxLegendHeight ? this.combinedLegendHeight : maxLegendHeight;
        const legendWidth = this.combinedLegendWidth <= maxLegendWidth ? this.combinedLegendWidth : maxLegendWidth;

        var legendClippingContainer = this.legendContainer
            .append('rect')
            .attr('class', 'autoql-vanilla-chart-legend-clipping-container')
            .attr('height', legendHeight + totalVerticalPadding)
            .attr('width', legendWidth + totalHorizontalPadding)
            .attr('rx', 4)
            .attr('transform', `translate(${-translateX},${-translateY})`)
            .style('stroke', 'transparent')
            .style('fill', 'transparent')
            .style('pointer-events', 'none');

        var legendBorder = this.legendContainer
            .append('rect')
            .attr('class', 'autoql-vanilla-chart-legend-border')
            .attr('height', legendHeight + 2 * LEGEND_BORDER_PADDING)
            .attr('width', legendWidth + 2 * LEGEND_BORDER_PADDING)
            .attr('rx', 2)
            .style('stroke', 'var(--autoql-vanilla-border-color)')
            .style('fill', 'transparent')
            .style('pointer-events', 'none')
            .style('stroke-opacity', 0.6)
            .attr(
                'transform',
                `translate(${-LEGEND_BORDER_PADDING - LEGEND_BORDER_THICKNESS},${
                    -LEGEND_BORDER_PADDING - LEGEND_TOP_ADJUSTMENT - LEGEND_BORDER_THICKNESS
                })`,
            );

        const legendElementNode = legendElement.node();
        const legendBorderNode = legendBorder.node();

        removeHiddenLegendLabels({ legendElement: legendElementNode, legendBorder: legendBorderNode });
        applyStylesForHiddenSeries({ legendElement: legendElementNode, legendLabels });
    };

    this.legend = container.append('g').attr('class', 'autoql-vanilla-chart-legend');
    this.legendContainer = this.legend.append('g');
    this.legendElementContainer = this.legendContainer.append('g').attr('class', 'autoql-vanilla-legend-content');

    const createAllLegends = () => {
        this.legendLabelSections = getlegendLabelSections({
            orientation,
            outerWidth,
            hasSecondAxis,
            labels,
            labels2,
            legendPadding,
        });

        this.legendLabelSections?.forEach((legendLabels, i) => {
            createLegend(legendLabels, i);
        });
    };

    createAllLegends();

    this.legendContainer.attr('transform', `translate(${translateX}, ${translateY})`);

    return this.legend;
}
