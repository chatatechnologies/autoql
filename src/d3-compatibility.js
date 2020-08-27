const SCALE_LINEAR = chataD3.scaleLinear || chataD3.scale.linear;
const SCALE_BAND = chataD3.scaleBand || chataD3.scale.ordinal;

const getD3Version = () => {
    return chataD3.version.split('.')[0];
}

const getAxisBottom = (scale) => {
    let axis;

    if('function' === typeof chataD3.axisBottom){
        axis = chataD3.axisBottom(scale);
    }else{
        axis = chataD3.svg.axis().scale(scale).orient("bottom");
    }

    return axis;
}

const getAxisLeft = (scale) => {
    let axis;

    if('function' === typeof chataD3.axisLeft){
        axis = chataD3.axisLeft(scale);
    }else{
        axis = chataD3.svg.axis().scale(scale).orient("left");
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
    console.log(chataD3.version.split('.')[0]);
    if(getD3Version() === '3'){
        return chataD3.scale.ordinal().domain(domainValues)
        .range(range);
    }else{
        return chataD3.scaleOrdinal()
        .domain(domainValues)
        .range(range);
    }
}

const getLine = (fnX, fnY) => {
    if(getD3Version() === '3'){
        return chataD3.svg.line()
		.x(fnX)
		.y(fnY)
		.interpolate("linear");
    }else{
        return chataD3.line()
        .x(fnX)
        .y(fnY)
    }
}

const getArc = (iRadius, oRadius) => {
    if(getD3Version() === '3'){
        return chataD3.svg.arc()
        .innerRadius(iRadius)
        .outerRadius(oRadius)
    }else{
        return chataD3.arc()
        .innerRadius(iRadius)
        .outerRadius(oRadius)
    }
}

const getPie = (fn) => {
    if(getD3Version() === '3'){
        return chataD3.layout.pie().value(fn);
    }else{
        return chataD3.pie()
        .value(fn)
    }
}

const getArea = (xFn, y0Fn, y1Fn) => {
    if(getD3Version() === '3'){
        return chataD3.svg.area()
        .x(xFn)
        .y0(y0Fn)
        .y1(y1Fn)
    }else{
        return chataD3.area()
        .x(xFn)
        .y0(y0Fn)
        .y1(y1Fn)
    }
}

const getLegend = (scale, legendWrapLength, orient) => {
    if(getD3Version() === '3'){
        return chataD3.legend.color()
        .shape(
            'path',
            chataD3.svg.symbol().
            type("circle")
            .size(75)()
        )
        .orient(orient)
        .shapePadding(5)
        .scale(scale);
    }else{
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
}

const getStackedAreaData = (visibleGroups, data) => {
    if(getD3Version() === '3'){
        return chataD3.layout.stack()(visibleGroups.map((group) => {
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
}

const getStackedData = (visibleGroups, data) => {
    if(getD3Version() === '3'){
        return chataD3.layout.stack()(visibleGroups.map((group) => {
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
        return chataD3.stack()
        .keys(visibleGroups)
        (data)
    }
}
