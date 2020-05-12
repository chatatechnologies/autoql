const makeGroups = (json, options, seriesIndexes=[], labelIndex=-1) => {
    var groupables = getGroupableFields(json);
    var data = json['data']['rows'];
    var columns = json['data']['columns'];

    var seriesData = [];
    // console.log(groupable.length);
    // console.log(colu.length);
    if(groupables.length === 1 && columns.length === 2){
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
                        group: formatColumnName(columns[group.indexCol].name),
                        index: i
                    }
                ]
            }
            seriesData.push(serie);
        }
    }else{
        seriesData = groupByIndex(data, columns, 0, [1,2]);
        console.log(seriesData);
    }

    return seriesData;
}

const getObjectValues = (item, columns, seriesIndexes) => {
    var values = []
    for (var i = 0; i < seriesIndexes.length; i++) {
        var obj = {};
        obj['value'] = item[seriesIndexes[i]];
        obj['index'] = seriesIndexes[i];
        obj['group'] = formatColumnName(columns[seriesIndexes[i]]['name']);
        values.push(obj);
    }
    return values;
}

const groupByIndex = (items, columns, labelIndex, seriesIndexes) => {

    obj = {};
    items.forEach((item) => {
        const key = item[labelIndex];
        if (!obj[key]) {
            obj[key] = getObjectValues(item, columns, seriesIndexes);
        }
    });
    return convertoTo2DChartData(obj);
}

const convertoTo2DChartData = (groupedData) => {
    var output = []
    for(var [key, value] of Object.entries(groupedData)){
        output.push({
            label: key,
            values: groupedData[key]
        })
    }
    return output;
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

const groupBy = (items, key) => items.reduce(
    (result, item) => ({
        ...result,
        [item[key]]: [
            ...(result[item[key]] || []),
            item,
        ],
    }),
    {},
);
