const makeGroups = (json, options, numericIndex=[], labelIndex=-1) => {
    var groupables = getGroupableFields(json);
    var data = json['data']['rows'];
    var seriesData = [];
    if(groupables.length == 1){
        var group = getGroupableField(json);
        var value = getNotGroupableField(json);
        for (var i = 0; i < data.length; i++) {
            let label = formatData(
                data[i][group.indexCol], group.jsonCol, options
            );

            var serie = {
                label: label,
                values: [
                    {
                        value: parseFloat(data[i][value.indexCol]),
                        group: '0',
                        index: i
                    }
                ]
            }
            seriesData.push(serie);
        }
    }

    return seriesData;
}

const getLabel = (label) => {
    if(label.length < 18){
        return label;
    }
    return label.slice(0, 18);
}

const getGroupableFields = (json) => {
    var groupables = []
    for (var i = 0; i < json['data']['columns'].length; i++) {
        var r = {
            indexCol: -1,
            jsonCol: {},
            name: ''
        }
        if(json['data']['columns'][i]['groupable']){
            r['indexCol'] = i;
            r['jsonCol'] = json['data']['columns'][i];
            r['name'] = json['data']['columns'][i]['name'];
            groupables.push(r);
        }
    }

    return groupables;
}

const getMinAndMaxValues = (data) => {
    const maxValuesFromArrays = []
    const minValuesFromArrays = []

    for (var i = 0; i < data.length; i++) {
        var serieValues = data[i].values;
        maxValuesFromArrays.push(d3.max(serieValues, s => s.value));
        minValuesFromArrays.push(d3.min(serieValues, s => s.value));
    }
    let maxValue = d3.max(maxValuesFromArrays);
    let minValue = d3.min(minValuesFromArrays);

    return {
        min: minValue,
        max: maxValue
    }
}

// const getMinAndMaxValues = data => {
//     console.log(data.length);
//     try {
//         const numSeries = getNumberOfSeries(data)
//         console.log(numSeries);
//         const maxValuesFromArrays = []
//         const minValuesFromArrays = []
//
//         for (let i = 0; i < numSeries; i++) {
//             maxValuesFromArrays.push(d3.max(data, d => Math.max(...d.label.values)))
//             minValuesFromArrays.push(d3.min(data, d => Math.min(...d.label.values)))
//         }
//
//         let maxValue = d3.max(maxValuesFromArrays)
//         let minValue = d3.min(minValuesFromArrays)
//
//         // In order to see the chart elements we need to make sure
//         // that the max and min values are different.
//         if (maxValue === minValue) {
//             if (minValue > 0) {
//                 minValue = 0
//             } else if (maxValue < 0) {
//                 maxValue = 0
//             }
//         }
//
//         return {
//             minValue: minValue,
//             maxValue: maxValue
//         }
//     } catch (error) {
//         console.error(error)
//         return { minValue: 0, maxValue: 0 }
//     }
// }
