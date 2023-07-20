import { Axis } from './Axis';

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
                return new Axis(axes, params, { orient, scale: xScale, column: xCol, ...axesOptions });
            }
            case 'right': {
                if (!!yCol2 && !!yScale2) {
                    return new Axis(axes, params, { orient, scale: yScale2, column: yCol2, ...axesOptions });
                }
                break;
            }
            case 'top': {
                if (!!xCol2 && !!xScale2) {
                    return new Axis(axes, params, { orient, scale: xScale2, column: xCol2, ...axesOptions });
                }
            }
            default: {
                return;
            }
        }
    };

    this.leftAxis = this.createAxis('left');
    this.bottomAxis = this.createAxis('bottom');
    this.rightAxis = this.createAxis('right');
    this.topAxis = this.createAxis('top');

    return axes.node();
}
