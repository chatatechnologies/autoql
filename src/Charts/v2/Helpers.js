import {
  formatChartData
} from '../../Utils'

export const getBarSize = (size, length) => {
  return size / length;
}

export const shouldRotateLabels = (size, length) => {
  const barSize = getBarSize(size, length);
  return barSize < 135;
}

export const getTickValues = (size, data) => {
  const barSize = getBarSize(size, data.length);
  const interval = Math.ceil((data.length * 16) / size);

  const tickValues = [];
  if (barSize < 16) {
    data.forEach((element, index) => {
      if (index % interval === 0) {
        tickValues.push(element.label);
      }
    });
  }

  return tickValues;
}

export const getLegendGroups = (groupNames, groupIndex, cols, options) => {
  const legendGroups = {}  
  groupNames.forEach((group) => {
    legendGroups[
        formatChartData(group, cols[groupIndex], options)
    ] = {
        value: group
    }
  })

  return legendGroups;
}