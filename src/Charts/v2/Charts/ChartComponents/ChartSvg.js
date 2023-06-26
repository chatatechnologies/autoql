import { select } from 'd3-selection'
import { CHART_MARGINS } from '../../../../Constants'

export function ChartSvg(options) {
  const {
    component,
    width,
    height,
    textWidthLeft,
  } = options;

  const left = textWidthLeft + CHART_MARGINS.left;
  const top = CHART_MARGINS.top;

  const svg = select(component)
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform",`translate(${left}, ${top})`);

  return svg
}