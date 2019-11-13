function createSafetynetContent(suggestionArray, context='ChatDrawer'){
    const message = `
    Before I can try to find your answer,
    I need your help understanding a term you used that I don't see in your data.
    Click the dropdown to view suggestions so I can ensure you get the right data!`;
    const safetyDeleteButtonHtml = `
        ${DELETE_ICON}
    `;
    const runQueryButtonHtml = `
    <button class="chata-safety-net-execute-btn">
        ${RUN_QUERY}
    Run Query</button>
    `
    // onclick="runQuery(event, '${context}')"
    const runQueryButton = htmlToElement(runQueryButtonHtml);
    runQueryButton.onclick = function(event){
        runQuery(event, context);
    }
    var responseContentContainer = document.createElement('div');
    responseContentContainer.classList.add('chata-response-content-container');
    responseContentContainer.innerHTML = `<span>${message}</span><br/><br/>`;
    for (var i = 0; i < suggestionArray.length; i++) {
        var suggestion = suggestionArray[i];
        console.log(suggestion);
        if(suggestion['type'] == 'word'){
            var span = document.createElement('span');
            span.textContent = ' ' + suggestion['word'] + ' ';
            span.classList.add('safetynet-value');
            responseContentContainer.append(span);
        }else{
            var div = document.createElement('div');
            var select = document.createElement('select');
            select.classList.add('chata-safetynet-select');
            select.style.width = '47px';
            div.classList.add('chata-safety-net-selector-container');

            var suggestionList = suggestion['suggestionList'];
            for (var x = 0; x < suggestionList.length; x++) {
                var option = document.createElement('option');
                option.setAttribute('value', suggestionList[x]['text']);
                option.textContent = suggestionList[x]['text'];
                select.appendChild(option);
            }
            var safetyDeleteButton = htmlToElement(safetyDeleteButtonHtml);
            safetyDeleteButton.onclick = function(event){
                deleteSuggestion(event);
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
    responseContentContainer.appendChild(runQueryButton);
    return responseContentContainer;
}


function createSuggestionArray(jsonResponse){
    var fullSuggestion = jsonResponse['full_suggestion'];
    var query = jsonResponse['query'];
    var words = query.split(' ');
    var suggestionArray = [];
    for (var i = 0; i < words.length; i++) {
        var w = words[i];
        var hasSuggestion = false;
        for (var x = 0; x < fullSuggestion.length; x++) {
            var start = fullSuggestion[x]['start'];
            var end = fullSuggestion[x]['end'];
            var word = query.slice(start, end);
            if(word == w){
                suggestionArray.push({
                    word: word,
                    type: 'suggestion',
                    suggestionList: fullSuggestion[x]['suggestion_list']
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
