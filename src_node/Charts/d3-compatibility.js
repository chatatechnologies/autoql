import { * as chataD3 } from 'd3'

export const SCALE_LINEAR = chataD3.scaleLinear || chataD3.scale.linear;
export const SCALE_BAND = chataD3.scaleBand || chataD3.scale.ordinal;

export const getD3Version = () => {
    return chataD3.version.split('.')[0];
}

export const getAxisBottom = (scale) => {
    let axis;
    axis = chataD3.axisBottom(scale);
    return axis;
}

export const getAxisLeft = (scale) => {
    let axis;

    axis = chataD3.axisLeft(scale);

    return axis;
}


export const getBandWidth = (scale) => {
    return scale.bandwidth()
}

export const setDomainRange = (
    scale, domainValues, r1, r2, nice=false, padding=0) => {
    scale.range([r1, r2]).domain(domainValues)
    if(padding > 0)scale.padding(padding);
    if(nice)scale.nice();

    return scale;
}

export const getColorScale = (domainValues, range) => {
    return chataD3.scaleOrdinal()
    .domain(domainValues)
    .range(range);
}

export const getLine = (fnX, fnY) => {
    return chataD3.line()
    .x(fnX)
    .y(fnY)
}

export const getArc = (iRadius, oRadius) => {
    return chataD3.arc()
    .innerRadius(iRadius)
    .outerRadius(oRadius)
}

export const getPie = (fn) => {
    return chataD3.pie()
    .value(fn)
}

export const getArea = (xFn, y0Fn, y1Fn) => {
    return chataD3.area()
    .x(xFn)
    .y0(y0Fn)
    .y1(y1Fn)
}

export const getLegend = (scale, legendWrapLength, orient) => {
    return chataD3.legendColor()
    .shape(
        'path',
        chataD3.symbol()
        .type(chataD3.symbolCircle)
        .size(75)()
    )
    .orient(orient)
    .shapePadding(5)
    .labelWrap(legendWrapLength)
    .scale(scale)
}

export const getStackedAreaData = (visibleGroups, data) => {
    return chataD3.stack()
    .keys(visibleGroups)
    .value(function(d, key){
        var val = parseFloat(d[key]);
        if(isNaN(val)){
            return 0;
        }
        return val;
    })
    (data)
}

export const getStackedData = (visibleGroups, data) => {
    return chataD3.stack()
    .keys(visibleGroups)
    (data)
}
