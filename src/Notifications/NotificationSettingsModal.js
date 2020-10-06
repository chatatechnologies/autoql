import { htmlToElement, uuidv4 } from '../Utils'
import {
    ADD_GROUP,
    QUERY,
    NOTEBOOK,
    INPUT_BUBBLES,
    INPUT_DELETE
} from '../Svg'
import { convert } from '../RuleParser'
import { ChataInput, InputContainer } from '../ChataComponents'


export function NotificationSettingsModal(mode='create', rule={}){
    var wrapper = document.createElement('div');
    wrapper.mode = mode;
    var frequencyBox = FrequencyBox(
        `Notify me as soon as this happens,
        but don't notify me again until the first of the next month.`
    );
    var btnAddGroup = htmlToElement(`
        <span>
            <div class="autoql-vanilla-chata-btn default
            notification-rule-add-btn-outer"
            style="padding: 5px 16px; margin: 2px 5px;">
                <span data-test="chata-icon" class="chata-icon">
                    ${ADD_GROUP}
                </span>
                Add Condition Group
            </div>
        </span>
    `);
    wrapper.classList.add('chata-steps-container');
    var step1 = new ChataModalStep('Set up your Alert','1',);
    var step2 = new ChataModalStep('Schedule Frequency', '2');
    var step3 = new ChataModalStep(
        'Manage Alert Preferences',
        '3',
        'When this Alert is triggered:'
    );
    // var step4 = new ChataModalStep('Appearance', '4');
    // step4.classList.add('complete');

    // STEP 1
    const updateAndOr = (element) => {
        var groups = document.getElementsByClassName(
            'notification-group-wrapper'
        );
        var newText = element.operator === 'OR' ? 'AND' : 'OR';
        for (var i = 0; i < groups.length; i++) {
            groups[i].notificationAndOrBreak.setText(newText);
        }

        return newText;
    }
    var ruleContainer = document.createElement('div');
    var onChangeAndOr = (evt) => {
        parentSelect.operator = updateAndOr(parentSelect);
    }
    var parentSelect = notificationRuleAndOrSelect(
        'of the following:',
        onChangeAndOr
    );
    parentSelect.operator = 'AND';

    if(mode === 'edit'){
        if(rule.expression[0].condition != 'AND'){
            var text = updateAndOr(parentSelect);
            parentSelect.operator = text;
            parentSelect.radio.toggleButtons(text);
        }
    }

    parentSelect.style.visibility = 'hidden';
    parentSelect.style.display = 'none';

    ruleContainer.classList.add('notification-rule-outer-container');

    step1.addElement(parentSelect);
    step1.addElement(ruleContainer);
    ruleContainer.step = step1;
    btnAddGroup.onclick = function(evt){
        var groups = document.getElementsByClassName(
            'notification-group-wrapper'
        );
        var isFirst = groups.length === 0 ? true : false;
        var newGroup = new ConditionGroup(
            step1, ruleContainer, parentSelect, isFirst
        );
        ruleContainer.insertBefore(newGroup, btnAddGroup);
        if(groups.length >= 1){
            groups[0].setAsFirtsAndOrBreak();
        }
        if(groups.length > 1){
            groups[0].showNotificationAndOrBreak();
        }
        showLeftAndOr(parentSelect, ruleContainer);
        checkStep1(ruleContainer);
        step1.stepContentContainer.style.height = getHeightForChildrens(
            step1.stepContentContainer
        ) + 'px';
    }
    step1.onkeyup = function(evt){
        checkStep1(ruleContainer);
    }

    // STEP 2
    var label = document.createTextNode('Notify me')
    var selectFrequency = document.createElement('div');
    var relativeDiv = document.createElement('div');

    relativeDiv.style.position = 'relative';
    selectFrequency.classList.add('chata-select');
    var frequencyValue = document.createElement('div');

    frequencyValue.classList.add('autoql-vanilla-frequency-value');
    frequencyValue.indexValue = 1;
    var popupFrequency = PopupContainer([
        {text: 'Once, when this happens', active:true},
        {text: 'Every time this happens', active:false},
    ]);

    popupFrequency.classList.add('frequency-popup');
    popupFrequency.onclick = (evt) => {
        if(evt.target.tagName === 'LI'){
            var val = evt.target.textContent;
            var index = parseInt(evt.target.dataset.indexOption);
            frequencyValue.indexValue = index;
            frequencyValue.innerHTML = val;
            relativeDiv.dateSelectView = null;
            showFrequencyView(relativeDiv, index);
            step2.classList.add('complete');
            frequencyValue.style.color = 'inherit';
            frequencyValue.style.fontStyle = 'inherit';
            switch (index) {
                case 0:
                    var view = monthlyView();
                    relativeDiv.appendChild(view);
                    relativeDiv.dateSelectView = view;
                    frequencyValue.indexValue = 1;
                    view.style.visibility = 'hidden';
                    frequencyBox.setMessage(
                        `Notify me as soon as this happens,
                        but don't notify me again until
                        the first of the next month.`
                    );
                    frequencyValue.setAttribute(
                        'data-frequency-event', 'SINGLE_EVENT'
                    )
                    break;
                case 1:
                    var view = monthlyView();
                    relativeDiv.appendChild(view);
                    relativeDiv.dateSelectView = view;
                    view.style.visibility = 'hidden';
                    frequencyBox.setMessage(`
                        Notify me every time this happens.
                    `);
                    frequencyValue.setAttribute(
                        'data-frequency-event', 'REPEAT_EVENT'
                    )
                    break;
                case 2:
                    frequencyBox.setMessage(`
                        Notify me every (description of schedule)
                    `);
                    break;
                default:

            }
        }
    }

    selectFrequency.appendChild(popupFrequency);

    // showFrequencyView(relativeDiv, 0);
    // var view = monthlyView();
    // relativeDiv.appendChild(view);
    // relativeDiv.dateSelectView = view;
    // view.style.visibility = 'hidden';

    selectFrequency.appendChild(frequencyValue);
    selectFrequency.onclick = function(){
        popupFrequency.toggleVisibility();
    }
    var frequencySettingsContainer = document.createElement('div');
    frequencySettingsContainer.classList.add('frequency-settings-container');

    step2.addClass('notification-frequency-step');
    frequencySettingsContainer.appendChild(label);
    frequencySettingsContainer.appendChild(selectFrequency);
    frequencySettingsContainer.appendChild(relativeDiv);
    step2.addElement(frequencySettingsContainer);
    step2.addElement(frequencyBox);

    // STEP 3
    var queryReturnContainer = new InputContainer(
        ['chata-notification-display-name-input']
    )
    var queryReturnInput = new ChataInput('input', {
        placeholder: 'Query',
        type: "single"
    }, QUERY);
    queryReturnInput.input.classList.add('autoql-vanilla-query-return-input');
    queryReturnContainer.appendChild(queryReturnInput.input);
    queryReturnContainer.appendChild(queryReturnInput.spanIcon);
    step3.addElement(queryReturnContainer);
    queryReturnInput.input.onkeyup = function(evt){
        if(evt.target.value != ''){
            if(!step3.classList.contains('complete')){
                step3.classList.add('complete');
            }
        }else{
            step3.classList.remove('complete');
        }
    }

    // STEP 4
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
    titleInput.input.classList.add('autoql-vanilla-notification-title-input');
    messageArea.input.classList.add('autoql-vanilla-notification-message');
    titleContainer.appendChild(titleInput.input);
    titleContainer.appendChild(titleInput.spanIcon);
    messageContainer.appendChild(messageArea.input);

    // step4.addElement(titleContainer);
    // step4.addElement(messageContainer);
    // titleInput.input.onkeyup = function(evt){
    //     if(evt.target.value != ''){
    //         if(!step4.classList.contains('complete')){
    //             step4.classList.add('complete');
    //         }
    //     }else{
    //         step4.classList.remove('complete');
    //     }
    // }

    wrapper.appendChild(step1);
    wrapper.appendChild(step2);
    wrapper.appendChild(step3);
    // wrapper.appendChild(step4);

    const loadRules = async () => {
        var groups = convert(rule.expression, false);
        await groups.map((group, index) => {
            var isFirst = index === 0;
            ruleContainer.appendChild(
                new ConditionGroup(
                    step1, ruleContainer, parentSelect, isFirst, {
                        ...rule.expression[index],
                        parsedLines: group
                    }
                )
            );
        })

        var groups = document.getElementsByClassName(
            'notification-group-wrapper'
        );

        if(groups.length >= 1){
            groups[0].setAsFirtsAndOrBreak();
        }

        if(groups.length > 1){
            groups[0].showNotificationAndOrBreak();
        }

        showLeftAndOr(parentSelect, ruleContainer);
        checkStep1(ruleContainer);
    }

    const setFrequency = () => {
        if(rule.notification_type === 'REPEAT_EVENT'){
            frequencyValue.innerHTML = 'Every time this happens';
        }else {
            frequencyValue.innerHTML = 'Once, when this happens';
            showFrequencyView(relativeDiv, 0);
        }
        frequencyValue.setAttribute(
            'data-frequency-event', rule.notification_type
        )
        step2.classList.add('complete');

        frequencyValue.style.color = 'inherit';
        frequencyValue.style.fontStyle = 'inherit';
    }

    if(mode === 'edit'){
        loadRules();
        setFrequency();
        queryReturnInput.input.value = rule.query;
        titleInput.input.value = rule.title;
        messageArea.input.value = rule.message;
        step3.classList.add('complete');
        // step4.classList.add('complete');
    }else{
        var group = new ConditionGroup(
            step1, ruleContainer, parentSelect, true
        );
        ruleContainer.appendChild(group);
        frequencyValue.innerHTML = 'Select a frequency';
        frequencyValue.style.color = 'rgba(0, 0, 0, 0.4)';
        frequencyValue.style.fontStyle = 'italic';
    }

    ruleContainer.appendChild(btnAddGroup);

    step1.getValues = getStep1Values;
    step2.getValues = getStep2Values;
    step3.getValues = getStep3Values;
    // step4.getValues = getStep4Values;


    wrapper.step1 = step1;
    wrapper.step2 = step2;
    wrapper.step3 = step3;
    // wrapper.step4 = step4;
    wrapper.getValues = getNotificationValues;

    return wrapper;
}

