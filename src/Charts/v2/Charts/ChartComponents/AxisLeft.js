import { formatChartData } from '../../../../Utils';

export function AxisLeft(widgetOptions, options) {
  const {
    svg,
    axis,
    tickSize,
    cols,
    index,
  } = options;

  svg.append("g")
  .attr("class", "autoql-vanilla-axes-grid")
  .call(
    axis
      .tickSize(-tickSize)
      .tickFormat(function(d){
          return formatChartData(d, cols[index], widgetOptions)}
      )
  )
}