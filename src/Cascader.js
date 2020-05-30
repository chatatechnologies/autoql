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

    obj.makeOpt = (opt, active='') => {
        var opt = htmlToElement(`
            <div class="option ${active}">
                <span>${opt} </span>
                <span class="chata-icon option-arrow">
                    ${OPTION_ARROW}
                </span>
            </div>
        `);

        return opt;
    }

    for(var i = 0; i<topics.length; i++){
        var label = topics[i].label;
        var active = i == 0 ? 'active' : '';
        var opt = obj.makeOpt(label, active);
        opt.setAttribute('data-index-topic', i);
        options.push(opt);
        optionsContainer.appendChild(opt);
        opt.onclick = (evt) => {
            var target = evt.target;
            if(!target.classList.contains('option')){
                target = target.parentElement;
            }
            optionsContainer.classList.add('hidden');
                chataCascader.appendChild(
                obj.createOptions(target.dataset.indexTopic)
            )
        }
    }

    obj.createOptions = (parentIndex) => {
        var topic = topics[parseInt(parentIndex)];
        console.log(topic);
        var childrenOptionsContainer = document.createElement('div');
        const arrow = htmlToElement(`
            <span class="chata-icon cascader-back-arrow">
                ${TOPICS_ARROW}
            </span>`
        );

        const title = htmlToElement(`
            <div class="options-title">${topic.label}</div>
        `)

        childrenOptionsContainer.classList.add('options-container');
        childrenOptionsContainer.appendChild(arrow);
        childrenOptionsContainer.appendChild(title);

        for (var i = 0; i < topic.children.length; i++) {

            var label = topic.children[i].label;
            var active = i == 0 ? 'active' : '';
            var opt = obj.makeOpt(label, active);
            opt.setAttribute('data-index-topic', i);
            childrenOptionsContainer.appendChild(opt);
            opt.onclick = (evt) => {
                console.log('TEST');
            }
        }

        arrow.onclick = (evt) => {
            optionsContainer.classList.remove('hidden');
            chataCascader.removeChild(childrenOptionsContainer);
        }
        return childrenOptionsContainer;
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