function FrequencyBox(message){
    var parent = htmlToElement(`
        <div class="frequency-description-box-container">
    </div>`);
    var box = document.createElement('div');
    var messageContent = document.createElement('span');
    messageContent.innerHTML = message;
    box.classList.add('frequency-description-box');
    box.appendChild(htmlToElement(`
        <div class="frequency-description-title">Description:</div>
    `));
    box.appendChild(messageContent);

    parent.setMessage = (newMessage) => {
        messageContent.innerHTML = newMessage;
    }
    parent.appendChild(box);

    return parent;
}

function frequencyView(parentElement, popupValues, label, followText){
    parentElement.innerHTML = '';
    var repeatFollowText = htmlToElement(`
        <span class="frequency-repeat-follow-text"> on:</span>
    `);
    var checkboxInput = htmlToElement(`
        <input type="checkbox" class="chata-checkbox__input">
    `)
    var checkboxContainer = htmlToElement(`
        <div class="chata-checkbox">
            <div class="chata-checkbox-label">Repeat</div>
        </div>
    `);
    var checkboxFrequency = htmlToElement(`
        <div
            style="display: inline-block; vertical-align: middle;">
        </div>
    `);
    // checkboxContainer.insertAdjacentElement('afterbegin', checkboxInput)
    checkboxFrequency.appendChild(checkboxContainer);
    parentElement.appendChild(checkboxFrequency);
    parentElement.style.visibility = 'visible';
    repeatFollowText.style.visibility='hidden';
    var labelContent = htmlToElement(`
        <div>${label}</div>
    `)
    var frequencyButton = htmlToElement(`
        <div class="chata-select notification-frequency-select">

        </div>
    `);
    var popupFrequencySelect = PopupContainer(popupValues);

    frequencyButton.appendChild(labelContent);
    frequencyButton.appendChild(popupFrequencySelect);
    frequencyButton.style.display = 'inline-block';

    // checkboxInput.onchange = (evt) => {
    //     if(evt.target.checked){
    //         frequencyButton.style.visibility = 'visible';
    //         repeatFollowText.style.visibility='visible'
    //         if(parentElement.dateSelectView){
    //             parentElement.dateSelectView.style.visibility = 'visible';
    //         }
    //     }else{
    //         frequencyButton.style.visibility = 'hidden';
    //         repeatFollowText.style.visibility='hidden';
    //         if(parentElement.dateSelectView){
    //             parentElement.dateSelectView.style.visibility = 'hidden';
    //         }
    //     }
    // }
    frequencyButton.onclick = (evt) => {
        popupFrequencySelect.toggleVisibility();
    }

    parentElement.appendChild(frequencyButton);
    if(followText){
        // parentElement.appendChild(repeatFollowText);
    }

    popupFrequencySelect.convertValue = (text) => {
        switch (text) {
            case 'Monthly':
                return 'MONTH';
                break;
            case 'Daily':
                return 'DAY';
                break;
            case 'Weekly':
                return 'WEEK';
                break;
            default:

        }
    }

    popupFrequencySelect.setValue = (text) => {
        labelContent.textContent = text;
        labelContent.setAttribute(
            'data-frequency-value', popupFrequencySelect.convertValue(text)
        )
    }

    popupFrequencySelect.hideFrequency = () => {
        checkboxContainer.style.display = 'none';
        frequencyButton.style.display = 'none';
    }

    popupFrequencySelect.showFrequency = () => {
        checkboxContainer.style.display = 'inline-block';
        frequencyButton.style.display = 'inline-block';
    }

    labelContent.setAttribute(
        'data-frequency-value', popupFrequencySelect.convertValue(label)
    )

    return popupFrequencySelect;
}

