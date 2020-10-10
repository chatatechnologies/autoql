import {
    closeAllSafetynetSelectors,
    htmlToElement,
    runQuery
} from '../Utils'
import { RUN_QUERY, DELETE_ICON, REMOVE_ELEMENT } from '../Svg'
import './Safetynet.css'

export function getRunQueryButton(){
    const runQueryButtonHtml = `
    <button class="autoql-vanilla-chata-safety-net-execute-btn">
        <span class="chata-icon autoql-vanilla-chata-execute-query-icon">
            ${RUN_QUERY}
        </span>
    Run Query</button>
    `

    const runQueryButton = htmlToElement(runQueryButtonHtml)

    return runQueryButton
}

export function createSafetynetContent(suggestionArray, context){
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

    const runQueryButton = getRunQueryButton();
    runQueryButton.onclick = function(event){
        closeAllSafetynetSelectors();
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
    var height = 0;
    const list = suggestionList['suggestionList'];
    const removeIcon = htmlToElement(`
        <span class="chata-icon">
            ${REMOVE_ELEMENT}
        </span>
    `);
    wrapper.classList.add('autoql-vanilla-safetynet-selector');
    document.body.appendChild(wrapper);
    wrapper.show = () => {
        wrapper.style.visibility = 'visible';
        wrapper.style.opacity = '1';
        wrapper.isOpen = true;
    }

    wrapper.hide = () => {
        wrapper.style.visibility = 'hide';
        wrapper.style.opacity = '0';
        document.body.removeChild(wrapper);
    }

    list.map(el => {
        var li = document.createElement('li');
        li.classList.add('autoql-vanilla-safetynet-item')
        var textContent = el['text'];
        if(el.value_label){
            textContent += ` (${el.value_label})`;
        }
        li.setAttribute('data-satefynet-value', el['text']);
        li.innerHTML = textContent;
        widthList.push(parseFloat(getTextWidth(textContent))+45);
        height += getTextHeight(textContent);
        ul.appendChild(li);

        li.onclick = (evt) => {
            parent.innerHTML = evt.target.dataset.satefynetValue;
        }
    })

    var li = document.createElement('li');
    li.classList.add('autoql-vanilla-safetynet-item');
    li.classList.add('remove-term');
    li.appendChild(removeIcon);
    li.appendChild(document.createTextNode('Remove term'))
    ul.appendChild(li);

    li.onclick = (evt) => {
        var topParent = parent.parentElement;
        topParent.removeChild(parent);
    }

    var width = 0;
    var parentWidth = getTextWidth(parent.textContent);
    if(widthList.length){
        width = Math.max.apply(null, widthList);
    }else{
        width = parentWidth + 95;
    }
    var offsetX = parseFloat(width + position.left);
    var top = (position.top + window.pageYOffset) + 'px';
    var left = (position.left - width/2);

    if((height + position.top + 95) > window.screen.height){
        var top = ((position.top + window.pageYOffset) - height - 45) + 'px';
    }

    if(left <= 0){
        left = 95;
    }

    if(left+width > window.screen.width){
        left = window.screen.width - width - 45;
    }

    wrapper.style.width =  width + 'px';
    wrapper.style.top = top;
    wrapper.style.left = left + 'px';

    wrapper.appendChild(ul);

    return wrapper;
}

export function createSafetynetBody(responseContentContainer, suggestionArray){
    const safetyDeleteButtonHtml = `
        ${DELETE_ICON}
    `;

    suggestionArray.map((suggestion) => {
        if(suggestion['type'] == 'word'){
            var span = document.createElement('span');
            span.textContent = ' ' + suggestion['word'] + ' ';
            span.classList.add('safetynet-value');
            responseContentContainer.append(span);
        }else{
            var div = document.createElement('div');
            var select = document.createElement('div');
            select.innerHTML = suggestion['suggestionList'][0]['text'];
            select.classList.add('autoql-vanilla-chata-safetynet-select');
            select.classList.add('safetynet-value');
            div.classList.add(
                'autoql-vanilla-chata-safety-net-selector-container'
            );
            select.onclick = (evt) => {
                closeAllSafetynetSelectors();
                var selector = new SafetynetSelector(suggestion, {
                    left: evt.clientX,
                    top: evt.clientY,
                }, select);
                selector.show();
            }
            div.appendChild(select);
            responseContentContainer.appendChild(div);
        }
    })
}

export function createSuggestionArray(jsonResponse){
    var fullSuggestion = jsonResponse['full_suggestion']
    || jsonResponse['data']['replacements'];
    var query = jsonResponse['query'] || jsonResponse['data']['text'];
    var words = [];
    var suggestionArray = [];
    let lastEndIndex = 0;

    fullSuggestion.map((suggestion, index) => {
        words.push(query.slice(lastEndIndex, suggestion.start))
        words.push(query.slice(suggestion.start, suggestion.end))

        if (index === fullSuggestion.length - 1) {
            var lastWord = query.slice(suggestion.end, query.length);
            if(lastWord != ''){
                words.push(lastWord);
            }
        }
        lastEndIndex = suggestion.end
    })

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
                suggestions.push({
                    text: word,
                    value_label: 'Original term'
                })
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

function dummyElement(text){
    const div = document.createElement('div')
    div.style.display = 'inline-block';
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.innerHTML = text;
    document.body.appendChild(div);
    return div;
}

function getTextWidth(text) {
    const div = dummyElement(text);
    const width = div.clientWidth;
    document.body.removeChild(div);
    return width;
}

function getTextHeight(text){
    const div = dummyElement(text);
    const height = div.clientHeight;
    document.body.removeChild(div);
    return height;
}

export function updateSelectWidth(container){
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
