import {
    getHeightForChildrens
} from '../../Utils'
import {
    $dom
} from '../../Dom'

export function ChataModalStep(title, nStep, subtitle=''){
    var step = $dom('div', {
        classes: ['chata-step-container']
    });
    var titleEl = $dom('div', {
        classes: ['chata-step-title']
    });
    var stepContent = $dom('div', {
        classes: ['chata-step-content']
    });
    var contentWrapper = $dom('div');
    var stepDot = $dom('div', {
        classes: ['chata-step-dot']
    });
    var stepContentContainer = $dom('div', {
        classes: ['chata-step-content-container']
    });

    stepDot.innerHTML = nStep;
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
        var subtitleEl = $dom('div', {
            classes: ['chata-step-subtitle']
        });
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
