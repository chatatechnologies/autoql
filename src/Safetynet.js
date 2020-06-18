function createSafetynetContent(suggestionArray, context){
    const message = `
    I need your help matching a term you used to the exact corresponding
    term in your database. Verify by selecting the correct
    term from the menu below:`;

    const runQueryButtonHtml = `
    <button class="autoql-vanilla-chata-safety-net-execute-btn">
        <span class="chata-icon autoql-vanilla-chata-execute-query-icon">
            ${RUN_QUERY}
        </span>
    Run Query</button>
    `;

    const runQueryButton = htmlToElement(runQueryButtonHtml);
    runQueryButton.onclick = function(event){
        runQuery(event, context);
    }
    var responseContentContainer = document.createElement('div');
    var safetyNetContainer = document.createElement('div');
    var safetynetQuery = document.createElement('div');
    safetynetQuery.classList.add('autoql-vanilla-chata-safety-net-query');
    responseContentContainer.classList.add('chata-response-content-container');
    safetyNetContainer.classList.add(
        'autoql-vanilla-chata-safety-net-container'
    );
    safetyNetContainer.innerHTML = `
        <div class="autoql-vanilla-chata-safety-net-description">
            ${message}
        </div>
    `;
    safetyNetContainer.appendChild(safetynetQuery);
    createSafetynetBody(safetynetQuery, suggestionArray);
    safetyNetContainer.appendChild(runQueryButton);
    responseContentContainer.appendChild(safetyNetContainer);
    return responseContentContainer;
}

function SafetynetSelector(suggestionList, position, parent){
    var wrapper = document.createElement('div');
    var ul = document.createElement('ul');
    var widthList = [];
    const list = suggestionList['suggestionList'];
    wrapper.classList.add('autoql-vanilla-safetynet-selector');
    parent.appendChild(wrapper);
    wrapper.show = () => {
        wrapper.style.visibility = 'visible';
        wrapper.style.opacity = '1';
        wrapper.isOpen = true;
    }

    wrapper.hide = () => {
        wrapper.style.visibility = 'hide';
        wrapper.style.opacity = '0';
        parent.removeChild(wrapper);
    }

    list.map(el => {
        var li = document.createElement('li');
        li.classList.add('autoql-vanilla-safetynet-item')
        var textContent = el['text'];
        const div = document.createElement('div')
        div.style.display = 'inline-block';
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';

        if(el.value_label){
            textContent += ` (${el.value_label})`;
        }
        li.setAttribute('data-satefynet-value', el['text']);
        li.innerHTML = textContent;
        div.innerHTML = textContent;
        document.body.appendChild(div);
        widthList.push(parseFloat(div.clientWidth)+45);
        document.body.removeChild(div);
        ul.appendChild(li);

        li.onclick = (evt) => {
            console.log(evt.target.dataset.satefynetValue);
        }
    })

    var width = Math.max.apply(null, widthList);
    wrapper.style.width =  width + 'px';
    wrapper.style.top = '20px';
    wrapper.style.left = -(width/2) + 'px';
    wrapper.appendChild(ul);

    return wrapper;
}

