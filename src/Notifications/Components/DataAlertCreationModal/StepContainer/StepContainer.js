import './StepContainer.scss';

export function StepContainer({ steps }) {
  const container = document.createElement('div');
  this.stepCount = 1;
  container.classList.add('autoql-vanilla-steps-hoz-container');

  this.createStep = ({ title, isActive, withConnector=true }) => {
    const stepContainer = document.createElement('div');
    const step = document.createElement('div');
    const dot = document.createElement('div');
    const titleContainer = document.createElement('div');
    const stepTitle = document.createElement('span');

    if(withConnector) {
      const connectorContainer = document.createElement('div');
      const connector = document.createElement('span');
      connectorContainer.classList.add('autoql-vanilla-step-connector-container');
      connector.classList.add('autoql-vanilla-step-connector');

      connectorContainer.appendChild(connector);
      stepContainer.appendChild(connectorContainer);
    }
    stepContainer.classList.add('autoql-vanilla-step-hoz-container');
    step.classList.add('autoql-vanilla-step-hoz');
    dot.classList.add('autoql-vanilla-step-hoz-dot');
    titleContainer.classList.add('autoql-vanilla-step-hoz-title-container');
    stepTitle.classList.add('autoql-vanilla-step-hoz-title');

    stepTitle.textContent = title;
    dot.textContent = this.stepCount.toString();
    this.stepCount++;

    step.appendChild(dot);
    titleContainer.appendChild(stepTitle);
    step.appendChild(titleContainer);
    stepContainer.appendChild(step);
    
    if(isActive) {
      stepContainer.classList.add('autoql-vanilla-active');
    } else {
      stepContainer.classList.add('autoql-vanilla-disabled');
    }

    return stepContainer;
  }

  container.enableStep = (stepIndex) => {
    const step = container.children[stepIndex];
    step.classList.add('autoql-vanilla-active');
    step.classList.remove('autoql-vanilla-disabled');
  }

  container.disableStep = (stepIndex) => {
    const step = container.children[stepIndex];
    step.classList.remove('autoql-vanilla-active');
    step.classList.add('autoql-vanilla-disabled');
  }

  steps.forEach((step) => {
    const stepView = this.createStep({
      ...step
    });
    container.appendChild(stepView);
  });

  return container;
}