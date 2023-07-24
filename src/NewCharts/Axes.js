import { getLegendLabelsForMultiSeries, getLegendLocation } from 'autoql-fe-utils';
import { Axis } from './Axis';
import { Legend } from './Legend';

export function Axes(container, params = {}) {
    const {
        height,
        width,
        xScale,
        yScale,
        xCol,
        yCol,
        xCol2,
        yCol2,
        xScale2,
        yScale2,
        toggleChartScale,
        options = {},
        bottomLabelsRotated,
        topLabelsRotated,
        legend = {},
    } = params;

    if (!yScale || !xScale || isNaN(height) || isNaN(width)) {
        console.warn('Unable to create axes - one of the following was not provided: ', {
            yScale,
            xScale,
            height,
            width,
        });
        return;
    }

    const xScaleRange = xScale?.range() || [0, 0];
    const yScaleRange = yScale?.range() || [0, 0];
    const innerWidth = xScaleRange[1] - xScaleRange[0];
    const innerHeight = yScaleRange[0] - yScaleRange[1];

    const axesOptions = {
        innerWidth,
        innerHeight,
    };

    var axes = container.append('g').attr('class', 'autoql-vanilla-axes');

    this.createAxis = (orient) => {
        switch (orient) {
            case 'left': {
                return new Axis(axes, params, { orient, scale: yScale, column: yCol, ...axesOptions });
            }
            case 'bottom': {
                return new Axis(axes, params, {
                    orient,
                    scale: xScale,
                    column: xCol,
                    rotateLabels: bottomLabelsRotated,
                    ...axesOptions,
                });
            }
            case 'right': {
                if (!!yCol2 && !!yScale2) {
                    return new Axis(axes, params, { orient, scale: yScale2, column: yCol2, ...axesOptions });
                }
                break;
            }
            case 'top': {
                if (!!xCol2 && !!xScale2) {
                    return new Axis(axes, params, {
                        orient,
                        scale: xScale2,
                        column: xCol2,
                        rotateLabels: topLabelsRotated,
                        ...axesOptions,
                    });
                }
            }
            default: {
                return;
            }
        }
    };

    this.createLegend = () => {
        if (!legend.location) {
            return;
        }

        // const location = getLegendLocation(columnIndexConfig.numberColumnIndices, type, options.legendLocation);
        // const legendLabels = getLegendLabelsForMultiSeries(columns, colorScale, columnIndexConfig.numberColumnIndices);
        // const orientation = location === 'bottom' ? 'horizontal' : 'vertical';

        const hasSecondAxis = (!!yCol2 && !!yScale2) || (!!xCol2 && !!xScale2);

        let translateX = 0;
        let translateY = 0;


        if (this.rightAxis) {
            // bbox = this.rightAxis.node()?.getBBox()
        } else {

        }

        const bottomAxisBBox = this.bottomAxis?.node()?.getBBox()
        const bottomAxisBBoxRight = bottomAxisBBox.x + bottomAxisBBox.width
        const bottomAxisBBoxBottom = bottomAxisBBox.y + bottomAxisBBox.height

        if (legend.location === 'right') {
            translateX = bottomAxisBBoxRight
        } else if (legend.location === 'bottom') {
            translateY = bottomAxisBBoxBottom
        }

        var legendElement = new Legend(axes, { ...params, ...legend, hasSecondAxis });

        legendElement.attr('transform', `translate(${translateX}, ${translateY})`)

        return legendElement
    };

    this.leftAxis = this.createAxis('left');
    this.rightAxis = this.createAxis('right');
    this.bottomAxis = this.createAxis('bottom');
    this.topAxis = this.createAxis('top');
    this.legend = this.createLegend();

    // if (bottomAxisLabelsRotated || topAxisLabelsRotated) {
    // REDRAW LEFT AND RIGHT AXES
    // }

    return axes.node();
}