function createSafetynetBody(responseContentContainer, suggestionArray){
    const safetyDeleteButtonHtml = `
        ${DELETE_ICON}
    `;

    for (var i = 0; i < suggestionArray.length; i++) {
        var suggestion = suggestionArray[i];
        if(suggestion['type'] == 'word'){
            var span = document.createElement('span');
            span.textContent = ' ' + suggestion['word'] + ' ';
            span.classList.add('safetynet-value');
            responseContentContainer.append(span);
        }else{
            var div = document.createElement('div');
            var select = document.createElement('div');
            select.innerHTML = 'FOOO';
            select.classList.add('autoql-vanilla-chata-safetynet-select');
            div.classList.add('autoql-vanilla-chata-safety-net-selector-container');

            select.onclick = (evt) => {
                closeAllSafetynetSelectors();
                var selector = new SafetynetSelector(suggestion, {
                    left: evt.clientX,
                    top: evt.clientY,
                }, select);
                selector.show();
            }
            // var suggestionList = suggestion['suggestionList'];
            // for (var x = 0; x < suggestionList.length; x++) {
            //     var option = document.createElement('option');
            //     var textContent = suggestionList[x]['text'];
            //     if(suggestionList[x].value_label){
            //         textContent += ` (${suggestionList[x].value_label})`;
            //     }
            //     option.setAttribute('value', suggestionList[x]['text']);
            //     option.textContent = textContent;
            //     select.appendChild(option);
            // }
            // select.onchange = (evt) => {
            //     console.log(evt.target.value);
            //     if(evt.target.value === 'delete'){
            //         evt.target.parentElement.parentElement.removeChild(
            //             evt.target.parentElement
            //         )
            //     }
            //     updateSelect(evt.target);
            // }
            // var o = document.createElement('option');
            // var deleteOption = document.createElement('option');
            // o.setAttribute('value', suggestion['word'] + '(Original term)');
            // deleteOption.setAttribute('value', 'delete');
            // o.textContent = suggestion['word'];
            // deleteOption.textContent = 'Remove term';
            // deleteOption.style.color = '#d84830';
            // select.appendChild(o);
            // select.appendChild(deleteOption);
            // select.classList.add('safetynet-value');
            div.appendChild(select);
            responseContentContainer.appendChild(div);
        }
    }
}

function createSuggestionArray(jsonResponse){
    // {"reference_id": "1.1.240", "data": {"text": "foo bar", "replacements": [{"start": 0, "end": 7, "suggestions": [{"text": "chinese elecronics for weigh bar", "value_label": "Part"}, {"text": "domestic electronics for weigh bar", "value_label": "Part"}]}]}, "message": "Success"}
    // {"full_suggestion": [{"end": 3, "suggestion_list": [{"text": "for"}], "start": 0}], "query": "foo bar"}

    var fullSuggestion = jsonResponse['full_suggestion']
    || jsonResponse['data']['replacements'];
    var query = jsonResponse['query'] || jsonResponse['data']['text'];
    var words = [];
    var start = fullSuggestion[0]['start'];
    var end = fullSuggestion[0]['end'];
    if(end == query.length && start == 0){
        words.push(query);
    }else{
        words = query.split(' ');
    }
    var suggestionArray = [];
    for (var i = 0; i < words.length; i++) {
        var w = words[i];
        var hasSuggestion = false;
        for (var x = 0; x < fullSuggestion.length; x++) {
            var start = fullSuggestion[x]['start'];
            var end = fullSuggestion[x]['end'];
            var word = query.slice(start, end);
            if(word == w){
                let suggestions = fullSuggestion[x]['suggestion_list']
                || fullSuggestion[x]['suggestions'];
                suggestionArray.push({
                    word: word,
                    type: 'suggestion',
                    suggestionList: suggestions
                })
                hasSuggestion = true;
                break;
            }
        }
        if(!hasSuggestion){
            suggestionArray.push({
                'word': w,
                'type': 'word',
                suggestionList: []
            });
        }
    }
    return suggestionArray;
}

function getTextWidth(text, font) {
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

function updateSelectWidth(container){
    var selects = document.querySelectorAll('.chata-safetynet-select');
    for (var i = 0; i < selects.length; i++) {
        updateSelect(selects[i]);
    }
}

function updateSelect(elem){
    const suggestionDiv = document.createElement('div')
    const stringValue = elem.options[elem.selectedIndex].textContent;
    suggestionDiv.innerHTML = stringValue;
    suggestionDiv.style.display = 'inline-block'
    suggestionDiv.style.position = 'absolute'
    suggestionDiv.style.visibility = 'hidden'
    document.body.appendChild(suggestionDiv)
    // const selectWidth = suggestionDiv.clientWidth + 36
    // var styles = window.getComputedStyle(elem);
    // var size = styles.getPropertyValue('font-size');
    // var family = styles.getPropertyValue('font-family');
    // var weight = styles.getPropertyValue('font-weight');
    // var width = getTextWidth(
    //     elem.value, `${weight} ${size} ${family}`
    // );
    // console.log(width);
    elem.style.width = (suggestionDiv.clientWidth + 36) + 'px';
}
