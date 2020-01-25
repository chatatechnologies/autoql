function NotificationSettingsModal(){
    var wrapper = document.createElement('div');
    var btnAddGroup = htmlToElement(`
        <span>
            <div class="chata-btn default notification-rule-add-btn-outer"
            style="padding: 5px 16px; margin: 2px 5px;">
                <span data-test="chata-icon" class="chata-icon">
                    ${ADD_GROUP}
                </span>
                Add Condition Group
            </div>
        </span>
    `);
    wrapper.classList.add('chata-steps-container');
    var step1 = createStep('Appearance');
    var step2 = createStep(
        'Notification Conditions',
        'Notify me when the following conditions are met'
    );
    var step3 = createStep(
        'Data Return',
        'Return the data from this query when the notification is triggered'
    );
    var step4 = createStep('Frequency');

    // STEP 1
    var titleContainer = new InputContainer(
        ['chata-notification-display-name-input']
    )
    var messageContainer = new InputContainer(
        ['chata-notification-message-input']
    )
    var titleInput = new ChataInput('input', {
        placeholder: 'Title (max 50 characters)',
        maxlength: '50',
        type: "single"
    }, NOTEBOOK);
    var messageArea = new ChataInput('textarea', {
        placeholder: 'Notification Message (max 200 characters)',
        maxlength: '200',
        type: 'multi',
        style: "margin-top: 0px; margin-bottom: 0px; height: 120px;"
    });
    titleContainer.appendChild(titleInput.input);
    titleContainer.appendChild(titleInput.spanIcon);
    messageContainer.appendChild(messageArea.input);
    step1.addElement(titleContainer);
    step1.addElement(messageContainer);

    // STEP 2
    var ruleContainer = document.createElement('div');
    var group = ConditionGroup();
    ruleContainer.classList.add('notification-rule-outer-container');
    ruleContainer.appendChild(group);
    ruleContainer.appendChild(btnAddGroup);
    step2.addElement(ruleContainer);

    // STEP 3
    var queryReturnContainer = new InputContainer(
        ['chata-notification-display-name-input']
    )
    var queryReturnInput = new ChataInput('input', {
        placeholder: 'Query',
        type: "single"
    }, QUERY);
    queryReturnContainer.appendChild(queryReturnInput.input);
    queryReturnContainer.appendChild(queryReturnInput.spanIcon);

    step3.addElement(queryReturnContainer);

    // STEP 4
    var label = document.createTextNode('Notify me')
    var selectFrequency = document.createElement('div');
    var relativeDiv = document.createElement('div');
    var checkboxFrequency = htmlToElement(`
        <div data-test="chata-checkbox"
            style="display: inline-block; vertical-align: middle;">
            <div class="chata-checkbox">
                <input type="checkbox" class="chata-checkbox__input">
                <div style="width:5px;"></div>
                <div class="chata-checkbox-label">Repeat</div>
            </div>
            <div class="chata-select notification-frequency-select">
                Monthly
            </div>
        </div>
    `);
    relativeDiv.style.position = 'relative';
    selectFrequency.classList.add('chata-select');
    selectFrequency.innerHTML = 'Once, When this happens';
    relativeDiv.appendChild(checkboxFrequency);
    step4.addElement(label);
    step4.addElement(selectFrequency);
    step4.addElement(relativeDiv);

    wrapper.appendChild(step1);
    wrapper.appendChild(step2);
    wrapper.appendChild(step3);
    wrapper.appendChild(step4);

    return wrapper;
}

function ChataInput(tag, elementProps, svgIcon=undefined){
    let input;
    input = document.createElement(tag);
    input.classList.add('chata-input-settings')
    if(tag === 'input'){
        input.classList.add('with-icon');
        var span = document.createElement('span');
        span.classList.add('chata-icon');
        span.classList.add('chata-input-icon');
        span.innerHTML = svgIcon;
        this.spanIcon = span;
    }else{
        input.classList.add('area');
    }
    for (var [key, value] of Object.entries(elementProps)) {
        input.setAttribute(key, value);
    }

    this.input = input;
    return this
}

function InputContainer(classList=[]){
    var container = document.createElement('div');
    container.classList.add('chata-input-container');
    for (var i = 0; i < classList.length; i++) {
        container.classList.add(classList[i]);
    }
    return container;
}

