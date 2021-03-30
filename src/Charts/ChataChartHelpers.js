import { min, max } from 'd3-array'
import {
    cloneObject,
    formatColumnName,
    getGroupableField,
    getNotGroupableField,
    formatData
} from '../Utils'
import {
    ChataUtils
} from '../ChataUtils'

export const makeGroups = (json, options, seriesCols=[], labelIndex=-1) => {
    var groupables = getGroupableFields(json);
    var data = json['data']['rows'];
    var columns = enumerateCols(json);
    var multiSeriesCol = isMultiSeries(columns)
    console.log(multiSeriesCol);
    var seriesIndexes = []
    seriesCols.map((col) => {
        seriesIndexes.push(col.index);
    })
    var seriesData = [];
    if(groupables.length === 1){
        var group = getGroupableField(json);
        var value = getNotGroupableField(json);
        for (var i = 0; i < data.length; i++) {
            let label = data[i][group.indexCol];
            if(!label || label == '')label = 'null';
            var colName = columns[group.indexCol].display_name ||
            columns[group.indexCol].name;
            var serie = {
                label: label,
                values: [
                    {
                        value: parseFloat(data[i][value.indexCol]),
                        group: formatColumnName(colName),
                        index: value.indexCol,
                        isVisible: true,
                    }
                ]
            }
            seriesData.push(serie);
        }
    }else if(multiSeriesCol || groupables.length === 2){
        if(groupables.length === 2){
            let colIndex = labelIndex === 0 ? 1 : 0
            multiSeriesCol = columns[colIndex]
        }
        seriesData = groupByValue(
            data, columns, labelIndex, seriesIndexes, multiSeriesCol
        )
        console.log(seriesIndexes);
        console.log(seriesData);
    }else{
        seriesData = groupByIndex(data, columns, labelIndex, seriesIndexes)
    }
    return seriesData
}

export const toggleSerie = (data, serie) => {
    for (var i = 0; i < data.length; i++) {
        for (var x = 0; x < data[i].values.length; x++) {
            var value = data[i].values[x];
            if(value.group === serie)value.isVisible = !value.isVisible;
        }
    }

    return data;
}

export const getVisibleSeries = (_data) => {
    var visibleData = [];
    const data = cloneObject(_data);
    for (var i = 0; i < data.length; i++) {
        var line = data[i];
        var newLine = {
            label: line.label
        };
        var visibleSeries = [];
        for (var x = 0; x < line.values.length; x++) {
            if(line.values[x].isVisible)visibleSeries.push(line.values[x]);
        }
        newLine['values'] = visibleSeries;
        visibleData.push(newLine)
    }
    return visibleData
}

export const getVisibleGroups = (groups) => {
    var visibleGroups = [];
    for(var [key] of Object.entries(groups)){
        if(groups[key].isVisible)visibleGroups.push(key)
    }

    return visibleGroups
}

export const getPieGroups = (groups) => {
    var visibleGroups = []
    var index = 0
    for(var [key] of Object.entries(groups)){
        if(groups[key].isVisible){
            visibleGroups.push({
                key: key,
                index: index
            })
        }
        index++;
    }

    return visibleGroups
}

export const getSeriesValues = (
    item, series, seriesIndexes, labelIndex, items, key, multiSeriesCol
) => {
    var values = []
    for (var i = 0; i < series.length; i++) {
        var obj = {}
        var serieName = series[i]
        obj['value'] = sumMultiSeries(
            items, labelIndex, key, seriesIndexes[0], multiSeriesCol.index,
            serieName
        );
        obj['index'] = i;
        obj['group'] = serieName;
        obj['isVisible'] = true;

        values.push(obj);
    }

    return values
}

export const getObjectValues = (
    item, columns, seriesIndexes, labelIndex, items, key) => {
    var values = []
    for (var i = 0; i < seriesIndexes.length; i++) {
        var obj = {};
        var colName = columns[seriesIndexes[i]]['display_name'] ||
        columns[seriesIndexes[i]]['name'];

        obj['value'] = sumEquals(items, labelIndex, key, seriesIndexes[i]);
        obj['index'] = i;
        obj['group'] = formatColumnName(colName);
        obj['isVisible'] = true;

        values.push(obj);

    }
    return values;
}

export const groupByValue = (
    items, columns, labelIndex, seriesIndexes, multiSeriesCol
) => {
    var obj = {}
    var series = ChataUtils.getUniqueValues(
        items, row => row[multiSeriesCol.index]
    )
    items.forEach((item) => {
        const key = item[labelIndex];
        if (!obj[key]) {
            obj[key] = getSeriesValues(
                item,
                series,
                seriesIndexes,
                labelIndex,
                items,
                key,
                multiSeriesCol
            );
        }

    });

    return convertoTo2DChartData(obj);
}

