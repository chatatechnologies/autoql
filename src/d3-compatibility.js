const SCALE_LINEAR = d3.scaleLinear || d3.scale.linear;
const SCALE_BAND = d3.scaleBand || d3.scale.ordinal;

const getD3Version = () => {
    return d3.version.split('.')[0];
}

const getAxisBottom = (scale) => {
    let axis;

    if('function' === typeof d3.axisBottom){
        axis = d3.axisBottom(scale);
    }else{
        axis = d3.svg.axis().scale(scale).orient("bottom");
    }

    return axis;
}

const getAxisLeft = (scale) => {
    let axis;

    if('function' === typeof d3.axisLeft){
        axis = d3.axisLeft(scale);
    }else{
        axis = d3.svg.axis().scale(scale).orient("left");
    }

    return axis;
}


const getBandWidth = (scale) => {
    if(getD3Version() === '3'){
        return scale.rangeBand()
    }else{
        return scale.bandwidth()
    }
}


const setDomainRange = (
    scale, domainValues, r1, r2, nice=false, padding=0) => {
    if(getD3Version() === '3'){
        scale.domain(domainValues)
        .rangeRoundBands([r1, r2], padding);
    }else{
        scale.range([r1, r2]).domain(domainValues)
        if(padding > 0)scale.padding(padding);
        if(nice)scale.nice();
    }

    return scale;
}

const getColorScale = (domainValues, range) => {
    console.log(getD3Version());
    console.log(d3.version.split('.')[0]);
    if(getD3Version() === '3'){
        return d3.scale.ordinal().domain(domainValues)
        .range(range);
    }else{
        return d3.scaleOrdinal()
        .domain(domainValues)
        .range(range);
    }
}

const getLine = (fnX, fnY) => {
    if(getD3Version() === '3'){
        return d3.svg.line()
		.x(fnX)
		.y(fnY)
		.interpolate("linear");
    }else{
        return d3.line()
        .x(fnX)
        .y(fnY)
    }
}

const getArc = (iRadius, oRadius) => {
    if(getD3Version() === '3'){
        return d3.svg.arc()
        .innerRadius(iRadius)
        .outerRadius(oRadius)
    }else{
        return d3.arc()
        .innerRadius(iRadius)
        .outerRadius(oRadius)
    }
}

const getPie = (fn) => {
    if(getD3Version() === '3'){
        return d3.layout.pie().value(fn);
    }else{
        return d3.pie()
        .value(fn)
    }
}

const getArea = (xFn, y0Fn, y1Fn) => {
    if(getD3Version() === '3'){
        return d3.svg.area()
        .x(xFn)
        .y0(y0Fn)
        .y1(y1Fn)
    }else{
        return d3.area()
        .x(xFn)
        .y0(y0Fn)
        .y1(y1Fn)
    }
}

const getLegend = (scale, legendWrapLength, orient) => {
    if(getD3Version() === '3'){
        return d3.legend.color()
        .shape(
            'path',
            d3.svg.symbol().
            type("circle")
            .size(75)()
        )
        .orient(orient)
        .shapePadding(5)
        .scale(scale);
    }else{
        return d3.legendColor()
        .shape(
            'path',
            d3.symbol()
            .type(d3.symbolCircle)
            .size(75)()
        )
        .orient(orient)
        .shapePadding(5)
        .labelWrap(legendWrapLength)
        .scale(scale)
    }
}

const getStackedAreaData = (visibleGroups, data) => {
    if(getD3Version() === '3'){
        return d3.layout.stack()(visibleGroups.map((group) => {
            var dataGroup = data.map((d) => {
                return {
                    x: d.group,
                    y: d[group] || 0,
                    component: group
                }
            })
            dataGroup.key = group;
            return dataGroup
        }))
    }else{
        return d3.stack()
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
}

const getStackedData = (visibleGroups, data) => {
    if(getD3Version() === '3'){
        return d3.layout.stack()(visibleGroups.map((group) => {
            var dataGroup = data.map((d) => {
                return {
                    x: d.group,
                    y: +d[group] || 0,
                    component: group
                }
            })
            dataGroup.key = group;
            return dataGroup
        }))
    }else{
        return d3.stack()
        .keys(visibleGroups)
        (data)
    }
}
