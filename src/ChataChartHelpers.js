const makeGroups = (json, options, seriesCols=[], labelIndex=-1) => {
    var groupables = getGroupableFields(json);
    var data = json['data']['rows'];
    var columns = json['data']['columns'];
    var seriesIndexes = []
    seriesCols.map((col) => {
        seriesIndexes.push(col.index);
    })
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
            var colName = columns[group.indexCol].display_name ||
            columns[group.indexCol].name;
            var serie = {
                label: label,
                values: [
                    {
                        value: parseFloat(data[i][value.indexCol]),
                        group: formatColumnName(colName),
                        index: value.indexCol
                    }
                ]
            }
            seriesData.push(serie);
        }
    }else{
        seriesData = groupByIndex(data, columns, labelIndex, seriesIndexes);
    }

    return seriesData;
}

const getObjectValues = (item, columns, seriesIndexes) => {
    var values = []
    for (var i = 0; i < seriesIndexes.length; i++) {
        var obj = {};
        var colName = columns[seriesIndexes[i]]['display_name'] ||
        columns[seriesIndexes[i]]['name'];

        obj['value'] = item[seriesIndexes[i]];
        obj['index'] = i;
        obj['group'] = formatColumnName(colName);
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

const enumerateCols = (json) => {
    var clone = cloneObject(json['data']['columns']);
    for (var i = 0; i < clone.length; i++) {
        clone[i].index = i;
    }

    return clone;
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

const responseToArrayObjects = (json, groups) => {
    var dataGrouped = [];
    var data = json['data']['rows'];
    var groupables = getGroupableFields(json);
    var notGroupableField = getNotGroupableField(json);

    var groupableIndex1 = groupables[0].indexCol;
    var groupableIndex2 = groupables[1].indexCol;
    var notGroupableIndex = notGroupableField.indexCol;

    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        dataGrouped.push({key: group, values: []});
        for (var x = 0; x < data.length; x++) {
            if(data[x][groupableIndex2] == group){
                dataGrouped[i].values.push(
                    data[x]
                )
            }
        }
    }

    return dataGrouped;
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
    if (maxValue === minValue) {
        if (minValue > 0) {
            minValue = 0
        } else if (minValue < 0) {
            maxValue = 0
        }
    }
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

const getIndexesByType = (cols) => {
    var output = {};
    for (var i = 0; i < cols.length; i++) {
        var col = cols[i];
        if(!output[col.type]){
            output[col.type] = [
                {col: col, index: i}
            ]
        }else{
            output[col.type].push({
                col: col,
                index: i
            })
        }
    }

    return output;
}

const getMetadataElement = (component, isDataMessenger) => {
    return component.parentElement.parentElement
}