function weeklyView(frequencyElement){
    const DAYS = [
        'S','M','T','W','T','F','S'
    ];
    var container = document.createElement('div');
    var radioContainer = document.createElement('div');

    container.classList.add('frequency-date-select-container');
    radioContainer.classList.add('chata-radio-btn-container');
    for (var i = 0; i < DAYS.length; i++) {
        var element = document.createElement('div');
        element.classList.add('chata-radio-btn');
        element.innerHTML = DAYS[i];
        radioContainer.appendChild(element);
    }
    container.appendChild(radioContainer);
    return container;
}

function monthlyView(frequencyElement){
    var container = document.createElement('div');
    var radioContainer = document.createElement('div');
    container.classList.add('frequency-date-select-container');
    radioContainer.classList.add('chata-radio-btn-container');
    radioContainer.classList.add('month-select');
    var nDay = 1;
    for (var x = 0; x < 5; x++) {
        var row = document.createElement('div');
        row.classList.add('row-month');
        for (var i = 0; i < 7; i++) {
            var btn = document.createElement('div');
            btn.classList.add('chata-radio-btn');
            if(nDay > 31){
                btn.classList.add('last-day');
                btn.innerHTML = 'Last Day';
                row.appendChild(btn);
                break;
            }
            btn.innerHTML = (nDay++);
            if(nDay == 6)btn.classList.add('top-right');
            row.appendChild(btn);
        }
        radioContainer.appendChild(row);
    }
    container.appendChild(radioContainer);
    return container;
}

