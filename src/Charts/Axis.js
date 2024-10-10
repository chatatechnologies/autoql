import {
    getThemeValue,
    getAxis,
    getMaxTickLabelWidth,
    adjustTitleToFit,
    MINIMUM_TITLE_LENGTH,
    AXIS_TITLE_PADDING_TOP,
    CHART_PADDING,
    transformLabels,
    AXIS_TITLE_BORDER_PADDING_TOP,
    AXIS_TITLE_BORDER_PADDING_LEFT,
    LABEL_FONT_SIZE,
    TITLE_FONT_SIZE,
    mergeBoundingClientRects,
} from 'autoql-fe-utils';

import { select } from 'd3-selection';
import { CSS_PREFIX } from '../Constants';
import { ChataChartListPopover } from './ChataChartListPopover';
import { ChartRowSelector } from './ChartRowSelector';

export function Axis(container, params = {}, axisOptions = {}) {
    const {
        json,
        outerHeight,
        outerWidth,
        deltaX,
        deltaY,
        columns,
        firstDraw,
        options = {},
        onDataFetching,
        onNewData,
        onDataFetchError,
        columnIndexConfig,
    } = params;
    const { orient, scale, innerHeight, innerWidth, rotateLabels, transform } = axisOptions;

    this.axisElement = container
        .append('g')
        .attr('class', `autoql-vanilla-axis autoql-vanilla-axis-${orient}`)
        .style('font-size', LABEL_FONT_SIZE)
        .style('font-family', getThemeValue('font-family', CSS_PREFIX))
        .style('fill', 'currentColor')
        .style('fill-opacity', 1)
        .style('cursor', 'default')
        .style('letter-spacing', 'normal');

    if (transform) {
        this.axisElement.attr('transform', transform);
    }

    if (!['left', 'bottom', 'right', 'top'].includes(orient)) {
        console.warn(`Unable to create axis - orientation provided was invalid: ${orient}`);
        return;
    }

    if (!scale) {
        console.warn(`Unable to create ${orient} axis - scale was not provided`);
        return;
    }

    var maxLabelWidth = getMaxTickLabelWidth({ orient, outerHeight, outerWidth });
    var axis = getAxis({ orient, scale, innerWidth, innerHeight, maxLabelWidth });

    const positionTitle = (titleElement) => {
        adjustTitleToFit(
            titleElement,
            orient,
            {
                labelsBBox: this.labelsBBox,
                innerWidth,
                innerHeight,
                outerWidth,
                deltaX,
                deltaY,
                chartPadding: CHART_PADDING,
            },
            CSS_PREFIX,
        );
    };

    const onSelectorClick = (evt, legendEvent) => {
        if (this.axisSelectorPopover?.style?.visibility === 'visible') {
            this.axisSelectorPopover.destroy();
            this.axisSelectorPopover = undefined;
            return;
        }

        let placement;
        if (orient === 'left') {
            placement = 'right';
        } else if (orient === 'bottom') {
            placement = 'top';
        } else if (orient === 'right') {
            placement = 'left';
        } else if (orient === 'top') {
            placement = 'bottom';
        }

        this.axisSelectorPopover = new ChataChartListPopover(
            evt,
            scale,
            columns,
            placement,
            'middle',
            columnIndexConfig,
        );
    };

    const handleLabelRotation = () => {
        const didLabelsRotate = transformLabels(orient, this.axisElement.node(), innerHeight, rotateLabels);
        this.axisElement.classed('autoql-vanilla-axis-labels-rotated', !!didLabelsRotate);
    };

    const getLabelsBBox = (axisElement) => {
        let labelsBBox = {};
        // svg coordinate system is different from clientRect coordinate system
        // we need to get the deltas first, then we can apply them to the bounding rect
        const axisBBox = axisElement?.getBBox?.();
        const axisBoundingRect = axisElement?.getBoundingClientRect?.();

        let xDiff = 0;
        let yDiff = 0;
        if (!!axisBBox && !!axisBoundingRect) {
            xDiff = axisBoundingRect?.x - axisBBox?.x;
            yDiff = axisBoundingRect?.y - axisBBox?.y;
        }

        const labelBboxes = [];
        select(axisElement)
            .selectAll('g.tick text')
            .each(function () {
                const textBoundingRect = select(this).node().getBoundingClientRect();

                labelBboxes.push({
                    left: textBoundingRect.left - xDiff,
                    bottom: textBoundingRect.bottom - yDiff,
                    right: textBoundingRect.right - xDiff,
                    top: textBoundingRect.top - yDiff,
                });
            });

        if (labelBboxes) {
            const allLabelsBbox = mergeBoundingClientRects(labelBboxes);
            labelsBBox = { ...allLabelsBbox };
        }

        return labelsBBox;
    };

    const createAxisTitle = () => {
        this.axisTitleContainer = this.axisElement.append('g');

        this.axisTitle = this.axisTitleContainer
            .append('text')
            .attr('class', `${CSS_PREFIX}-axis-title`)
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .style('font-size', TITLE_FONT_SIZE)
            .style('font-weight', 600)
            .style('stroke-width', 0)
            .attr('lengthAdjust', 'spacingAndGlyphs')
            .attr('textLength', MINIMUM_TITLE_LENGTH);

        const fullTitle = scale?.title ?? '';
        let title = fullTitle;
        if (fullTitle.length > 35) {
            title = `${title.substring(0, 35)}...`;
        }

        this.axisTitle.append('tspan').text(title);

        if (scale?.hasDropdown) {
            this.axisTitle
                .append('tspan')
                .html('&nbsp;&#9660;')
                .attr('class', 'autoql-vanilla-axis-selector-arrow')
                .style('opacity', 0)
                .style('font-size', '8px');
        }

        switch (orient) {
            case 'bottom': {
                const labelBBoxBottom = (this.labelsBBox?.y ?? 0) + (this.labelsBBox?.height ?? 0);

                this.axisTitle.attr('x', innerWidth / 2).attr('y', labelBBoxBottom + AXIS_TITLE_PADDING_TOP);

                break;
            }
            case 'left': {
                const labelBBoxX = this.labelsBBox?.x ?? 0;

                this.axisTitle
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -0.5 * innerHeight)
                    .attr('y', labelBBoxX - AXIS_TITLE_PADDING_TOP);
                break;
            }
            case 'right': {
                const labelBBoxRightX = (this.labelsBBox?.x ?? 0) + (this.labelsBBox?.width ?? 0);

                this.axisTitle
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -0.5 * innerHeight)
                    .attr('y', labelBBoxRightX + AXIS_TITLE_PADDING_TOP);
                break;
            }
            case 'top': {
                const labelBBoxTopY = this.labelsBBox?.y ?? 0;

                this.axisTitle
                    .attr('transform', 'rotate(-90)')
                    .attr('x', innerWidth / 2)
                    .attr('y', labelBBoxTopY - AXIS_TITLE_PADDING_TOP);
                break;
            }
        }

        positionTitle(this.axisTitleContainer.node());

        // Axis Selector
        this.titleBBox = this.axisTitle.node()?.getBBox();
        const titleHeight = this.titleBBox?.height ?? 0;
        const titleWidth = this.titleBBox?.width ?? 0;

        this.axisTitleBorder = this.axisTitleContainer
            .append('rect')
            .attr('class', 'autoql-vanilla-axis-selector-box')
            .attr('transform', this.axisTitle.attr('transform'))
            .attr('width', Math.round(titleWidth + 2 * AXIS_TITLE_BORDER_PADDING_LEFT))
            .attr('height', Math.round(titleHeight + 2 * AXIS_TITLE_BORDER_PADDING_TOP))
            .attr('x', Math.round(this.titleBBox?.x - AXIS_TITLE_BORDER_PADDING_LEFT))
            .attr('y', Math.round(this.titleBBox?.y - AXIS_TITLE_BORDER_PADDING_TOP))
            .style('visibility', 'hidden')
            .style('opacity', 0)
            .attr('rx', 4);

        if (scale?.hasDropdown) {
            this.axisTitleBorder.style('visibility', 'visible').on('click', onSelectorClick);
        }
    };

    const addTooltipsToLabels = () => {
        if (firstDraw) {
            // DO NOT BOTHER WITH TOOLTIPS ON FIRST DRAW
        }

        // TODO
        // const { scale } = this.props
        // const maxLabelWidth = this.maxLabelWidth
        // this.axisElement
        //   .selectAll('.autoql-vanilla-axis .tick text')
        //   .style('fill', 'currentColor')
        //   .style('fill-opacity', '1')
        //   .style('font-family', 'inherit')
        //   .attr('data-for', this.props.chartTooltipID)
        //   .attr('data-effect', 'float')
        //   .attr('data-tip', function (d) {
        //     if (select(this).text()?.slice(-3) === '...') {
        //       const { fullWidthLabel } = formatChartLabel({ d, scale, maxLabelWidth })
        //       if (fullWidthLabel) {
        //         return fullWidthLabel
        //       }
        //     }
        //     return null
        //   })
    };

    const styleTicks = () => {
        this.axisElement.selectAll('.autoql-vanilla-axis path.domain').style('display', 'none');

        if (scale?.type !== 'LINEAR' || orient === 'right' || orient === 'top') {
            this.axisElement.selectAll('g.tick line').style('opacity', 0);
        } else {
            this.axisElement
                .selectAll('.autoql-vanilla-axis line')
                .style('stroke-width', '1px')
                .style('stroke', 'currentColor')
                .style('opacity', '0.08')
                .style('shape-rendering', 'crispedges');

            this.axisElement.selectAll('g.tick').select('line').style('opacity', 0.1);

            // Make tick line at 0 darker
            this.axisElement
                .selectAll('g.tick')
                .filter((d) => d == 0)
                .select('line')
                .style('opacity', 0.3);
        }
    };

    this.axisElement.call(axis);

    handleLabelRotation();

    this.labelsBBox = getLabelsBBox(this.axisElement.node());

    createAxisTitle();

    addTooltipsToLabels();
    styleTicks();

    // adjustAxisScalerBorder()

    return this.axisElement;
}
