import { ChataConfirmDialog } from "../../../Components/ChataConfirmDialog";
import 'EditDataAlertModal.scss';

export function EditDataAlertModal() {
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

  var modal = new Modal(
    {
        withFooter: true,
        destroyOnClose: true,
    },
    () => {},
    () => {
        new ChataConfirmDialog({ ...confirmDialogProps });
    },
);
  modal.chataModal.classList.add('autoql-vanilla-modal-full-width');
}