function yearlyView(){
    var container = document.createElement('div');
    var radioContainer = document.createElement('div');
    container.classList.add('frequency-date-select-container');
    radioContainer.classList.add('chata-radio-btn-container');
    radioContainer.classList.add('year-select');
    const MONTH_LIST = [
        'Jan', 'Feb', 'Mar',
        'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec'
    ];
    var nMonth = 0;
    for (var i = 0; i < 3; i++) {
        var row = document.createElement('div');
        row.classList.add('row-year');
        for (var x = 0; x < 3; x++) {
            var btn = document.createElement('div');
            btn.classList.add('chata-radio-btn');
            btn.innerHTML = MONTH_LIST[nMonth++];
            if(nMonth == 3)btn.classList.add('top-right');
            row.appendChild(btn);
        }
        radioContainer.appendChild(row);
    }
    container.appendChild(radioContainer);
    return container;
}

function onFrequencyPopupClick(evt, frequencyElement, indexZero=false){
    var index = parseInt(evt.target.dataset.indexOption);
    if(indexZero)index += 1;
    frequencyElement.popup.setValue(evt.target.textContent);
    switch (index) {
        case 1:
            // var view = weeklyView();
            // if(!frequencyElement.dateSelectView){
            //     frequencyElement.appendChild(view);
            // }else{
            //     frequencyElement.replaceChild(
            //         view, frequencyElement.dateSelectView
            //     );
            // }
            // frequencyElement.dateSelectView = view;
            break;
        case 2:
            // var view = monthlyView();
            // if(!frequencyElement.dateSelectView){
            //     frequencyElement.appendChild(view);
            // }else{
            //     frequencyElement.replaceChild(
            //         view, frequencyElement.dateSelectView
            //     );
            // }
            // frequencyElement.dateSelectView = view;
            break;
        case 3:
            // var view = yearlyView();
            // if(!frequencyElement.dateSelectView){
            //     frequencyElement.appendChild(view);
            // }else{
            //     frequencyElement.replaceChild(
            //         view, frequencyElement.dateSelectView
            //     );
            // }
            // frequencyElement.dateSelectView = view;
            break;
        default:
            // if(frequencyElement.dateSelectView){
            //     frequencyElement.removeChild(
            //         frequencyElement.dateSelectView
            //     );
            //     frequencyElement.dateSelectView = null;
            // }
            break;
    }
}

function showFrequencyView(frequencyElement, type){
    switch (type) {
        case 0:
            var popup = frequencyView(frequencyElement, [
                {text: 'Daily', active:false},
                {text: 'Weekly', active:false},
                {text: 'Monthly', active:true},
                // {text: 'Yearly', active:false},
            ], 'Monthly', true);
            frequencyElement.popup = popup;
            popup.onclick = (evt) => {
                onFrequencyPopupClick(evt, frequencyElement);
            }
            break;
        case 1:
            frequencyElement.innerHTML = '';
            // var popup = frequencyView(frequencyElement, [
            //     {text: 'Certains days of week', active:false},
            //     {text: 'Certains days of the month', active:true},
            //     {text: 'Certains months of the year', active:false},
            // ], 'Certains days of the month', false);
            // frequencyElement.popup = popup;
            // popup.classList.add('large-popup');
            // popup.onclick = (evt) => {
            //     onFrequencyPopupClick(evt, frequencyElement, true);
            // }
            // break;
        case 2:
            frequencyElement.innerHTML = '';
            break;
        default:
            break;
    }
}

function checkStep1(ruleContainer){
    var groups = document.getElementsByClassName(
        'notification-group-wrapper'
    );
    var valid = true
    for (var i = 0; i < groups.length; i++) {
        if(!groups[i].isValid()){
            valid = false
            break;
        }
    }

    if(groups.length === 0){
        valid = false;
    }

    if(valid){
        ruleContainer.step.classList.add('complete');
    }else{
        ruleContainer.step.classList.remove('complete');
    }
}

function showLeftAndOr(parentSelect, step){
    var groups = document.getElementsByClassName('notification-group-wrapper');
    console.log(groups);
    if(groups.length <= 1){
        parentSelect.style.visibility = 'hidden';
        parentSelect.style.display = 'none';
        marginLeft(groups, '0px');
    }else{
        parentSelect.style.visibility = 'visible';
        parentSelect.style.display = 'block';
        marginLeft(groups, '50px');
    }
}

function marginLeft(groups, marginValue){
    for (var i = 0; i < groups.length; i++) {
        groups[i].style.marginLeft = marginValue;
    }
}

