import {
    getThemeValue,
    getAxis,
    getMaxTickLabelWidth,
    getLabelsBBox,
    adjustTitleToFit,
    MINIMUM_TITLE_LENGTH,
    AXIS_TITLE_PADDING_TOP,
    CHART_PADDING,
    transformLabels,
    AXIS_TITLE_BORDER_PADDING_TOP,
    AXIS_TITLE_BORDER_PADDING_LEFT
} from 'autoql-fe-utils';

import { CSS_PREFIX } from '../Constants';

export function Axis(container, params = {}, axisOptions = {}) {
    const { outerHeight, outerWidth, deltaX, deltaY, toggleChartScale, firstDraw, options = {} } = params;
    const { orient, scale, innerHeight, innerWidth } = axisOptions;

    this.axisElement = container
        .append('g')
        .attr('class', `autoql-vanilla-axis autoql-vanilla-axis-${orient}`)
        .style('font-size', '12px')
        .style('font-family', getThemeValue('font-family', CSS_PREFIX))
        .style('fill', 'currentColor')
        .style('fill-opacity', 1)
        .style('cursor', 'default')
        .style('letter-spacing', 'normal');
    // .attr('transform', `translate(${translateX}, ${translateY})`) // TODO

    if (!['left', 'bottom', 'right', 'top'].includes(orient)) {
        console.warn(`Unable to create axis - orientation provided was invalid: ${orient}`);
        return;
    }

    if (!scale) {
        console.warn(`Unable to create ${orient} axis - scale was not provided`);
        return;
    }

    // this.shouldLabelsRotate = false; // TODO
    var maxLabelWidth = getMaxTickLabelWidth({ orient, outerHeight, outerWidth });
    var axis = getAxis({ orient, scale, innerWidth, innerHeight, maxLabelWidth });

    const positionTitle = (titleElement) => {
        adjustTitleToFit(titleElement, orient, {
            labelsBBox: this.labelsBBox,
            innerWidth,
            innerHeight,
            outerWidth,
            deltaX,
            deltaY,
            chartPadding: CHART_PADDING,
        });
    };

    const createAxisTitle = () => {
        this.axisTitleContainer = this.axisElement.append('g');
        var axisTitle = this.axisTitleContainer
            .append('text')
            .attr('class', 'autoql-vanilla-axis-title')
            .attr('dominant-baseline', 'middle')
            .attr('text-anchor', 'middle')
            .attr('length-adjust', 'spacingAndGlyphs')
            .attr('text-length', MINIMUM_TITLE_LENGTH) // TODO

        const fullTitle = scale?.title ?? '';
        let title = fullTitle;
        if (fullTitle.length > 35) {
            title = `${title.substring(0, 35)}...`;
        }

        axisTitle.append('tspan').text(title);

        if (scale?.hasDropdown) {
            axisTitle
                .append('tspan')
                .html('&nbsp;&#9660;')
                .attr('class', 'autoql-vanilla-axis-selector-arrow')
                .style('opacity', 0)
                .style('font-size', '8px');
        }

        switch (orient) {
            case 'bottom': {
                const labelBBoxBottom = (this.labelsBBox?.y ?? 0) + (this.labelsBBox?.height ?? 0);

                axisTitle.attr('x', innerWidth / 2).attr('y', labelBBoxBottom + AXIS_TITLE_PADDING_TOP);

                break;
            }
            case 'left': {
                const labelBBoxX = this.labelsBBox?.x ?? 0;

                axisTitle
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -0.5 * innerHeight)
                    .attr('y', labelBBoxX - AXIS_TITLE_PADDING_TOP);
                break;
            }
            case 'right': {
                const labelBBoxRightX = (this.labelsBBox?.x ?? 0) + (this.labelsBBox?.width ?? 0);

                axisTitle
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -0.5 * innerHeight)
                    .attr('y', labelBBoxRightX + AXIS_TITLE_PADDING_TOP);
                break;
            }
            case 'top': {
                const labelBBoxTopY = this.labelsBBox?.y ?? 0;

                axisTitle
                    .attr('transform', 'rotate(-90)')
                    .attr('x', innerWidth / 2)
                    .attr('y', labelBBoxTopY - AXIS_TITLE_PADDING_TOP);
                break;
            }
        }

        positionTitle(this.axisTitleContainer.node());

        // Axis Selector
        if (scale?.hasDropdown) {
            const titleBBox = axisTitle.node()?.getBBox()
            const titleHeight = titleBBox?.height ?? 0
            const titleWidth = titleBBox?.width ?? 0

            this.axisSelector = this.axisElement.append('rect')
                .attr('class', 'autoql-vanilla-axis-selector-box')
                .attr('transform', axisTitle.attr('transform'))
                .attr('width', Math.round(titleWidth + 2 * AXIS_TITLE_BORDER_PADDING_LEFT))
                .attr('height', Math.round(titleHeight + 2 * AXIS_TITLE_BORDER_PADDING_TOP))
                .attr('x', Math.round(titleBBox?.x - AXIS_TITLE_BORDER_PADDING_LEFT))
                .attr('y', Math.round(titleBBox?.y - AXIS_TITLE_BORDER_PADDING_TOP))
                .attr('rx', 4)
                .on('click', function (d) {console.log('ON CLICK AXIS SELECTOR', d)})
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
        this.axisElement.selectAll('.autoql-vanilla-axis path').style('display', 'none');

        if (scale?.type !== 'LINEAR') {
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

    transformLabels(orient, this.axisElement.node(), innerHeight);

    this.labelsBBox = getLabelsBBox(this.axisElement.node());

    createAxisTitle();
    addTooltipsToLabels();
    styleTicks();

    // adjustLoadMoreSelectorToFit()
    // adjustAxisScalerBorder()
    // adjustLegendLocation()

    return this.axisElement;
}
