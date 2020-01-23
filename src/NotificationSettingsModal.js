function NotificationSettingsModal(){
    var wrapper = document.createElement('div');
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
