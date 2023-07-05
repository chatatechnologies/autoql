import { formatChartData } from '../../../../Utils';
import { formatChartLabel } from 'autoql-fe-utils';

export function AxisLeft(options) {
  const {
    svg,
    axis,
    tickSize,
    column,
    dataFormatting,
  } = options;

  svg.append("g")
  .attr("class", "autoql-vanilla-axes-grid")
  .call(
    axis
      .tickSize(-tickSize)
      .tickFormat(function(d){
          return formatChartLabel({
            d,
            column,
            dataFormatting,
          }).formattedLabel;
        }
      )
  )
}