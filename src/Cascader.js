function Cascader(topics){
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

    obj._elem = message;

    content.appendChild(
        document.createTextNode('Some things you can ask me:')
    );
    content.appendChild(
        document.createElement('br')
    );
    for(var i = 0; i<topics.length; i++){
        var label = topics[i].label;
        var active = i == 0 ? 'active' : '';
        var opt = htmlToElement(`
            <div class="option ${active}">
                <span>${label} </span>
                <span class="chata-icon option-arrow">
                    ${OPTION_ARROW}
                </span>
            </div>
        `);
        options.push(opt);
        optionsContainer.appendChild(opt);
    }

    content.appendChild(topicsContainer);
    topicsContainer.appendChild(chataCascader);
    chataCascader.appendChild(optionsContainer);

    content.appendChild(
        document.createTextNode('Use')
    );

    content.appendChild(
        htmlToElement(`
            <span class="autoql-vanilla-intro-qi-link">
            <span class="chata-icon undefined" style="margin-right: -3px;">
                ${EXPLORE_QUERIES}
            </span> Explore Queries</span>
        `)
    )

    content.appendChild(
        document.createTextNode(' to further explore the possibilities.')
    );

    return obj;
}
