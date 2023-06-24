import {
  shouldRotateLabels,
  getTickValues,
  getLegendGroups,
} from './Helpers'
import {
  enumerateCols,
  getIndexesByType,
  getMinAndMaxValues,
  makeGroups,
  getMetadataElement,
} from '../ChataChartHelpers'
import {
  getFirstDateCol,
  getGroupableCount,
  formatColumnName,
  getChartColorVars,
} from '../../Utils'
import {
  ColumnChart
} from './Charts'

export function Chart(widgetOptions, options) {
  const {
    displayType,
    json,
    component,
  } = options
  const width = component.offsetWidth;
  const height = component.offsetHeight;
  console.log(width);
  const cols = enumerateCols(json);
  const indexList = getIndexesByType(cols);
  const numericSeries = [];
  const stringSeries = [];
  const groupableCount = getGroupableCount(json);
  const chartColors = getChartColorVars();
  const metadataComponent = getMetadataElement(component);
  const tooltipClass = groupableCount === 2 ? 'tooltip-3d' : 'tooltip-2d'

  if (indexList['STRING']) {
    stringSeries.push(...indexList['STRING']);
  }
  if (indexList['DATE']) {
    stringSeries.push(...indexList['DATE']);
  }
  if (indexList['DATE_STRING']) {
    stringSeries.push(...indexList['DATE_STRING']);
  }

  if (indexList['DOLLAR_AMT']) {
    numericSeries.push(...indexList['DOLLAR_AMT']);
  }
  if (indexList['QUANTITY']) {
    numericSeries.push(...indexList['QUANTITY']);
  }
  if (indexList['PERCENT']) {
    numericSeries.push(...indexList['PERCENT']);
  }

  if(!metadataComponent.metadata){
    var dateCol = getFirstDateCol(cols);
    let i = dateCol !== -1 ? dateCol : stringSeries[0].index
    metadataComponent.metadata = {
      groupBy: {
        index: i,
        currentLi: 0,
      },
      series: numericSeries
    }
  }

  const groupBy = metadataComponent.metadata.groupBy.index;
  const activeSeries = metadataComponent.metadata.series;
  const groupedData = makeGroups(
    json,
    widgetOptions,
    activeSeries,
    cols[groupBy].index
  );
  const minMaxValues = getMinAndMaxValues(groupedData);
  const serieIndex = activeSeries[0].index;
  const groupIndex = cols[groupBy].index;

  const serieName = cols[serieIndex]['display_name'] || cols[serieIndex]['name'];
  const groupName = cols[groupIndex]['display_name'] || cols[groupIndex]['name'];

  const serieColName = formatColumnName(serieName);
  const groupColName = formatColumnName(groupName);

  const rotateLabels = shouldRotateLabels(width, groupedData.length);
  const tickValues = getTickValues(width, groupedData);
  const labelsNames = groupedData.map(function(d) { return d.label; });
  const groupNames = groupedData[0].values.map(function(d) { return d.group; });
  const groupableIndex = groupIndex === 0 ? 1 : 0;
  const legendGroups = getLegendGroups(
    groupNames, groupIndex, cols, widgetOptions
  );

  if(displayType === 'column_chart') {
    ColumnChart(widgetOptions, {
      ...options,
      data: groupedData,
      width,
      height,
      cols,
      indexList,
      serieIndex,
      groupIndex,
      numericSeries,
      chartColors,
      stringSeries,
      minMaxValues,
      serieColName,
      groupColName,
      rotateLabels,
      tickValues,
      labelsNames,
      groupNames,
      groupableIndex,
      legendGroups,
      component,
      metadataComponent,
      tooltipClass,
    });
  }
}