// function ChataInput(tag, elementProps, svgIcon=undefined){
//     let input;
//     input = document.createElement(tag);
//     input.classList.add('chata-input-settings')
//     if(tag === 'input'){
//         input.classList.add('with-icon');
//         var span = document.createElement('span');
//         span.classList.add('chata-icon');
//         span.classList.add('chata-input-icon');
//         span.innerHTML = svgIcon;
//         this.spanIcon = span;
//     }else{
//         input.classList.add('area');
//     }
//     for (var [key, value] of Object.entries(elementProps)) {
//         input.setAttribute(key, value);
//     }
//
//     this.input = input;
//     return this
// }
//
// function InputContainer(classList=[]){
//     var container = document.createElement('div');
//     container.classList.add('chata-input-container');
//     for (var i = 0; i < classList.length; i++) {
//         container.classList.add(classList[i]);
//     }
//     return container;
// }

function createRadio(onChange){
    var radio = document.createElement('div');
    var btnAll = document.createElement('div');
    var btnAny = document.createElement('div');
    radio.classList.add('chata-radio-btn-container');
    btnAll.classList.add('chata-radio-btn');
    btnAll.classList.add('active');
    btnAny.classList.add('chata-radio-btn');
    btnAny.innerHTML = 'ANY';
    btnAll.innerHTML = 'ALL';

    radio.btnAll = btnAll;
    radio.btnAny = btnAny;
    radio.appendChild(btnAll);
    radio.appendChild(btnAny);
    radio.onclick = function(evt){
        if(!evt.target.classList.contains('active')){
            btnAny.classList.toggle('active');
            btnAll.classList.toggle('active');
        }
        onChange(evt);
    }

    radio.toggleButtons = (text) => {
        if(text === 'OR'){
            btnAny.classList.add('active');
            btnAll.classList.remove('active');
        }else{
            btnAny.classList.remove('active');
            btnAll.classList.add('active');
        }
    }

    return radio;
}

function notificationRuleAndOrSelect(text, onChange){
    var div = document.createElement('div');
    var radio = createRadio(onChange);
    div.classList.add('notification-rule-and-or-select');
    div.style.marginBottom = '10px';
    div.innerHTML = 'Match';
    div.appendChild(radio);
    div.appendChild(document.createTextNode(text));
    div.radio = radio;
    return div;
}

function notificationAndOrBreak(isFirst, text=''){
    var wrapper = document.createElement('div');
    wrapper.notificationAndOrText = null;
    wrapper.isFirst = isFirst;
    wrapper.classList.add('notification-and-or-break');
    wrapper.setColor = (text) => {
        if(text === 'AND'){
            andOrText.style.background = 'rgb(186, 233, 255)';
            andOrText.style.border = '1px solid rgb(144, 221, 255)';
        }else{
            andOrText.style.background = 'rgb(255, 250, 202)';
            andOrText.style.border = '1px solid rgb(255, 235, 59)';
        }
    }
    wrapper.setText = (text) => {
        if(wrapper.notificationAndOrText !== null){
            wrapper.notificationAndOrText.innerHTML = text;
            wrapper.setColor(text);
        }
    }
    if(isFirst){
        wrapper.style.top = '0px';
        wrapper.style.height = '100%';
        wrapper.style.visibility = 'hidden';
    }else{
        wrapper.style.top = '-19px';
        wrapper.style.height = 'calc(100% + 19px)';
        var andOrText = document.createElement('div');
        andOrText.classList.add('notification-and-or-text');
        andOrText.innerHTML = text;
        wrapper.appendChild(andOrText);
        wrapper.notificationAndOrText = andOrText;
        wrapper.setColor(text);
    }
    return wrapper;
}

function PopupContainer(options=[]){
    var container = document.createElement('div');
    var ul = document.createElement('ul');

    container.classList.add('chata-select-popup-container');
    ul.classList.add('chata-select-popup');

    for (var i = 0; i < options.length; i++) {
        var option = document.createElement('li');
        option.innerHTML = options[i].text;
        option.classList.add('chata-select-option');
        option.setAttribute('data-index-option', i);
        if(options[i].dataTip){
            option.setAttribute('data-tippy-content', options[i].dataTip);
        }
        if(options[i].active){
            option.classList.add('active');
        }
        ul.appendChild(option);
    }

    container.appendChild(ul);

    container.toggleVisibility = function(){
        this.classList.toggle('active-popup');
    }

    return container
}

