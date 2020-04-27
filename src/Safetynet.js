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
    // onclick="runQuery(event, '${context}')"

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

    // var f = htmlToElement(`<div class="autoql-vanilla-chata-safety-net-container">
    //     <div class="autoql-vanilla-chata-safety-net-description">
    //         I need your help matching a term you used to the exact corresponding term in your database. Verify by selecting the correct term from the menu below:
    //     </div>
    //     <span>
    //         <div class="autoql-vanilla-chata-safety-net-query">
    //          <span>
    //             <span>sales by </span>
    //             <div class="autoql-vanilla-chata-safety-net-selector-container">
    //             <div class="autoql-vanilla-chata-safetynet-select" data-test="chata-select">first class</div>
    //         </div>
    //     </span>
    //     </div>
    //     <button class="autoql-vanilla-chata-safety-net-execute-btn">
    //         <span class="chata-icon autoql-vanilla-chata-execute-query-icon" data-test="chata-icon">
    //             <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    //                 <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
    //             </svg>
    //         </span>Run Query
    //     </button>
    //     </span>
    // </div>`);
    // responseContentContainer.appendChild(f);

    // <div class="chata-safety-net-query">
    //     <span>
    //         <span>show me </span>
    //         <div class="chata-safety-net-selector-container">
    //             <div class="chata-select chata-safetynet-select" data-test="chata-select">
    //                 carson
    //             </div>
    //         </div>
    //     </span>
    //     <span>
    //         <span>who created last bill</span>
    //     </span>
    // </div>
    return responseContentContainer;
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
            var select = document.createElement('select');
            select.classList.add('autoql-vanilla-chata-safetynet-select');
            select.style.width = '47px';
            div.classList.add('autoql-vanilla-chata-safety-net-selector-container');

            var suggestionList = suggestion['suggestionList'];
            for (var x = 0; x < suggestionList.length; x++) {
                var option = document.createElement('option');
                var textContent = suggestionList[x]['text'];
                if(suggestionList[x].value_label){
                    textContent += ` (${suggestionList[x].value_label})`;
                }
                option.setAttribute('value', suggestionList[x]['text']);
                option.textContent = textContent;
                select.appendChild(option);
            }
            var safetyDeleteButton = htmlToElement(safetyDeleteButtonHtml);
            safetyDeleteButton.onclick = function(event){
                deleteSuggestion(event);
            }
            select.onchange = (evt) => {
                console.log(evt.target.value);
                updateSelect(evt.target);
            }
            var o = document.createElement('option');
            o.setAttribute('value', suggestion['word']);
            o.textContent = suggestion['word'];
            select.appendChild(o);
            select.classList.add('safetynet-value');
            div.appendChild(select);
            div.appendChild(safetyDeleteButton);
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
