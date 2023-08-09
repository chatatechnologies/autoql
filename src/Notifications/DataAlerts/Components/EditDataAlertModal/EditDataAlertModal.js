import { ChataConfirmDialog } from "../../../Components/ChataConfirmDialog/ChataConfirmDialog";
import { Modal } from "../../../../Modal";
import './EditDataAlertModal.scss';
import { ConditionsView } from "../ConditionsView/ConditionsView";
import { TimingView } from "../TimingView";
import { AppearanceView } from "../AppearanceView";

export function EditDataAlertModal({ dataAlert }) {
  const btnDelete = document.createElement('button');
  const btnCancel = document.createElement('button');
  const btnSave = document.createElement('button');
  const modalFooter = document.createElement('div');
  const buttonContainerRight = document.createElement('div');
  const buttonContainerLeft = document.createElement('div');
  const container = document.createElement('div');
  
  const conditionsView = new ConditionsView({ dataAlert });
  const timingView = new TimingView({ dataAlert });
  const appearanceView = new AppearanceView({ dataAlert });

  container.classList.add('autoql-vanilla-data-alert-settings-modal-content');

  btnCancel.textContent = 'Cancel';
  btnCancel.classList.add('autoql-vanilla-chata-btn');
  btnCancel.classList.add('autoql-vanilla-large');
  btnCancel.classList.add('autoql-vanilla-default');
  btnCancel.classList.add('autoql-vanilla-btn-no-border');

  btnDelete.textContent = 'Delete Data Alert';
  btnDelete.classList.add('autoql-vanilla-chata-btn');
  btnDelete.classList.add('autoql-vanilla-large');
  btnDelete.classList.add('autoql-vanilla-danger');

  btnSave.textContent = 'Save Changes';
  btnSave.classList.add('autoql-vanilla-chata-btn');
  btnSave.classList.add('autoql-vanilla-large');
  btnSave.classList.add('autoql-vanilla-primary');

  modalFooter.classList.add('autoql-vanilla-modal-footer');

  buttonContainerLeft.appendChild(btnDelete);
  buttonContainerRight.appendChild(btnCancel);
  buttonContainerRight.appendChild(btnSave);
  
  modalFooter.appendChild(buttonContainerLeft);
  modalFooter.appendChild(buttonContainerRight);

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

  const onDiscard = () => {
    new ChataConfirmDialog({ ...confirmDialogProps });
  }

  var modal = new Modal(
    {
        withFooter: true,
        destroyOnClose: true,
    },
    () => {},
    onDiscard
  );
  
  btnCancel.onclick = onDiscard;
  
  container.appendChild(conditionsView);
  container.appendChild(timingView);
  container.appendChild(appearanceView);
  modal.addView(container);
  modal.chataModal.classList.add('autoql-vanilla-modal-full-size');
  modal.setTitle('Edit Data Alert Settings');
  modal.addFooterElement(modalFooter);

  return modal;
}