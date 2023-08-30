import './StepContainer.scss';

export function StepContainer() {
  const container = document.createElement('div');

  container.classList.add('autoql-vanilla-steps-hoz-container');

  this.createStep = (title, number) => {
    const stepContainer = document.createElement('div');
    const step = document.createElement('div');
    const dot = document.createElement('div');
    const titleContainer = document.createElement('div');
    const stepTitle = document.createElement('span');

    stepContainer.classList.add('autoql-vanilla-step-hoz-container');
    step.classList.add('autoql-vanilla-step-hoz');
    dot.classList.add('autoql-vanilla-step-hoz-dot');
    titleContainer.classList.add('autoql-vanilla-step-hoz-title-container');
    stepTitle.classList.add('autoql-vanilla-step-hoz-title');

    stepTitle.textContent = title;
    dot.textContent = number;

    step.appendChild(dot);
    titleContainer.appendChild(stepTitle);
    step.appendChild(titleContainer);
    stepContainer.appendChild(step);

    return stepContainer;
  }

  this.conditionsStep = this.createStep('Set Up Conditions', '1');
  this.timingStep = this.createStep('Configure Timing', '2');
  this.appearanceStep = this.createStep('Customize Appearance', '3');

  this.conditionsStep.classList.add('autoql-vanilla-active');
  this.timingStep.classList.add('autoql-vanilla-disabled');
  this.appearanceStep.classList.add('autoql-vanilla-disabled');


  container.appendChild(this.conditionsStep);
  container.appendChild(this.timingStep);
  container.appendChild(this.appearanceStep);

  return container;
}