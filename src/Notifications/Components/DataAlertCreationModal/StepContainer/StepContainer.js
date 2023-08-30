import './StepContainer.scss';

export function StepContainer() {
  const container = document.createElement('div');
  this.stepCount = 1;
  container.classList.add('autoql-vanilla-steps-hoz-container');

  this.createStep = ({ title, number, withConnector=true }) => {
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

    return stepContainer;
  }

  this.conditionsStep = this.createStep({
    title: 'Set Up Conditions',
    withConnector: false
  });
  
  this.timingStep = this.createStep({
    title: 'Configure Timing',
  });
  
  this.appearanceStep = this.createStep({
    title: 'Customize Appearance',
  });

  this.conditionsStep.classList.add('autoql-vanilla-active');
  this.timingStep.classList.add('autoql-vanilla-disabled');
  this.appearanceStep.classList.add('autoql-vanilla-disabled');

  container.appendChild(this.conditionsStep);
  container.appendChild(this.timingStep);
  container.appendChild(this.appearanceStep);

  return container;
}