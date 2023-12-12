import { QUERY_TERM_TYPE, createDataAlert } from "autoql-fe-utils";
import { Modal } from "../../../Modal";
import { ChataConfirmDialog } from "../ChataConfirmDialog/ChataConfirmDialog";
import { AppearanceStep } from "./AppearanceStep/AppearanceStep";
import { ConditionsStep } from "./ConditionsStep";
import { TimingStep } from "./TimingStep/TimingStep";
import { StepContainer } from "./StepContainer";
import { SummaryFooter } from "./SummaryFooter";
import { AntdMessage } from "../../../Antd";
import { uuidv4 } from "../../../Utils";

import './DataAlertCreationModal.scss';

export function DataAlertCreationModal({ queryResponse, authentication }) {
  const container = document.createElement('div');
  const stepContentContainer = document.createElement('div');
  const summaryFooter = new SummaryFooter({ queryText: queryResponse.data.text })

  this.steps = [];
  this.currentStepIndex = 0;

  const confirmDialogProps = {
    title: 'Are you sure you want to leave this page?',
    message: 'All unsaved changes will be lost.',
    onDiscard: () => {
      modal.closeAnimation();
      setTimeout(() => {
        modal.hideContainer();
      }, 250);
    }
  }
  
  this.onDiscard = () => {
    new ChataConfirmDialog({ ...confirmDialogProps });
  }
  
  const modal = new Modal(
    {
      withFooter: true,
      destroyOnClose: true,
    },
    () => {},
    this.onDiscard
  );

  this.createSpinner = () => {
    const spinner = document.createElement('div');
    spinner.classList.add('autoql-vanilla-spinner-loader');
    spinner.classList.add('hidden');

    return spinner;
  }
    
  this.createSteps = () => {
    const {
      columns,
      count_rows
    } = queryResponse.data;

    const isSingleResponse = columns?.length === 1 && count_rows === 1;

    this.steps.push({
      view: new TimingStep({ queryResponse }),
      withConnector: isSingleResponse,
      isActive: !isSingleResponse,
      title: 'Configure Timing',
    });

    this.steps.push({
      view: new AppearanceStep({ queryResponse }),
      withConnector: true,
      isActive: false,
      title: 'Customize Appearance',
    });

    if(isSingleResponse) {
      this.steps.unshift({
        view: new ConditionsStep({ queryResponse }),
        withConnector: false,
        isActive: true,
        title: 'Set Up Conditions',
      });
    }
    this.addViewSteps();
    this.stepContainer = new StepContainer({ steps: this.steps });
    return this.stepContainer;
  }

  this.addViewSteps = () => {
    this.steps.forEach((step) => {
      stepContentContainer.appendChild(step.view);
      if(!step.isActive) step.view.classList.add('autoql-vanilla-hidden');
    })
  }

  this.createButton = (text, classes) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('autoql-vanilla-chata-btn');
    button.classList.add('autoql-vanilla-large');

    classes.forEach(className => button.classList.add(className));

    return button;
  }

  this.handleNextStep = () => {
    const currentStep = this.steps[this.currentStepIndex++];
    const nextStep = this.steps[this.currentStepIndex];
    currentStep.view.classList.add('autoql-vanilla-hidden');
    nextStep.view.classList.remove('autoql-vanilla-hidden');
    this.stepContainer.enableStep(this.currentStepIndex);
    this.updateFooter();
    this.validateNextButton();
  }

  this.handlePreviousStep = () => {
    this.stepContainer.disableStep(this.currentStepIndex);
    const currentStep = this.steps[this.currentStepIndex--];
    const previousStep = this.steps[this.currentStepIndex];
    currentStep.view.classList.add('autoql-vanilla-hidden');
    previousStep.view.classList.remove('autoql-vanilla-hidden');
    this.updateFooter();
  }

  this.getDefaultExpression = () => {
    return [{
      condition: 'EXISTS',
      filters: [],
      id: uuidv4(),
      session_filter_locks: [],
      term_type: QUERY_TERM_TYPE,
      term_value: queryResponse.data.text,
      user_selection: [],
    }];
  }

  this.handleSave = async () => {
    try {
      this.spinner.classList.remove('hidden');
      const values = this.steps.map(step  => step.view.getValues()).reduce((r, c) => Object.assign(r, c));

      const dataAlert = {
        data_return_query: queryResponse.data.text,
        ...values
      }

      if(!dataAlert?.expression) {
        dataAlert.expression = this.getDefaultExpression();
      }
      
      await createDataAlert({
        dataAlert,
        ...authentication
      });
      modal.close();
      new AntdMessage('Data Alert created!', 3000); 
    } catch (error) {
      this.spinner.classList.add('hidden');
    }
  }

  this.updateFooter = () => {
    const { length } = this.steps;
    summaryFooter.classList.remove('autoql-vanilla-hidden');

    if((this.currentStepIndex + 1) >= length) {
      this.btnNextStep.innerHTML = '';
      this.btnNextStep.appendChild(this.spinner);
      this.btnNextStep.appendChild(document.createTextNode('Finish & Save'));
      this.btnNextStep.onclick = this.handleSave;
    } else {
      this.btnNextStep.textContent = 'Next';
      this.btnNextStep.onclick = this.handleNextStep;
    }

    if(this.currentStepIndex === 0) {
      this.btnBack.classList.add('autoql-vanilla-hidden');
      summaryFooter.classList.add('autoql-vanilla-hidden');
    } else {
      this.btnBack.classList.remove('autoql-vanilla-hidden');
    }
  } 

  this.createFooter = () => {
    const btnCancel = this.createButton(
      'Cancel',
      ['autoql-vanilla-default', 'autoql-vanilla-btn-no-border']
    );
    this.btnBack = this.createButton('Back', ['autoql-vanilla-default']);
    this.btnNextStep = this.createButton('Next', ['autoql-vanilla-primary']);
    this.spinner = this.createSpinner();
    const buttonContainerLeft = document.createElement('div');
    const modalFooter = document.createElement('div');
    
    btnCancel.onclick = this.onDiscard;
    this.btnNextStep.onclick = this.handleNextStep;
    this.btnBack.onclick = this.handlePreviousStep;
    
    buttonContainerLeft.appendChild(btnCancel);
    buttonContainerLeft.appendChild(this.btnBack);
    buttonContainerLeft.appendChild(this.btnNextStep);
    modalFooter.appendChild(buttonContainerLeft);
    
    this.btnBack.classList.add('autoql-vanilla-hidden');
    this.btnNextStep.classList.add('autoql-vanilla-disabled');
    modalFooter.classList.add('autoql-vanilla-modal-footer');

    return modalFooter;
  }

  this.validateNextButton = () => {
    const currentStep = this.steps[this.currentStepIndex];
    if(currentStep.view.isValid()) {
      this.btnNextStep.classList.remove('autoql-vanilla-disabled');
    } else {
      this.btnNextStep.classList.add('autoql-vanilla-disabled');
    }
  }

  container.addEventListener('keyup', () => {
    this.validateNextButton();
  });

  stepContentContainer.classList.add('autoql-vanilla-data-alert-modal-step-content-container');

  container.appendChild(this.createSteps());
  container.appendChild(stepContentContainer);
  modal.chataModal.classList.add('autoql-vanilla-data-alert-creation-modal-full-size');
  modal.setTitle('Create Data Alert');
  modal.addFooterElement(summaryFooter);
  modal.addFooterElement(this.createFooter());
  modal.addView(container);

  this.validateNextButton();

  return modal;
}