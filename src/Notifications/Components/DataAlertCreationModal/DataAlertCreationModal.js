import { Modal } from "../../../Modal";
import { ChataConfirmDialog } from "../ChataConfirmDialog/ChataConfirmDialog";
import { AppearanceStep } from "./AppearanceStep/AppearanceStep";
import { ConditionsStep } from "./ConditionsStep";
import './DataAlertCreationModal.scss';
import { StepContainer } from "./StepContainer";
import { TimingStep } from "./TimingStep/TimingStep";

export function DataAlertCreationModal({ queryResponse }) {
  const container = document.createElement('div');
  const stepContentContainer = document.createElement('div');
  
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
    
  this.createSteps = () => {
    const {
      columns,
      count_rows
    } = queryResponse.data;
    const steps = [];

    const isSingleResponse = columns?.length === 1 && count_rows === 1;

    steps.push({
      view: new TimingStep({ queryResponse }),
      withConnector: isSingleResponse,
      isActive: !isSingleResponse,
      title: 'Configure Timing',
    });

    steps.push({
      view: new AppearanceStep({ queryResponse }),
      withConnector: true,
      isActive: false,
      title: 'Customize Appearance',
    });

    if(isSingleResponse) {
      steps.unshift({
        view: new ConditionsStep({ queryResponse }),
        withConnector: false,
        isActive: true,
        title: 'Set Up Conditions',
      });
    } 
    this.stepContainer = new StepContainer({ steps });
    return this.stepContainer;
  }

  this.createButton = (text, classes) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('autoql-vanilla-chata-btn');
    button.classList.add('autoql-vanilla-large');

    classes.forEach(className => button.classList.add(className));

    return button;
  }

  this.createFooter = () => {
    const btnCancel = this.createButton(
      'Cancel',
      ['autoql-vanilla-default', 'autoql-vanilla-btn-no-border']
    );
    const btnBack = this.createButton('Back', ['autoql-vanilla-default']);
    const btnNextStep = this.createButton('Next', ['autoql-vanilla-primary']);
    const buttonContainerLeft = document.createElement('div');
    const modalFooter = document.createElement('div');
    
    btnCancel.onclick = this.onDiscard;

    buttonContainerLeft.appendChild(btnCancel);
    buttonContainerLeft.appendChild(btnBack);
    buttonContainerLeft.appendChild(btnNextStep);
    modalFooter.appendChild(buttonContainerLeft);

    modalFooter.classList.add('autoql-vanilla-modal-footer');

    return modalFooter;
  }

  stepContentContainer.classList.add('autoql-vanilla-data-alert-modal-step-content-container');

  container.appendChild(this.createSteps());
  container.appendChild(stepContentContainer);
  modal.chataModal.classList.add('autoql-vanilla-data-alert-creation-modal-full-size');
  modal.setTitle('Create Data Alert');
  modal.addFooterElement(this.createFooter());
  modal.addView(container);

  return modal;
}