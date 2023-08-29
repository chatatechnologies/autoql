import { Modal } from "../../../Modal";
import { ChataConfirmDialog } from "../ChataConfirmDialog/ChataConfirmDialog";

export function DataAlertCreationModal() {

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

  const modal = new Modal(
    {
        withFooter: true,
        destroyOnClose: true,
    },
    () => {},
    onDiscard
  );

  modal.chataModal.classList.add('autoql-vanilla-modal-full-size');
  modal.setTitle('Create Data Alert');

  return modal;
}