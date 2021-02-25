import {
    getHeightForChildrens
} from '../../Utils'

export function ChataModalStep(title, nStep, subtitle=''){
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

    titleEl.onclick = () => {
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
