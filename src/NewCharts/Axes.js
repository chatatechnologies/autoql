import { mergeBboxes } from 'autoql-fe-utils';
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
        let axis;

        switch (orient) {
            case 'left': {
                axis = new Axis(axes, params, { orient, scale: yScale, column: yCol, ...axesOptions });
                break;
            }
            case 'bottom': {
                axis = new Axis(axes, params, {
                    orient,
                    scale: xScale,
                    column: xCol,
                    rotateLabels: bottomLabelsRotated,
                    ...axesOptions,
                });
                break;
            }
            case 'right': {
                if (!!yCol2 && !!yScale2) {
                    axis = new Axis(axes, params, { orient, scale: yScale2, column: yCol2, ...axesOptions });
                }
                break;
            }
            case 'top': {
                if (!!xCol2 && !!xScale2) {
                    axis = new Axis(axes, params, {
                        orient,
                        scale: xScale2,
                        column: xCol2,
                        rotateLabels: topLabelsRotated,
                        ...axesOptions,
                    });
                }
                break;
            }
            default: {
                // no axis
            }
        }

        return axis
    };

    this.createLegend = () => {
        try {
            if (!legend.location) {
                return;
            }
    
            let translateX = 0;
            let translateY = 0;
    
            const leftAxisBBox = this.leftAxis?.node()?.getBBox();
            const topAxisBBox = this.topAxis?.node()?.getBBox();
            const bottomAxisBBox = this.bottomAxis?.node()?.getBBox();
            const rightAxisBBox = this.rightAxis?.node()?.getBBox();
    
            const axesBBox = mergeBboxes([leftAxisBBox, bottomAxisBBox, rightAxisBBox, topAxisBBox]);
    
            const axesBBoxRight = axesBBox.x + axesBBox.width;
            const axesBBoxBottom = axesBBox.y + axesBBox.height;
    
            if (legend.location === 'right') {
                translateX = axesBBoxRight;
            } else if (legend.location === 'bottom') {
                translateY = axesBBoxBottom;
            }
    
            const hasSecondAxis = (!!yCol2 && !!yScale2) || (!!xCol2 && !!xScale2);
    
            var legendElement = new Legend(axes, { ...params, ...legend, hasSecondAxis });
    
            legendElement.attr('transform', `translate(${translateX}, ${translateY})`);
    
            return legendElement;
        } catch (error) {
            console.error(error)
        }
    };

    this.leftAxis = this.createAxis('left');
    this.rightAxis = this.createAxis('right');
    this.bottomAxis = this.createAxis('bottom');
    this.topAxis = this.createAxis('top');
    this.legend = this.createLegend();

    return axes.node();
}
