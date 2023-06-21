import {
  CHART_MARGINS
} from '../../../Constants';
import {
  SCALE_BAND,
  SCALE_LINEAR,
  getBandWidth
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
  } = options

  const x0 = SCALE_BAND();
  const x1 = SCALE_BAND();
  const y = SCALE_LINEAR();

  setDomainRange(x0, labelsNames, 0, width, false, .1)
  const x1Range = minMaxValues.max === 0 ? 0 : getBandWidth(x0)
  setDomainRange(x1, groupNames, 0, x1Range, false, .1)

}