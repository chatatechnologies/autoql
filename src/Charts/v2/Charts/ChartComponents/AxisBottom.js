import { formatChartData } from '../../../../Utils';
import { formatLabel } from '../../../ChataChartHelpers';

export function AxisBottom(widgetOptions, options) {
  const {
    rotateLabels,
    svg,
    domainSize,
    cols,
    index,
    axis,
  } = options;

  const axisElement = svg.append("g")
    .attr("transform", `translate(0,${domainSize})`)
    .call(axis.tickFormat(function(d){
      let fLabel = formatChartData(d, cols[index], widgetOptions);
      if(fLabel === 'Invalid date')fLabel = 'Untitled Category'
      return formatLabel(fLabel);
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