import { select } from 'd3-selection'
import {
  CHART_MARGINS
} from '../../../Constants';
import {
  SCALE_BAND,
  SCALE_LINEAR,
  getBandWidth,
  getColorScale,
  setDomainRange,
  getAxisBottom,
  getAxisLeft
} from '../../d3-compatibility';

export function ColumnChart(widgetOptions, options) {
  console.log(widgetOptions);
  console.log(options);
  const {
    width,
    height,
    labelsNames,
    minMaxValues,
    groupNames,
    chartColors,
    component,
  } = options

  const x0 = SCALE_BAND();
  const x1 = SCALE_BAND();
  const y = SCALE_LINEAR();

  setDomainRange(x0, labelsNames, 0, width, false, .1)
  const x1Range = minMaxValues.max === 0 ? 0 : getBandWidth(x0)
  setDomainRange(x1, groupNames, 0, x1Range, false, .1)

  y.range([ height - (CHART_MARGINS.bottom), 0 ])
  .domain([minMaxValues.min, minMaxValues.max]).nice()

  var xAxis = getAxisBottom(x0)
  var yAxis = getAxisLeft(y)

  var colorScale = getColorScale(
      groupNames,
      chartColors
  );

  var svg = select(component)
    .append("svg")
    .attr("width", width + CHART_MARGINS.left)
    .attr("height", height + CHART_MARGINS.top + CHART_MARGINS.bottom)
    .append("g")
    .attr("transform",
    "translate(" +(CHART_MARGINS.left) + "," + CHART_MARGINS.top + ")")

}