function GroupLine(params, expression=[]){
    var secondContainer = document.createElement('div');
    var chataSelectTermType = document.createElement('div');
    var chataSelect = document.createElement('div');
    var ruleContainer = document.createElement('div');
    var conditionValueSelect = document.createElement('div');
    conditionValueSelect.innerHTML = '>';
    var uuid = uuidv4();
    ruleContainer.conditionValue = '>';
    ruleContainer.termType = 'query';

    var chataRuleDeleteBtn = htmlToElement(`
        <span
            class="chata-icon chata-rule-delete-btn">
            ${INPUT_DELETE}
        </span>
    `);
    var spanBubbleIcon = htmlToElement(`
        <span class="chata-icon rule-input-select-bubbles-icon">
            ${INPUT_BUBBLES}
        </span>
    `);

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


    var popup = PopupContainer([
        {text: '>', dataTip: 'Greater Than', active:true},
        {text: '<', dataTip: 'Less Than', active:false},
        {text: '=', dataTip: 'Equals', active:false},
        {text: '∃', dataTip: 'Greater Than', active:false}
    ]);

    popup.onclick = (evt) => {
        if(evt.target.tagName === 'LI'){
            var val = evt.target.textContent;
            ruleContainer.conditionValue = val;
            chataSelect.conditionElement.innerHTML = val;
            if(val === '∃'){
                secondContainer.style.visibility = 'hidden';
                secondContainer.style.display = 'none';
            }else{
                secondContainer.style.visibility = 'visible';
                secondContainer.style.display = 'block';
            }
            params.onSelectRule();
        }
    }

    var popupQuery = PopupContainer([
        {
            text: `
            <span class="chata-icon rule-input-select-bubbles-icon">
                ${INPUT_BUBBLES}
            </span>`,
            dataTip: 'Query',
            active: true
        },
        {
            text: '<div style="font-size: 9px;">123</div>',
            dataTip: 'Constant',
            active: false
        }
    ]);

    popupQuery.onclick = (evt) => {
        let element;
        if(!evt.target.classList.contains('chata-select-popup-container')){
            if(evt.target.tagName === 'svg'){
                element = evt.target.parentElement.parentElement;
            }else if(evt.target.tagName === 'path'){
                element = evt.target.parentElement.parentElement.parentElement;
            }else if(evt.target.tagName === 'DIV'){
                element = evt.target.parentElement;
            }else{
                element = evt.target;
            }
            queryInput2.input.setAttribute(
                'placeholder', element.dataset.tippyContent
            );
            ruleContainer.termType = element.dataset.tippyContent.toLowerCase();
            chataSelectTermType.innerHTML = element.innerHTML;
            chataSelectTermType.appendChild(popupQuery);
        }
    }

    ruleContainer.isEmpty = function(){
        var val1 = queryInput.input.value;
        var val2 = queryInput2.input.value;
        if(ruleContainer.conditionValue === '∃'){
            return !val1;
        }else{
            return !val1 || !val2;
        }
    }

    ruleContainer.getOperator = () => {
        switch (ruleContainer.conditionValue) {
            case '>':
                return 'GREATER_THAN'
                break;
            case '<':
                return 'LESS_THAN'
            case '=':
                return 'EQUALS'
            case '∃':
                return 'EXISTS'
            default:

        }
    }

    ruleContainer.getValues = () => {
        var terms = [];

        var queryValues = {
            id: uuidv4(),
            term_type: 'query',
            condition: ruleContainer.getOperator(),
            term_value: queryInput.input.value
        }

        terms.push(queryValues)
        if(queryValues.condition != 'EXISTS'){
            var constantValues = {
                id: uuidv4(),
                term_type: 'constant',
                condition: 'TERMINATOR',
                term_value: queryInput2.input.value
            }
            terms.push(constantValues)
        }

        return terms
    }

    chataRuleDeleteBtn.onclick = function(evt){
        params.onDeleteLine(evt, ruleContainer);
    }

    chataSelect.onclick = function(){
        popup.toggleVisibility();
    }

    chataSelectTermType.onclick = function(){
        popupQuery.toggleVisibility();
    }

    inputContainer1.appendChild(queryInput.input);
    inputContainer1.appendChild(queryInput.spanIcon);
    inputContainer2.appendChild(queryInput2.input);
    inputContainer2.appendChild(queryInput2.spanIcon);

    ruleContainer.classList.add('chata-notification-rule-container');
    chataSelectTermType.classList.add('chata-select');
    chataSelectTermType.classList.add('chata-rule-term-type-selector');
    secondContainer.classList.add('chata-rule-second-input-container');
    secondContainer.appendChild(inputContainer2);
    // secondContainer.appendChild(chataSelectTermType);

    chataSelect.classList.add('chata-select');
    chataSelect.classList.add('chata-rule-condition-select');
    chataSelect.appendChild(popup);
    chataSelect.appendChild(conditionValueSelect);
    chataSelect.conditionElement = conditionValueSelect;
    chataSelectTermType.classList.add('chata-select');
    chataSelectTermType.classList.add('chata-rule-term-type-selector');
    chataSelectTermType.appendChild(spanBubbleIcon);
    chataSelectTermType.appendChild(popupQuery);


    ruleContainer.inputContainer1 = inputContainer1;
    ruleContainer.chataSelect = chataSelect;
    ruleContainer.secondContainer = secondContainer;
    ruleContainer.chataRuleDeleteBtn = chataRuleDeleteBtn;
    ruleContainer.appendChild(inputContainer1);
    ruleContainer.appendChild(chataSelect);
    ruleContainer.appendChild(secondContainer);
    ruleContainer.appendChild(chataRuleDeleteBtn);
    ruleContainer.setAttribute('data-uuid', uuid);


    if(expression.length){
        queryInput.input.value = expression[0]
        ruleContainer.conditionValue = expression[1];
        chataSelect.conditionElement.innerHTML = expression[1];
        if(expression[1] !== 'Exists'){
            queryInput2.input.value = expression[2]
        }else{
            ruleContainer.conditionValue = '∃';
            chataSelect.conditionElement.innerHTML = '∃';
            secondContainer.style.visibility = 'hidden';
            secondContainer.style.display = 'none';
        }
    }

    return ruleContainer;
}

