import { formatChartLabel } from 'autoql-fe-utils'

export function AxisBottom(options) {
  const {
    rotateLabels,
    svg,
    domainSize,
    column,
    axis,
    dataFormatting,
  } = options;

  const axisElement = svg.append("g")
    .attr("transform", `translate(0,${domainSize})`)
    .call(axis.tickFormat(function(d){
      return formatChartLabel({
        d,
        column,
        dataFormatting,
      }).formattedLabel;
    }))

  if(rotateLabels) {
    axisElement
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end")
  }else{
    axisElement
    .selectAll("text")
    .style("text-anchor", "center")
  }
}