export const getBarWidth = (size, data) => {
  return size / data.length;
}

export const shouldRotateLabels = (size, data) => {
  const barSize = getBarSize(size, data);
  return barSize < 135;
}

export const getTickValues = (size, data) => {
  const barSize = size / data.length;
  const tickValues = [];
  if (barSize < 16) {
    data.forEach((element, index) => {
      if (index % interval === 0) {
        tickValues.push(element.label);
      }
    });
  }
}