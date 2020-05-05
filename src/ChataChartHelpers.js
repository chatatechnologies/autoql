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