function ConditionGroup(step1, parent, parentSelect, first=false, ruleLines={}){
    var groupWrapper = document.createElement('div');
    var groupContainer = document.createElement('div');
    var ruleContainer = document.createElement('div');
    var chataSelect = document.createElement('div');
    var secondContainer = document.createElement('div');
    var chataSelectTermType = document.createElement('div');
    var uuid = uuidv4();
    var groupValues = {
        id: uuid,
        term_type: 'group',
        condition: 'AND'
    }
    if(ruleLines.id){
        groupValues.id = ruleLines.id
        groupValues.term_type = ruleLines.term_type
        groupValues.condition = ruleLines.condition
    }
    this.groupLines = [];
    var obj = this;
    var spanBubbleIcon = htmlToElement(`
        <span class="chata-icon rule-input-select-bubbles-icon">
            ${INPUT_BUBBLES}
        </span>
    `);
    var onChangeAndOr = (evt) => {
        if(evt.target.textContent === 'ALL')groupValues.condition = 'AND';
        else groupValues.condition = 'OR';
    }

    var onDeleteLine = (evt, elem) => {
        let index;
        var uuid = elem.dataset.uuid;
        for (var i = 0; i < obj.groupLines.length; i++) {
            if(obj.groupLines[i].dataset.uuid === uuid){
                index = i;
                break;
            }
        }
        obj.groupLines.splice(index, 1);
        groupContainer.removeChild(elem);
        checkStep1(parent);
        step1.stepContentContainer.style.height = getHeightForChildrens(
            step1.stepContentContainer
        ) + 'px';
    }

    var onSelectRule = () => {
        checkStep1(parent);
    }

    var ruleAndOrSelect = notificationRuleAndOrSelect(
        ' conditions', onChangeAndOr
    );
    if(groupValues.condition === 'OR'){
        ruleAndOrSelect.radio.toggleButtons('OR');
    }
    var notificationGroupDeleteBtn = htmlToElement(`
        <div
            class="chata-notification-group-delete-btn"
            <span data-test="chata-icon" class="chata-icon">
                ${INPUT_DELETE}
            </span>
        </div>
    `);

    var notificationRuleAddBtn = document.createElement('div');
    notificationRuleAddBtn.classList.add('notification-rule-btn-container');

    var addRuleButton = htmlToElement(`
        <div class="chata-notification-rule-add-btn">
            <span class="chata-icon chata-notification-add-icon">
                ${ADD_GROUP}
            </span>
        </div>
    `)
    notificationRuleAddBtn.appendChild(addRuleButton);
    groupWrapper.notificationRuleAddBtn = notificationRuleAddBtn;
    groupWrapper.classList.add('notification-group-wrapper');
    let andOrBreak = notificationAndOrBreak(first, parentSelect.operator);

    notificationGroupDeleteBtn.onclick = function(evt){
        parent.removeChild(groupWrapper);
        var groups = document.getElementsByClassName(
            'notification-group-wrapper'
        );
        if(groups.length >= 1){
            groups[0].setAsFirtsAndOrBreak();
        }
        if(groups.length > 1){
            groups[0].showNotificationAndOrBreak();
        }
        showLeftAndOr(parentSelect, parent);
        checkStep1(parent);
        step1.stepContentContainer.style.height = getHeightForChildrens(
            step1.stepContentContainer
        ) + 'px';
    }

    addRuleButton.onclick = function(evt){
        var newGroupLine = new GroupLine({
            onDeleteLine: onDeleteLine,
            onSelectRule: onSelectRule
        });
        obj.groupLines.push(newGroupLine);
        groupContainer.insertBefore(newGroupLine, notificationRuleAddBtn);
        checkStep1(parent);
        step1.stepContentContainer.style.height = getHeightForChildrens(
            step1.stepContentContainer
        ) + 'px';
    }

    groupWrapper.setAsFirtsAndOrBreak = function(){
        var groups = document.getElementsByClassName(
            'notification-group-wrapper'
        );
        var newAndOrBreak = notificationAndOrBreak(
            true, parentSelect.operator
        );
        groupWrapper.replaceChild(
            newAndOrBreak, groupWrapper.notificationAndOrBreak
        );
        groupWrapper.notificationAndOrBreak = newAndOrBreak;
    }

    groupWrapper.isValid = function(){
        var lines = obj.groupLines;
        if(lines.length === 0){
            return false;
        }
        for (var i = 0; i < lines.length; i++) {
            if(lines[i].isEmpty()){
                return false;
            }
        }
        return true;
    }

    groupWrapper.notificationAndOrBreak = andOrBreak;
    groupWrapper.appendChild(andOrBreak);
    groupWrapper.hideNotificationAndOrBreak = function(){
        groupWrapper.notificationAndOrBreak.style.visibility = 'hidden';
    }
    groupWrapper.showNotificationAndOrBreak = function(){
        groupWrapper.notificationAndOrBreak.style.visibility = 'visible';
    }
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
    if(ruleLines.parsedLines){
        ruleLines.parsedLines.map((line) => {
            var groupLine = new GroupLine({
                onDeleteLine: onDeleteLine,
                onSelectRule: onSelectRule
            }, line)

            obj.groupLines.push(groupLine)
            groupContainer.appendChild(groupLine);
        })
    }else{
        var defaultGroup = new GroupLine({
            onDeleteLine: onDeleteLine,
            onSelectRule: onSelectRule
        });
        obj.groupLines.push(defaultGroup);
        groupContainer.appendChild(defaultGroup);
    }

    groupWrapper.getLines = () => {
        return obj.groupLines;
    }

    groupWrapper.getValues = () => {
        return groupValues;
    }

    groupContainer.appendChild(ruleAndOrSelect);
    groupContainer.appendChild(notificationGroupDeleteBtn);
    groupContainer.appendChild(notificationRuleAddBtn);
    groupWrapper.appendChild(groupContainer);

    return groupWrapper;
}

