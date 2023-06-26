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
  formatChartData,
  formatData
} from '../../../Utils';
import {
  formatLabel,
  getVisibleSeries,
} from '../../ChataChartHelpers';
import {
  getTextDimensions,
  getLabelMaxSize
} from '../Helpers'
import { ChartSvg } from './ChartSvg';
import { tooltipCharts } from '../../../Tooltips'

export function ColumnChart(widgetOptions, options) {
  const {
    data,
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
    groupableCount,
    valueClass,
    tooltipClass,
  } = options

  component.innerHTML = '';

  const { textWidth } = getTextDimensions(
    formatChartData(minMaxValues.max, cols[groupIndex], widgetOptions)
  )
  const dimensions = getLabelMaxSize(labelsNames)
  const chartWidth = (width - (textWidth + CHART_MARGINS.left));
  const x0 = SCALE_BAND();
  const x1 = SCALE_BAND();
  const y = SCALE_LINEAR();

  setDomainRange(x0, labelsNames, 0, chartWidth, false, .1)
  const x1Range = minMaxValues.max === 0 ? 0 : getBandWidth(x0)
  setDomainRange(x1, groupNames, 0, x1Range, false, .1)
  const domainSize = height - (
    (dimensions.textWidth / 2) + CHART_MARGINS.bottom + CHART_MARGINS.top + CHART_MARGINS.bottomLabelChart
    )
  y.range([ domainSize, 0 ])
  .domain([minMaxValues.min, minMaxValues.max]).nice()

  const xAxis = getAxisBottom(x0)
  const yAxis = getAxisLeft(y)

  const colorScale = getColorScale(
      groupNames,
      chartColors
  );

  const svg = new ChartSvg({
    width,
    height,
    component,
    textWidthLeft: textWidth
  })
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
      .attr("transform", `translate(0,${domainSize})`)
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
      .attr("transform", `translate(0,${domainSize})`)
      .call(xAxis.tickFormat(function(d){
          let fLabel = formatChartData(d, cols[groupIndex], widgetOptions);
          if(fLabel === 'Invalid date')fLabel = 'Untitled Category'
          return formatLabel(fLabel);
      }))
      .selectAll("text")
      .style("text-anchor", "center")
  }
  
  const calculateHeight = (d) => {
    if(minMaxValues.min < 0){
        return Math.abs(y(d.value) - y(0));
    }else{
        return domainSize - y(d.value);
    }
  }

  var slice = undefined;

  function createBars(){
    var rectIndex = 0;
    var cloneData = getVisibleSeries(data);
    console.log(cloneData);
    if(slice)slice.remove();
    slice = svg.select('.autoql-vanilla-axes-grid').selectAll(".autoql-vanilla-chart-bar")
    .remove()
    .data(cloneData)
    .enter().insert("g", ":first-child")
    .attr("class", "g")
    .attr("transform",function(d) {
        return "translate(" + x0(d.label) + ",0)";
    });

    slice.selectAll("rect")
    .data(function(d) {
        for (var i = 0; i < d.values.length; i++) {
            d.values[i].label = d.label;
        }
        return d.values;
    })
    .enter().append("rect")
    .each(function (d) {
        console.log(d);
        if(groupableCount === 2){
            let index3 = groupIndex === 0 ? 1 : 0
            let colStr3 = cols[index3]['display_name']
            || cols[serieIndex]['name']
            let col3 = formatColumnName(colStr3);
            toolTipColValue1 = formatData(
                d.label, cols[groupIndex],
                widgetOptions
            )
            let unformatvalue1 = undefined
            let unformatvalue2 = undefined
            let unformatvalue3 = undefined

            if(index3 === 0){
                unformatvalue1 = d.group
                unformatvalue2 = d.label
            }else{
                unformatvalue1 = d.label
                unformatvalue2 = d.group
            }
            unformatvalue3 = d.value
            select(this).attr(valueClass, rectIndex)
            .attr('data-col1', groupColName)
            .attr('data-col2', serieColName)
            .attr('data-col3', col3)
            .attr('data-colvalue1', toolTipColValue1)
            .attr('data-colvalue2',formatData(
                d.value, cols[serieIndex],
                widgetOptions
            ))
            .attr('data-colvalue3', formatData(
                d.group, cols[index3],
                widgetOptions
            ))
            .attr('data-unformatvalue1', unformatvalue1)
            .attr('data-unformatvalue2', unformatvalue2)
            .attr('data-unformatvalue3', unformatvalue3)
            .attr('data-is-stacked-drill', '1')
        }else{
            var group = serieColName;
            if(groupNames.length > 1)group = d.group
            var toolTipColValue1 = d.label
            toolTipColValue1 = formatData(
                d.label, cols[groupIndex],
                widgetOptions
            )
            if(toolTipColValue1 === 'Invalid date')
            toolTipColValue1 = 'undefined'

            select(this).attr(valueClass, rectIndex)
            .attr('data-col1', groupColName)
            .attr('data-col2', group)
            .attr('data-colvalue1', toolTipColValue1)
            .attr('data-colvalue2', formatData(
                d.value, cols[serieIndex],
                widgetOptions
            ))
            .attr('data-filterindex', groupIndex)
        }
        rectIndex++
    })
    .attr("width", getBandWidth(x1))
    .attr("x", function(d) { return x1(d.group); })
    .style("fill", function(d) { return colorScale(d.group) })
    .attr('fill-opacity', '1')
    .attr('class', `${tooltipClass} autoql-vanilla-chart-bar`)
    .attr("y", function(d) { return y(Math.max(0, d.value)); })
    .attr("height", function(d) { return calculateHeight(d) })
    tooltipCharts();
  }

  select(window).on(
    "chata-resize." + component.dataset.componentid, () => {
      ColumnChart(widgetOptions, options);
    }
);

  createBars();
}
