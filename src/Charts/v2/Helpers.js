import {
  formatChartData
} from '../../Utils'
import { max } from "d3-array";

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

export const dummyElement = (text) => {
  const div = document.createElement('div')
  div.style.display = 'inline-block';
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.fontSize = '14px';
  div.style.fontFamily = 'sans-serif';
  div.innerHTML = text;
  document.body.appendChild(div);
  return div;
}

export const getTextWidth = (text) =>  {
  const div = dummyElement(text);
  const width = div.clientWidth;
  document.body.removeChild(div);
  return width;
}

export const getLabelMaxSize = (labels) => {
  var longestLabel = labels.reduce((a, b) => {
    return a.length > b.length ? a : b;
  });

  return getTextWidth(longestLabel);
}