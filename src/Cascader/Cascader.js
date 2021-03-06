import {
    OPTION_ARROW,
    EXPLORE_QUERIES,
    TOPICS_ARROW,
    OPTION_ARROW_CIRCLE,
} from '../Svg'
import { htmlToElement  } from '../Utils'
import { strings } from '../Strings'
import './Cascader.css'

export function Cascader(topics, datamessenger){
    var obj = this;
    var message = document.createElement('div');
    var chatMessageBubble = document.createElement('div');
    var content = document.createElement('div');
    var topicsContainer = document.createElement('div');
    var chataCascader = document.createElement('div');
    var optionsContainer = document.createElement('div');
    var options = [];

    message.classList.add('autoql-vanilla-chat-single-message-container');
    message.classList.add('response');
    topicsContainer.classList.add('autoql-vanilla-topics-container');
    chataCascader.classList.add('autoql-vanilla-chata-cascader');
    optionsContainer.classList.add('options-container');
    chatMessageBubble.classList.add('autoql-vanilla-chat-message-bubble');
    message.appendChild(chatMessageBubble);
    chatMessageBubble.appendChild(content);
    message.style.maxHeight = 'unset';
    obj._elem = message;

    content.appendChild(
        document.createTextNode(strings.cascaderIntro)
    );

    content.appendChild(
        document.createElement('br')
    );

    obj.keyAnimation = (text) => {
        var chataInput = datamessenger.input;
        obj.inputAnimation(text, chataInput);
    }

    obj.queryTipsInputAnimation = (text) => {
        var input = datamessenger.queryTipsInput;
        obj.inputAnimation(text, input);
    }

    obj.inputAnimation = (text, input) => {
        input.focus();
        var selectedQuery = text;
        var subQuery = '';
        var index = 0;
        var int = setInterval(function () {
            subQuery += selectedQuery[index];
            if(index >= selectedQuery.length){
                clearInterval(int);
                var evt = new KeyboardEvent('keypress', {
                    keyCode: 13,
                    type: "keypress",
                    which: 13
                });
                input.dispatchEvent(evt)
            }else{
                input.value = subQuery;
            }
            index++;
        }, 50);
    }

    obj.showQueryTips = () => {
        datamessenger.tabQueryTips.classList.add('active');
        datamessenger.tabChataUtils.classList.remove('active');
        datamessenger.tabsAnimation('none', 'none');
        datamessenger.queryTipsAnimation('block');
    }

    obj.makeOpt = (opt, svg, active='', extraClass='') => {
        var htmlOption = htmlToElement(`
            <div class="option ${active}">
                <span>${opt} </span>
                <span class="chata-icon ${extraClass}">
                    ${svg}
                </span>
            </div>
        `)

        return htmlOption
    }

    for(var i = 0; i<topics.length; i++){
        var topic = topics[i].topic;
        var active = i == 0 ? 'active' : '';
        var opt = obj.makeOpt(topic, OPTION_ARROW, active, 'option-arrow');
        opt.setAttribute('data-index-topic', i);
        options.push(opt);
        optionsContainer.appendChild(opt);
        opt.onclick = (evt) => {
            var target = evt.currentTarget;
            // if(!target.classList.contains('option')){
            //     target = target.parentElement;
            // }
            optionsContainer.classList.add('hidden');
                chataCascader.appendChild(
                obj.createOptions(target.dataset.indexTopic)
            )
        }
    }

    obj.createOptions = (parentIndex) => {
        var topic = topics[parseInt(parentIndex)];
        var childrenOptionsContainer = document.createElement('div');
        obj.childrenOptionsContainer = childrenOptionsContainer
        var optionList = [];
        const arrow = htmlToElement(`
            <span class="chata-icon cascader-back-arrow">
                ${TOPICS_ARROW}
            </span>`
        );

        const title = htmlToElement(`
            <div class="options-title">${topic.topic}</div>
        `)

        const seeMore = htmlToElement(`
            <div class="option">
                <span>
                    <span class="chata-icon">${EXPLORE_QUERIES}</span>
                    ${strings.seeMore}
                </span>
            </div>
        `)

        childrenOptionsContainer.classList.add('options-container');
        childrenOptionsContainer.appendChild(arrow);
        childrenOptionsContainer.appendChild(title);
        const queries = Object.values(topic.queries);
        for (var i = 0; i < queries.length; i++) {

            var query = queries[i];
            var opt = obj.makeOpt(
                query, OPTION_ARROW_CIRCLE, '', 'option-execute-icon'
            );
            opt.setAttribute('data-index-topic', i);
            childrenOptionsContainer.appendChild(opt);
            optionList.push(opt);
        }

        optionList.map(opt => {
            opt.onclick = () => {
                obj.keyAnimation(opt.textContent.trim());
            }
        })

        arrow.onclick = () => {
            obj.reset()
        }

        seeMore.onclick = () => {
            obj.showQueryTips();
            obj.queryTipsInputAnimation(topic.topic);
        }

        childrenOptionsContainer.appendChild(seeMore);
        return childrenOptionsContainer;
    }

    content.appendChild(topicsContainer);
    topicsContainer.appendChild(chataCascader);
    chataCascader.appendChild(optionsContainer);

    content.appendChild(
        document.createTextNode(strings.use)
    );
    var link = htmlToElement(`
        <span class="autoql-vanilla-intro-qi-link">
            <span class="chata-icon" style="margin-right: -3px;">
                ${EXPLORE_QUERIES}
            </span> ${strings.exploreQueries}
        </span>
    `);
    content.appendChild(
        link
    )

    link.onclick = () => {
        obj.showQueryTips();
    }

    content.appendChild(
        document.createTextNode(strings.cascaderFooter)
    );

    obj.reset = () => {
        optionsContainer.classList.remove('hidden');
        if(chataCascader.contains(obj.childrenOptionsContainer)){
            chataCascader.removeChild(obj.childrenOptionsContainer)
        }
    }

    return obj;
}
