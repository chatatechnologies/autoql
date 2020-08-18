const SCALE_LINEAR = d3.scaleLinear || d3.scale.linear;
const SCALE_BAND = d3.scaleBand || d3.scale.ordinal;
const MAJOR_D3_VERSION = d3.version.split('.')[0];


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
    if(MAJOR_D3_VERSION === '3'){
        return scale.rangeBand()
    }else{
        return scale.bandwidth()
    }
}


const setDomainRange = (
    scale, domainValues, r1, r2, nice=false, padding=0) => {
    if(MAJOR_D3_VERSION === '3'){
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
    if(MAJOR_D3_VERSION === '3'){
        return d3.scale.ordinal().domain(domainValues)
        .range(range);
    }else{
        return d3.scaleOrdinal()
        .domain(domainValues)
        .range(range);
    }
}
