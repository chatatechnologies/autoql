import { 
  shouldRotateLabels,
  getTickValues 
} from './Helpers'
import {
  enumerateCols,
  getIndexesByType,
  getMinAndMaxValues,
  makeGroups,
} from '../ChataChartHelpers'
import {
  getFirstDateCol,
  getGroupableCount,
} from '../../Uttils'
import { tooltipCharts } from '../Tooltips'
import { strings } from '../Strings'

export function Chart(widgetOptions, options) {
  const { 
    width,
    height,
    json,
    component,
    metadataComponent
  } = options
  const cols = enumerateCols(json);
  const indexList = getIndexesByType(cols);
  const numericSeries = [];
  const stringSeries = [];
  const groupableCount = getGroupableCount(json);
  let tooltipClass = groupableCount === 2 ? 'tooltip-3d' : 'tooltip-2d'
  
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
    numericSeries = indexList['DOLLAR_AMT'];
  } else if (indexList['QUANTITY']) {
    numericSeries = indexList['QUANTITY'];
  }else if (indexList['PERCENT']) {
    numericSeries = indexList['PERCENT'];
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
  const groupedData = makeGroups(json, options, activeSeries, cols[groupBy].index);
  const minMaxValues = getMinAndMaxValues(data);
  const index1 = activeSeries[0].index;
  const index2 = cols[groupBy].index;

  const serieName = cols[index1]['display_name'] || cols[index1]['name'];
  const groupName = cols[index2]['display_name'] || cols[index2]['name'];

  const serieColName = formatColumnName(serieName);
  const groupColName = formatColumnName(groupName);

  const rotateLabels = shouldRotateLabels(width, data);
  const tickValues = getTickValues(width, data)

}