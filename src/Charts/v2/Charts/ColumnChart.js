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
  getAxisLeft,
} from '../../d3-compatibility';
import {
  formatChartData
} from '../../../Utils';
import {
  formatLabel,
} from '../../ChataChartHelpers';
import {
  getTextDimensions,
  getLabelMaxSize
} from '../Helpers'

export function ColumnChart(widgetOptions, options) {
  const {
    width,
    height,
    labelsNames,
    minMaxValues,
    groupNames,
    chartColors,
    component,
    serieColName,
    groupColName,
    rotateLabels,
    tickValues,
    groupIndex,
    serieIndex,
    cols,
  } = options

  component.innerHTML = '';

  const { textWidth } = getTextDimensions(
    formatChartData(minMaxValues.max, cols[groupIndex], widgetOptions)
  )
  const dimensions = getLabelMaxSize(labelsNames)
  console.log(dimensions);
  const chartWidth = (width - (textWidth + CHART_MARGINS.left));
  const x0 = SCALE_BAND();
  const x1 = SCALE_BAND();
  const y = SCALE_LINEAR();

  setDomainRange(x0, labelsNames, 0, chartWidth, false, .1)
  const x1Range = minMaxValues.max === 0 ? 0 : getBandWidth(x0)
  setDomainRange(x1, groupNames, 0, x1Range, false, .1)

  y.range([ 312, 0 ])
  .domain([minMaxValues.min, minMaxValues.max]).nice()

  const xAxis = getAxisBottom(x0)
  const yAxis = getAxisLeft(y)

  const colorScale = getColorScale(
      groupNames,
      chartColors
  );

  const svg = select(component)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform",
    "translate(" +(textWidth + CHART_MARGINS.left) + "," + CHART_MARGINS.top + ")")

  const labelXContainer = svg.append('g');
  const labelYContainer = svg.append('g');

  const textContainerY = labelYContainer.append('text')
    .attr('x', -(height / 2) + (textWidth / 2))
    .attr('y', (-textWidth))
    .attr('transform', 'rotate(-90)')
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-y-axis-label')

  textContainerY.append('tspan')
  .text(serieColName);

  const textContainerX = labelXContainer.append('text')
    .attr('x', chartWidth / 2)
    .attr('y', height - CHART_MARGINS.bottom)
    .attr('text-anchor', 'middle')
    .attr('class', 'autoql-vanilla-x-axis-label')

  textContainerX.append('tspan')
    .text(groupColName);

  if(tickValues.length > 0){
    xAxis.tickValues(tickValues);
  }

  svg.append("g")
  .attr("class", "autoql-vanilla-axes-grid")
  .call(
      yAxis
      .tickSize(-width)
      .tickFormat(function(d){
          return formatChartData(d, cols[serieIndex], widgetOptions)}
      )
  )

  if(rotateLabels){
      svg.append("g")
      .attr("transform", `translate(${0},272)`)
      .call(xAxis.tickFormat(function(d){
          let fLabel = formatChartData(d, cols[groupIndex], widgetOptions);
          if(fLabel === 'Invalid date')fLabel = 'Untitled Category'
          return formatLabel(fLabel);
      }))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
  }else{
      svg.append("g")
      .attr("transform", `translate(${0},272)`)
      .call(xAxis.tickFormat(function(d){
          let fLabel = formatChartData(d, cols[groupIndex], widgetOptions);
          if(fLabel === 'Invalid date')fLabel = 'Untitled Category'
          return formatLabel(fLabel);
      }))
      .selectAll("text")
      .style("text-anchor", "center")
  }
}