function ConditionGroup(){
    var groupWrapper = document.createElement('div');
    var groupContainer = document.createElement('div');
    var ruleContainer = document.createElement('div');
    var chataSelect = document.createElement('div');
    var secondContainer = document.createElement('div');
    var chataSelectTermType = document.createElement('div');
    var spanBubbleIcon = htmlToElement(`
        <span class="chata-icon rule-input-select-bubbles-icon">
            ${INPUT_BUBBLES}
        </span>
    `);
    var chataRuleDeleteBtn = htmlToElement(`
        <span class="chata-icon chata-rule-delete-btn">
            ${INPUT_DELETE}
        </span>
    `);
    var rulaAndOrSelect = htmlToElement(`
        <div class="notification-rule-and-or-select">
            Match
            <div class="chata-radio-btn-container" data-test="chata-radio">
                <div class="chata-radio-btn active">ALL</div>
                <div class="chata-radio-btn">ANY</div>
            </div>
            conditions
        </div>
    `);
    var notificationGroupDeleteBtn = htmlToElement(`
        <div class="chata-notification-group-delete-btn">
            <span data-test="chata-icon" class="chata-icon">
                ${INPUT_DELETE}
            </span>
        </div>
    `);

    var notificationRuleAddBtn = htmlToElement(`
        <div class="notification-rule-btn-container">
            <div class="chata-notification-rule-add-btn">
                <span class="chata-icon chata-notification-add-icon">
                    ${ADD_GROUP}
                </span>
            </div>
        </div>
    `)
    var inputContainer1 = new InputContainer([
        'chata-rule-input'
    ])
    var inputContainer2 = new InputContainer([
        'chata-rule-input'
    ])

    var queryInput = new ChataInput('input', {
        placeholder: 'Query',
        type: "single"
    }, QUERY);

    var queryInput2 = new ChataInput('input', {
        placeholder: 'Query',
        type: "single"
    }, QUERY);

    groupWrapper.classList.add('notification-group-wrapper');
    groupWrapper.style.marginLeft = '0px';
    groupContainer.classList.add('chata-notification-group-container-copy');
    groupContainer.classList.add('disable-first-delete');
    ruleContainer.classList.add('chata-notification-rule-container');
    chataSelect.classList.add('chata-select');
    chataSelect.classList.add('chata-rule-condition-select');
    chataSelectTermType.classList.add('chata-select');
    chataSelectTermType.classList.add('chata-rule-term-type-selector');

    chataSelect.innerHTML = '&gt;';
    secondContainer.classList.add('chata-rule-second-input-container');

    inputContainer1.appendChild(queryInput.input);
    inputContainer1.appendChild(queryInput.spanIcon);
    inputContainer2.appendChild(queryInput2.input);
    inputContainer2.appendChild(queryInput2.spanIcon);

    chataSelectTermType.appendChild(spanBubbleIcon);

    secondContainer.appendChild(inputContainer2);
    secondContainer.appendChild(chataSelectTermType);

    ruleContainer.appendChild(inputContainer1);
    ruleContainer.appendChild(chataSelect);
    ruleContainer.appendChild(secondContainer);
    ruleContainer.appendChild(chataRuleDeleteBtn);

    groupContainer.appendChild(ruleContainer);
    groupContainer.appendChild(rulaAndOrSelect);
    groupContainer.appendChild(notificationGroupDeleteBtn);
    groupContainer.appendChild(notificationRuleAddBtn);
    groupWrapper.appendChild(groupContainer);

    return groupWrapper;
}

function createStep(title, subtitle=''){
    var step = document.createElement('div');
    var titleEl = document.createElement('div');
    var stepContent = document.createElement('div');
    var contentWrapper = document.createElement('div');
    var stepDot = document.createElement('div');
    step.classList.add('chata-step-container');
    titleEl.classList.add('chata-step-title');
    stepContent.classList.add('chata-step-content');
    stepDot.classList.add('chata-step-dot');
    titleEl.innerHTML = title;

    step.appendChild(titleEl);
    if(subtitle !== ''){
        subtitleEl = document.createElement('div');
        subtitleEl.classList.add('chata-step-subtitle');
        subtitleEl.innerHTML = subtitle;
        step.appendChild(subtitleEl);
    }

    stepContent.appendChild(contentWrapper);
    step.appendChild(stepContent);
    step.appendChild(stepDot);
    step.addElement = (elem) => {
        contentWrapper.appendChild(elem);
    }
    return step;
}
