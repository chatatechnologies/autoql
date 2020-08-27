const SCALE_LINEAR = chataD3.scaleLinear || chataD3.scale.linear;
const SCALE_BAND = chataD3.scaleBand || chataD3.scale.ordinal;

const getD3Version = () => {
    return chataD3.version.split('.')[0];
}

const getAxisBottom = (scale) => {
    let axis;
    axis = chataD3.axisBottom(scale);
    return axis;
}

const getAxisLeft = (scale) => {
    let axis;

    axis = chataD3.axisLeft(scale);

    return axis;
}


const getBandWidth = (scale) => {
    return scale.bandwidth()
}

const setDomainRange = (
    scale, domainValues, r1, r2, nice=false, padding=0) => {
    scale.range([r1, r2]).domain(domainValues)
    if(padding > 0)scale.padding(padding);
    if(nice)scale.nice();

    return scale;
}

const getColorScale = (domainValues, range) => {
    return chataD3.scaleOrdinal()
    .domain(domainValues)
    .range(range);
}

const getLine = (fnX, fnY) => {
    return chataD3.line()
    .x(fnX)
    .y(fnY)
}

const getArc = (iRadius, oRadius) => {
    return chataD3.arc()
    .innerRadius(iRadius)
    .outerRadius(oRadius)
}

const getPie = (fn) => {
    return chataD3.pie()
    .value(fn)
}

const getArea = (xFn, y0Fn, y1Fn) => {
    return chataD3.area()
    .x(xFn)
    .y0(y0Fn)
    .y1(y1Fn)
}

const getLegend = (scale, legendWrapLength, orient) => {
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

const getStackedAreaData = (visibleGroups, data) => {
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

const getStackedData = (visibleGroups, data) => {
    return chataD3.stack()
    .keys(visibleGroups)
    (data)
}