function getHeightForChildrens(parent){
    var child = parent.childNodes;
    var totalH = 0
    for (var i = 0; i < child.length; i++) {
        totalH += child[i].offsetHeight;
    }

    return totalH;
}

function ChataModalStep(title, nStep, subtitle=''){
    var step = document.createElement('div');
    var titleEl = document.createElement('div');
    var stepContent = document.createElement('div');
    var contentWrapper = document.createElement('div');
    var stepDot = document.createElement('div');
    var stepContentContainer = document.createElement('div');
    step.classList.add('chata-step-container');
    titleEl.classList.add('chata-step-title');
    stepContent.classList.add('chata-step-content');
    stepDot.classList.add('chata-step-dot');
    stepDot.innerHTML = nStep;
    stepContentContainer.classList.add('chata-step-content-container')
    stepContentContainer.style.height = '10px';
    titleEl.innerHTML = title;

    step.closeStep = () => {
        step.classList.remove('active');
        stepContentContainer.style.height = '10px';
    }

    step.expand = () => {
        step.classList.add('active');
        stepContentContainer.style.height = getHeightForChildrens(
            stepContentContainer
        ) + 'px';
    }

    titleEl.onclick = (evt) => {
        var steps = document.querySelectorAll('.chata-step-container');
        for (var i = 0; i < steps.length; i++) {
            if(step == steps[i])continue;
            steps[i].closeStep();
        }
        if(!step.classList.contains('active')){
            step.expand();
        }else{
            step.closeStep();
        }
    }

    step.appendChild(titleEl);
    if(subtitle !== ''){
        var subtitleEl = document.createElement('div');
        subtitleEl.classList.add('chata-step-subtitle');
        subtitleEl.innerHTML = subtitle;
        stepContentContainer.appendChild(subtitleEl);
    }

    stepContent.appendChild(contentWrapper);
    stepContentContainer.appendChild(stepContent);
    step.appendChild(stepContentContainer);
    step.appendChild(stepDot);
    step.addElement = (elem) => {
        contentWrapper.appendChild(elem);
    }
    step.removeElement = (elem) => {
        contentWrapper.removeChild(elem);
    }
    step.addClass = (className) => {
        contentWrapper.classList.add(className);
    }

    step.addContent = (elem) => {
        stepContent.appendChild(elem);
    }

    step.findElement = (selector) => {
        return contentWrapper.querySelector(selector);
    }

    step.titleEl = titleEl;
    step.stepContentContainer = stepContentContainer;

    return step;
}

function getNotificationValues(){
    return {
        expression: [
            ...this.step1.getValues()
        ],
        ...this.step2.getValues(),
        ...this.step3.getValues(),
        // ...this.step4.getValues()
    }
}

function getStep4Values(){
    var title = this.querySelector('.autoql-vanilla-notification-title-input');
    var message = this.querySelector('.autoql-vanilla-notification-message');
    return {
        title: title.value,
        message: message.value
    };
}

function getStep3Values(){
    var input = this.querySelector('.autoql-vanilla-query-return-input');
    return {
        query: input.value
    };
}

function getStep2Values(){
    var fEvent = this.querySelector('[data-frequency-event]');
    var fValue = this.querySelector('[data-frequency-value]');
    var values = {
        notification_type: fEvent.dataset.frequencyEvent,
        reset_period: null
    }

    if(fValue)values.reset_period = fValue.dataset.frequencyValue
    return values;

}

function getStep1Values(){
    var groups = this.querySelectorAll('.notification-group-wrapper');
    var operators = this.querySelectorAll('.notification-and-or-text');
    var expression = [];

    for (var i = 0; i < groups.length; i++) {
        var condition = 'AND';
        var group = groups[i];
        var lines = group.getLines();
        if(operators[i]){
            condition = operators[i].textContent
        }else{
            condition = 'TERMINATOR';
        }

        var termValue = {
            id: uuidv4(),
            term_type: 'group',
            condition: condition,
            term_value: []
        }

        lines.map((l, index) => {
            var termGroup = {
                ...group.getValues(),
                term_value: []
            }
            if(index == lines.length-1){
                termGroup.condition = 'TERMINATOR';
            }

            termGroup.term_value.push(
                ...l.getValues()
            )
            termValue.term_value.push(termGroup)
        })

        expression.push(termValue)
    }

    return expression;
}
