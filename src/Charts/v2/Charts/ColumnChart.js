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
import { ChartSvg } from './ChartComponents';
import { tooltipCharts } from '../../../Tooltips'
import { LabelAxis } from './ChartComponents/LabelAxis';
import { Chart } from '../Chart'

export function ColumnChart(widgetOptions, options) {
  const {
    data,
    width,
    height,
    cols,
    serieIndex,
    groupIndex,
    chartColors,
    minMaxValues,
    serieColName,
    groupColName,
    rotateLabels,
    tickValues,
    labelsNames,
    groupNames,
    groupableIndex,
    component,
    json,
    tooltipClass,
    groupableCount,
    valueClass,
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
  y.range([domainSize, 0])
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

  const labelAxisLeft = new LabelAxis({
    svg,
    type: 'LEFT',
    name: serieColName,
    x: -(height / 2) + (textWidth / 2),
    y: -textWidth
  })

  const labelAxisBottom = new LabelAxis({
    svg,
    type: 'BOTTOM',
    name: groupColName,
    x: chartWidth / 2,
    y: height - CHART_MARGINS.bottom
  })

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
        if(groupableCount === 2){
            let colStr3 = cols[groupableIndex]['display_name']
            || cols[serieIndex]['name']
            let col3 = formatColumnName(colStr3);
            toolTipColValue1 = formatData(
                d.label, cols[groupIndex],
                widgetOptions
            )
            let unformatvalue1 = undefined
            let unformatvalue2 = undefined
            let unformatvalue3 = undefined

            if(groupableIndex === 0){
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
                d.group, cols[groupableIndex],
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
      Chart(widgetOptions, {
        displayType: 'column_chart',
        json,
        component,
      });
    }
  );

  createBars();
}