export const groupByIndex = (items, columns, labelIndex, seriesIndexes) => {
    var obj = {};
    items.forEach((item) => {
        const key = item[labelIndex];
        if (!obj[key]) {
            obj[key] = getObjectValues(
                item,
                columns,
                seriesIndexes,
                labelIndex,
                items,
                key
            );
        }
    });
    return convertoTo2DChartData(obj);
}

export const sumMultiSeries = (
    items, labelIndex, key, serieIndex, multiSerieIndex, multiSerieValue
) => {
    var sum = 0;
    items.forEach((item) => {
        const label = item[labelIndex]
        const serie = item[multiSerieIndex]

        console.log(label + '===' + key);
        console.log(serie + '===' + multiSerieValue);
        if(label === key && serie === multiSerieValue){
            sum += item[serieIndex];
        }
    })
    return sum;
}

export const sumEquals = (items, labelIndex, key, serieIndex) => {
    var sum = 0;
    items.forEach((item) => {
        const label = item[labelIndex];
        if(label === key){
            sum += item[serieIndex];
        }
    })
    return sum;
}

export const convertoTo2DChartData = (groupedData) => {
    var output = []
    for(var [key] of Object.entries(groupedData)){
        output.push({
            label: key,
            values: groupedData[key]
        })
    }
    return output;
}

export const enumerateCols = (json) => {
    var clone = cloneObject(json['data']['columns']);
    for (var i = 0; i < clone.length; i++) {
        clone[i].index = i;
    }

    return clone;
}

export const formatLabel = (label) => {
    if(!label)label = '';
    if(label === 'null')label = 'Untitled Category';
    if(label.toString().length < 20){
        return label.toString();
    }
    return label.toString().slice(0, 15) + ' ...';

}

export const getGroupableFields = (json) => {
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

export const responseToArrayObjects = (json, groups) => {
    var dataGrouped = [];
    var data = json['data']['rows'];
    var groupables = getGroupableFields(json);

    var groupableIndex2 = groupables[1].indexCol;

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

export const getMinAndMaxValues = (data) => {
    const maxValuesFromArrays = []
    const minValuesFromArrays = []

    for (var i = 0; i < data.length; i++) {
        var serieValues = data[i].values;
        maxValuesFromArrays.push(max(serieValues, s => s.value));
        minValuesFromArrays.push(min(serieValues, s => s.value));
    }
    let maxValue = max(maxValuesFromArrays);
    let minValue = min(minValuesFromArrays);
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

export const groupBy = (items, key) => items.reduce(
    (result, item) => ({
        ...result,
        [item[key]]: [
            ...(result[item[key]] || []),
            item,
        ],
    }),
    {},
);

export const getIndexesByType = (cols) => {
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

export const getMetadataElement = (component, isDataMessenger) => {
    if(isDataMessenger)return component.parentElement.parentElement
    else return component.parentElement.parentElement
}


export const getChartDimensions = (chatContainer, displayType) => {
    let chartWidth = 0
    let chartHeight = 0

    if (chatContainer) {
        chartWidth = chatContainer.clientWidth - 70
        chartHeight = 0.85 * chatContainer.clientHeight - 40
    }

    if (displayType === 'pie' && chartHeight > 330) {
        chartHeight = 330
    }

    return {
        width: chartWidth,
        heigth: chartHeight
    }
}

export const isMultiSeries = (cols) => {
    for (var i = 0; i < cols.length; i++) {
        if(cols[i].multi_series){
            return cols[i]
        }
    }

    return false
}

export function formatDataToHeatmap(json, options){
    var lines = json['data']['rows'];
    var values = [];
    var groupables = getGroupableFields(json);
    var notGroupableField = getNotGroupableField(json);
    var groupableIndex1 = groupables[0].indexCol;
    var groupableIndex2 = groupables[1].indexCol;
    var notGroupableIndex = notGroupableField.indexCol;

    var col1 = json['data']['columns'][groupableIndex1];
    var col2 = json['data']['columns'][groupableIndex2];

    for (var i = 0; i < lines.length; i++) {
        var data = lines[i];
        var row = {};
        row['labelY'] = formatData(data[groupableIndex1], col1, options);
        row['labelX'] = formatData(data[groupableIndex2], col2, options);
        row['unformatY'] = data[groupableIndex1];
        row['unformatX'] = data[groupableIndex2];
        var value = parseFloat(data[notGroupableIndex]);
        row['value'] = value;
        values.push(row);
    }
    return values;
}
