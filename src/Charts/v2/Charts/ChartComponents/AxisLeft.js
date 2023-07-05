import { formatChartData } from '../../../../Utils';

export function AxisLeft(widgetOptions, options) {
  const {
    svg,
    axis,
    tickSize,
    col,
    scale,
  } = options;

  svg.append("g")
  .attr("class", "autoql-vanilla-axes-grid")
  .call(
    axis
      .tickSize(-tickSize)
      .tickFormat(function(d){
          return formatChartData(d, col, widgetOptions)}
      )
  )
}