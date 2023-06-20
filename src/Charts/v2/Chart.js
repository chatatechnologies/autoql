import {
  enumerateCols,
  getIndexesByType,
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
    data,
    component,
    metadataComponent
  } = options
  const cols = enumerateCols(data);
  const indexList = getIndexesByType(cols);
  const numericSeries = [];
  const stringSeries = [];
  const groupableCount = getGroupableCount(json)
  let tooltipClass = groupableCount === 2 ? 'tooltip-3d' : 'tooltip-2d'
  
  if (indexList['STRING']) {
    stringSeries.push(...indexList['STRING'])
  }
  if (indexList['DATE']) {
    stringSeries.push(...indexList['DATE'])
  }
  if (indexList['DATE_STRING']) {
    stringSeries.push(...indexList['DATE_STRING'])
  }
    
  if (indexList['DOLLAR_AMT']) {
    numericSeries = indexList['DOLLAR_AMT'];
  } else if (indexList['QUANTITY']) {
    numericSeries = indexList['QUANTITY'];
  }else if (indexList['PERCENT']) {
    numericSeries = indexList['PERCENT'];
  }

  if(!metadataComponent.metadata){
    var dateCol = getFirstDateCol(cols)
    let i = dateCol !== -1 ? dateCol : stringSeries[0].index
    metadataComponent.metadata = {
      groupBy: {
        index: i,
        currentLi: 0,
      },
      series: numericSeries
    }
  }
}