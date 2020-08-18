const SCALE_LINEAR = d3.scaleLinear || d3.scale.linear;
const SCALE_BAND = d3.scaleBand || d3.scale.ordinal;
const MAJOR_D3_VERSION = d3.version.split('.')[0];


const getAxisBottom = (scale) => {
    let axis;

    if('function' === typeof d3.axisBottom){
        axis = d3.axisLeft(scale);
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
