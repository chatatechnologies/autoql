import { htmlToElement, uuidv4 } from '../Utils'
import {
    NOTEBOOK,
    INPUT_BUBBLES,
    INPUT_DELETE,
    WARNING_TRIANGLE,
    CHECK,
} from '../Svg'
import { convert } from '../RuleParser'
import {
    ChataInput,
    InputContainer,
    ChataRadio,
} from '../ChataComponents'
import {
    ChataModalStep,
    FrequencyBox,
    PopupContainer,
    TimezoneSelector,
    InfoIcon
} from './NotificationComponents'
import { refreshTooltips } from '../Tooltips'
import {
    apiCallPost,
    getHeightForChildrens
} from '../Utils'
import { strings } from '../Strings'

export function NotificationSettingsModal(options, mode='create', rule={}){
    var wrapper = document.createElement('div');
    wrapper.mode = mode;
    wrapper.parentOptions = options
    var frequencyBox = FrequencyBox(
        `You will be notified as soon as this happens,
        any time this happens. Scanning will happen continuously.`
    );
    var loader = htmlToElement(`
        <div class="autoql-vanilla-spinner-loader hidden"></div>
    `)
    wrapper.classList.add('chata-steps-container');
    var step1 = new ChataModalStep(strings.setupDataAlert,'1',);
    var step2 = new ChataModalStep(strings.notificationPreferences, '2');
    var step3 = new ChataModalStep(
        strings.composeAlertMessage,
        '3',
        ''
    );

    // STEP 1
    var step1ButtonContainer = document.createElement('div');
    step1ButtonContainer.classList.add('autoql-vanilla-step-btn-container')
    var titleContainer = new InputContainer(
        ['chata-notification-display-name-input']
    )
    var infoIconTitle = new InfoIcon('This will be visible to anyone who gets notified when this Alert is triggered.')

    var titleInput = new ChataInput('input', {
        placeholder: strings.dataAlertNamePlaceholder,
        maxlength: '50',
        type: "single"
    }, NOTEBOOK);
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
    titleContainer.appendChild(titleInput.input);
    titleContainer.appendChild(titleInput.spanIcon);
    titleContainer.appendChild(infoIconTitle);

    var ruleContainer = document.createElement('div');
    var checkContainer = htmlToElement(`
        <span class="autoql-vanilla-icon"></span>
    `)
    var step1NextButton = new StepButton(
        'autoql-vanilla-chata-btn primary large autoql-vanilla-first-step-next-btn',
        strings.next,
        () => {
            step1.closeStep()
            step2.expand()
        },
        isButtonDisable
    )
    var newGroupLine = new GroupLine({
        parentOptions: wrapper.parentOptions,
        step: step1,
        stepButton: step1NextButton,
        checkContainer: checkContainer
    });
    ruleContainer.appendChild(newGroupLine);
    var onChangeAndOr = () => {
        parentSelect.operator = updateAndOr(parentSelect);
    }
    var parentSelect = notificationRuleAndOrSelect(
        'of the following conditions are met:',
        onChangeAndOr
    );
    const validateFn = async () => {
        const {
            domain,
            apiKey
        } = wrapper.parentOptions.authentication
        checkContainer.innerHTML = ''
        const url = `${domain}/autoql/api/v1/data-alerts/validate?key=${apiKey}`
        loader.classList.remove('hidden')
        var response = await apiCallPost(
            url,
            {expression: newGroupLine.getValues()},
            wrapper.parentOptions
        )
        if(checkContainer._tippy){
            checkContainer._tippy.destroy()
        }
        loader.classList.add('hidden')
        if(response.status != 200){
            checkContainer.classList.remove(
                'autoql-vanilla-expression-valid-checkmark'
            )
            checkContainer.classList.add(
                'autoql-vanilla-expression-invalid-message'
            )
            checkContainer.innerHTML = WARNING_TRIANGLE;
            checkContainer.appendChild(
                document.createTextNode(response.data.message)
            )
            step1.classList.remove('complete')
            step1.classList.add('error')
            step1NextButton.classList.add('disabled')
        }else{
            checkContainer.setAttribute(
                'data-tippy-content', 'Expression is valid'
            )
            checkContainer.innerHTML = CHECK;
            checkContainer.classList.add(
                'autoql-vanilla-expression-valid-checkmark'
            )
            checkContainer.classList.remove(
                'autoql-vanilla-expression-invalid-message'
            )
            step1.classList.add('complete')
            step1.classList.remove('error')
            step1NextButton.classList.remove('disabled')
            refreshTooltips()
        }
    }

    var isButtonDisable = mode === 'create'
    var validateButton = new StepButton(
        'autoql-vanilla-chata-btn primary large',
        strings.validateAlert,
        validateFn,
        false
    )
    validateButton.innerHTML = ''
    validateButton.classList.add('autoql-vanilla-validate-query')
    validateButton.appendChild(loader)
    validateButton.appendChild(document.createTextNode(strings.validateAlert))
    step1ButtonContainer.appendChild(checkContainer)
    step1ButtonContainer.appendChild(validateButton)
    // step1ButtonContainer.appendChild(step1NextButton)
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
    step1.addElement(htmlToElement(`
        <p>${strings.dataAlertName}<p/>
    `))
    step1.addElement(titleContainer);
    step1.addElement(htmlToElement(`
        <p>${strings.notifyWhen}<p/>
    `))
    step1.addElement(parentSelect);
    step1.addElement(ruleContainer);
    step1.addElement(step1ButtonContainer)
    ruleContainer.step = step1;

    step1.onkeyup = function(){
        checkStep1(ruleContainer);
    }

    // STEP 2
    var selectFrequency = document.createElement('div')
    var relativeDiv = document.createElement('div')
    var step2Wrapper = document.createElement('div')
    relativeDiv.style.position = 'relative'
    selectFrequency.classList.add('chata-select')
    var frequencyValue = document.createElement('div')

    frequencyValue.classList.add('autoql-vanilla-frequency-value')
    frequencyValue.indexValue = 1

    var frequencySettingsContainer = document.createElement('div')
    frequencySettingsContainer.classList.add('frequency-settings-container')

    step2.addClass('notification-frequency-step')
    step2Wrapper.classList.add('autoql-vanilla-frequency-step')
    frequencySettingsContainer.appendChild(htmlToElement(`
        <p>
            ${strings.notificationPreferencesMessage}
        </p>
    `))

    var repeatOptions = [
        {
            label: strings.frequencyEvery,
            value: '',
            checked: false
        },
        {
            label: strings.frequencyDaily,
            value: 'DAY',
            checked: false
        },
        {
            label: strings.frequencyWeek,
            value: 'WEEK',
            checked: false
        },
        {
            label: strings.frequencyMonth,
            value: 'MONTH',
            checked: false
        }
    ]

    if(mode === 'edit'){
        if(rule.notification_type != 'CONTINUOUS'){
            repeatOptions = setRadioSelection(repeatOptions, rule.reset_period)
        }else{
            repeatOptions[0].checked = true
        }
    }

    var repeatRadio = new ChataRadio(repeatOptions, (evt) => {
        var timezone = rule.time_zone
        var resetDate = rule.reset_date

        frequencyBox.style.visibility = 'visible';
        frequencyBox.setMessage(evt.target.value, timezone, resetDate)
        step2.stepContentContainer.style.height = getHeightForChildrens(
            step2.stepContentContainer
        ) + 'px';
        checkStep2(step2);
    })

    repeatRadio.classList.add('reset_period')

    var triggerOptions = [
        {
            label: 'Once, when this happens',
            value: 'PERIODIC',
            checked: false
        },
        {
            label: 'Every time this happens',
            value: 'CONTINUOUS',
            checked: false
        }
    ]

    if(mode == 'edit'){
        triggerOptions = setRadioSelection(
            triggerOptions, rule.notification_type
        )

    }

    var triggerRadio = new ChataRadio(triggerOptions, () => {
        checkStep2(step2);
    })

    triggerRadio.classList.add('notification_type')

    frequencySettingsContainer.appendChild(repeatRadio)

    var step2NextButton = new StepButton(
        'autoql-vanilla-chata-btn primary large',
        strings.next,
        () => {
            step2.closeStep()
            step3.expand()
        },
        isButtonDisable
    )
    var step2PrevButton = new StepButton(
        'autoql-vanilla-chata-btn default large',
        strings.back,
        () => {
            step2.closeStep()
            step1.expand()
        },
        isButtonDisable
    )
    let timez = undefined
    if(rule.time_zone)timez = rule.time_zone
    var timezoneSelector = new TimezoneSelector(timez)
    var step2ButtonContainer = document.createElement('div');
    step2ButtonContainer.classList.add('autoql-vanilla-step-btn-container')
    step2ButtonContainer.appendChild(step2PrevButton);
    step2ButtonContainer.appendChild(step2NextButton);

    step2Wrapper.appendChild(frequencySettingsContainer);
    // step2Wrapper.appendChild(frequencyBox);
    step2.addElement(step2Wrapper)
    step2.addElement(timezoneSelector)
    step2.addContent(step2ButtonContainer);
    step2.timezoneSelector = timezoneSelector

    var messageContainer = new InputContainer(
        ['chata-notification-message-input']
    )
    var messageArea = new ChataInput('textarea', {
        placeholder: strings.notificationMessagePlaceholder,
        maxlength: '200',
        type: 'multi',
        style: "margin-top: 0px; margin-bottom: 0px; height: 120px;"
    });
    titleInput.input.classList.add('autoql-vanilla-notification-title-input');
    messageArea.input.classList.add('autoql-vanilla-notification-message');
    messageContainer.appendChild(messageArea.input);

    step3.addElement(htmlToElement(`
        <p>${strings.optional}</p>
    `))
    step3.addElement(messageContainer);
    var step3PrevButton = new StepButton(
        'autoql-vanilla-chata-btn default large',
        strings.back,
        () => {
            step2.expand()
            step3.closeStep()
        },
        isButtonDisable
    )
    var step3ButtonContainer = document.createElement('div');
    step3ButtonContainer.classList.add('autoql-vanilla-step-btn-container')
    step3ButtonContainer.appendChild(step3PrevButton);
    step3.addElement(step3ButtonContainer)

    wrapper.appendChild(step1);
    wrapper.appendChild(step2);
    wrapper.appendChild(step3);

    const loadRules = async () => {
        var ruleGroups = convert(rule.expression, false);
        await ruleGroups.map(() => {
            newGroupLine.setExpression(ruleGroups)
            validateFn()
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
        step2.classList.add('complete');
    }

    if(mode === 'edit'){
        loadRules();
        setFrequency();
        frequencyBox.setMessage(
            rule.reset_period, rule.time_zone, rule.reset_date
        )
        titleInput.input.value = rule.title;
        messageArea.input.value = rule.message;
        step3.classList.add('complete');
    }else{
        frequencyValue.innerHTML = 'Select a frequency';
        frequencyValue.style.color = 'rgba(0, 0, 0, 0.4)';
        frequencyValue.style.fontStyle = 'italic';
    }

    wrapper.isValid = () => {
        var steps = wrapper.querySelectorAll('.chata-step-container')
        var isValid = true

        for (var i = 0; i < steps.length; i++) {
            if(!steps[i].classList.contains('complete')){
                isValid = false
                break;
            }
        }

        return isValid
    }

    wrapper.addEventListener('click', () => {
        wrapper.checkSteps()
    })

    wrapper.addEventListener('keyup', () => {
        wrapper.checkSteps()
    })

    // ruleContainer.appendChild(step1ButtonContainer);
    step1.getValues = getStep1Values;
    step2.getValues = getStep2Values;
    step3.getValues = getStep3Values;
    // step4.getValues = getStep4Values;


    wrapper.step1 = step1;
    wrapper.step2 = step2;
    wrapper.step3 = step3;
    // wrapper.step4 = step4;
    wrapper.getValues = getNotificationValues;
    refreshTooltips()
    return wrapper;
}

function setRadioSelection(options, selectedOption){
    for (var i = 0; i < options.length; i++) {
        if(options[i].value === selectedOption){
            options[i].checked = true;
            break;
        }
    }

    return options;
}

function StepButton(classValue, text, onClick, isDisabled=false){
    var nButton = htmlToElement(`
        <button
            class="${classValue}">
            ${text}
        </button>
    `)

    if(isDisabled)nButton.classList.add('disabled')

    nButton.onclick = (evt) => {
        onClick(evt)
    }

    return nButton
}

function checkStep2(step2){
    step2.classList.add('complete')
    var buttons = step2.querySelectorAll('.autoql-vanilla-chata-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('disabled')
    }

}

function checkStep1(ruleContainer){
    var groups = ruleContainer.step.getElementsByClassName(
        'notification-group-wrapper'
    );
    var input = ruleContainer.step.querySelector(
        '.autoql-vanilla-notification-title-input'
    );

    var button = ruleContainer.step.querySelector(
        '.autoql-vanilla-first-step-next-btn'
    )

    var valid = true
    for (var i = 0; i < groups.length; i++) {
        if(!groups[i].isValid()){
            valid = false
            break;
        }
    }

    if(groups.length === 0 || input.value === ''){
        valid = false;
    }

    if(valid){
        ruleContainer.step.classList.add('complete');
        button.classList.remove('disabled')
    }else{
        ruleContainer.step.classList.remove('complete');
        button.classList.add('disabled')
    }
}

function showLeftAndOr(parentSelect){
    var groups = document.getElementsByClassName('notification-group-wrapper');
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
    div.innerHTML = 'Notify me when';
    div.appendChild(radio);
    div.appendChild(document.createTextNode(text));
    div.radio = radio;
    return div;
}

function ruleTermError() {
    var error = htmlToElement(`
        <div class="rule-term-validation-error">
            <span class="chata-icon warning-triangle">
                ${WARNING_TRIANGLE}
            </span>
            That query is invalid. Try entering a different query.
        </div>
    `)

    return error
}

function GroupLine(params, expression=[]){
    var secondContainer = document.createElement('div');
    var chataSelectTermType = document.createElement('div');
    var chataSelect = document.createElement('div');
    var ruleContainer = document.createElement('div');
    var conditionValueSelect = document.createElement('div');
    var termError1 = new ruleTermError();
    var termError2 = new ruleTermError();
    var compareButton = document.createElement('button')
    conditionValueSelect.innerHTML = '>';
    var uuid = uuidv4();
    ruleContainer.conditionValue = '>';
    ruleContainer.termType = 'query';

    compareButton.classList.add('autoql-vanilla-chata-btn')
    compareButton.classList.add('default')
    compareButton.classList.add('large')
    compareButton.style.display = 'none'
    compareButton.textContent = strings.compareResult
    var chataRuleDeleteBtn = htmlToElement(`
        <span
            class="chata-icon chata-rule-delete-btn">
            ${INPUT_DELETE}
        </span>
    `);

    var inputContainer1 = new InputContainer([
        'chata-rule-input'
    ])

    var inputContainer2 = new InputContainer([
        'chata-rule-input'
    ])

    var queryInput = new ChataInput('input', {
        placeholder: strings.typeQueryPlaceholder,
        type: "single"
    }, null, false);

    var queryInput2 = new ChataInput('input', {
        placeholder: strings.typeQueryNumberPlaceholder,
        type: "single"
    }, null, false);


    var popup = PopupContainer([
        {text: '>', dataTip: 'Greater Than', active:true},
        {text: '<', dataTip: 'Less Than', active:false},
        {text: '=', dataTip: 'Equals', active:false},
        {text: '∃', dataTip: 'Greater Than', active:false}
    ]);

    queryInput.input.onkeydown = () => {
        params.step.classList.remove('complete')
        params.step.classList.remove('error')
        params.stepButton.classList.add('disabled')
        params.checkContainer.innerHTML = ''
    }

    queryInput2.input.onkeydown = () => {
        params.step.classList.remove('complete')
        params.step.classList.remove('error')
        params.stepButton.classList.add('disabled')
        params.checkContainer.innerHTML = ''
    }

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

    ruleContainer.setExpression = (expression) => {
        queryInput.input.value = expression[0]
        conditionValueSelect.innerHTML = expression[1]
        ruleContainer.conditionValue = expression[1]
        if(expression[1] === 'Exists'){
            chataRuleDeleteBtn.style.display = 'none'
            secondContainer.style.display = 'none';
            chataSelect.style.display = 'none'
            compareButton.style.display = 'block'
            ruleContainer.conditionValue = '∃'
            chataSelect.conditionElement.innerHTML = '∃';
        }else{
            queryInput2.input.value = expression[2]
        }
    }

    ruleContainer.getOperator = () => {
        switch (ruleContainer.conditionValue) {
            case '>':
                return 'GREATER_THAN'
            case '<':
                return 'LESS_THAN'
            case '=':
                return 'EQUALS'
            case '∃':
                return 'EXISTS'
            default:

        }
    }

    ruleContainer.getInputType = () => {
        var val = queryInput2.input.value;
        if(Number.isInteger(parseInt(val))){
            return 'constant'
        }else{
            return 'query'
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
                term_type: ruleContainer.getInputType(),
                condition: 'TERMINATOR',
                term_value: queryInput2.input.value
            }
            terms.push(constantValues)
        }

        return terms
    }

    chataRuleDeleteBtn.onclick = function(){
        chataRuleDeleteBtn.style.display = 'none'
        secondContainer.style.display = 'none';
        chataSelect.style.display = 'none'
        compareButton.style.display = 'block'
        ruleContainer.conditionValue = '∃'
        chataSelect.conditionElement.innerHTML = '∃';
    }

    compareButton.onclick = function(){
        compareButton.style.display = 'none'
        chataRuleDeleteBtn.style.display = 'block'
        secondContainer.style.display = 'block';
        chataSelect.style.display = 'block'
        ruleContainer.conditionValue = '>'
        chataSelect.conditionElement.innerHTML = '>';
    }

    chataSelect.onclick = function(){
        popup.toggleVisibility();
    }

    chataSelectTermType.onclick = function(){
        popupQuery.toggleVisibility();
    }

    inputContainer1.appendChild(queryInput.input);
    inputContainer1.appendChild(termError1);
    inputContainer2.appendChild(queryInput2.input);
    inputContainer2.appendChild(termError2);

    ruleContainer.classList.add('chata-notification-rule-container');
    secondContainer.classList.add('chata-rule-second-input-container');
    secondContainer.appendChild(inputContainer2);
    secondContainer.appendChild(termError2);


    chataSelect.classList.add('chata-select');
    chataSelect.classList.add('chata-rule-condition-select');
    chataSelect.appendChild(popup);
    chataSelect.appendChild(conditionValueSelect);
    chataSelect.conditionElement = conditionValueSelect;

    ruleContainer.inputContainer1 = inputContainer1;
    ruleContainer.chataSelect = chataSelect;
    ruleContainer.secondContainer = secondContainer;
    ruleContainer.chataRuleDeleteBtn = chataRuleDeleteBtn;
    ruleContainer.appendChild(inputContainer1);
    ruleContainer.appendChild(chataSelect);
    ruleContainer.appendChild(secondContainer);
    ruleContainer.appendChild(compareButton);
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

function getNotificationValues(){
    return {
        ...this.step1.getValues(),
        ...this.step2.getValues(),
        ...this.step3.getValues(),
    }
}

function getStep3Values(){
    var message = this.querySelector('.autoql-vanilla-notification-message');
    return {
        message: message.value
    };
}

function getStep2Values(){

    var reset = this.querySelector('.reset_period');
    var notificationType =
    reset.selectedValue == '' ? 'CONTINUOUS' : 'PERIODIC'
    var values = {
        notification_type: notificationType,
        reset_period: null,
        time_zone: this.timezoneSelector.getValue()
    }

    if(notificationType === 'PERIODIC'){
        values.reset_period = reset.selectedValue
    }

    return values;
}

function getStep1Values(){
    var ruleContainer = this.querySelector('.chata-notification-rule-container')
    var title = this.querySelector(
        '.autoql-vanilla-notification-title-input'
    ).value

    var ruleContainerValues = ruleContainer.getValues()

    return {
        expression: ruleContainer.getValues(),
        title: title,
        data_return_query: ruleContainerValues[0].term_value,
    }
}
