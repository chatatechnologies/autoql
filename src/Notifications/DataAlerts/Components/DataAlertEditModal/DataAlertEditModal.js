import { ChataConfirmDialog } from '../../../Components/ChataConfirmDialog/ChataConfirmDialog';
import { Modal } from '../../../../Modal';
import './DataAlertEditModal.scss';
import { ConditionsView } from '../ConditionsView/ConditionsView';
import { TimingView } from '../TimingView';
import { AppearanceView } from '../AppearanceView';
import { updateDataAlert } from 'autoql-fe-utils';
import { AntdMessage } from '../../../../Antd';

export function DataAlertEditModal({ dataAlertItem, dataAlert, authentication }) {
    const btnDelete = document.createElement('button');
    const btnCancel = document.createElement('button');
    const btnSave = document.createElement('button');
    const modalFooter = document.createElement('div');
    const buttonContainerRight = document.createElement('div');
    const buttonContainerLeft = document.createElement('div');
    const spinner = document.createElement('div');
    const container = document.createElement('div');
    const btnSaveString = document.createElement('span');

    const conditionsView = new ConditionsView({ dataAlert });
    const timingView = new TimingView({ dataAlert });
    const appearanceView = new AppearanceView({ dataAlert });

    container.classList.add('autoql-vanilla-data-alert-settings-modal-content');
    spinner.classList.add('autoql-vanilla-spinner-loader');
    spinner.classList.add('hidden');

    btnCancel.textContent = 'Cancel';
    btnCancel.classList.add('autoql-vanilla-chata-btn');
    btnCancel.classList.add('autoql-vanilla-large');
    btnCancel.classList.add('autoql-vanilla-default');
    btnCancel.classList.add('autoql-vanilla-btn-no-border');

    btnDelete.textContent = 'Delete Data Alert';
    btnDelete.classList.add('autoql-vanilla-chata-btn');
    btnDelete.classList.add('autoql-vanilla-large');
    btnDelete.classList.add('autoql-vanilla-danger');

    btnSave.appendChild(spinner);
    btnSave.appendChild(btnSaveString);
    btnSaveString.textContent = 'Save Changes';
    btnSaveString.classList.add('autoql-vanilla-btn-text-wrapper');
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
        },
    };

    const onDiscard = () => {
        new ChataConfirmDialog({ ...confirmDialogProps });
    };

    var modal = new Modal(
        {
            withFooter: true,
            destroyOnClose: true,
        },
        () => {},
        onDiscard,
    );

    const deleteDataAlertItemHandler = () => {
        ChataConfirmDialog({
            title: 'Are you sure you want to delete this Data Alert?',
            message: 'You will no longer be notified about these changes in your data.',
            cancelString: 'Go Back',
            discardString: 'Delete',
            onDiscard: async () => {
                const response = await deleteDataAlert(id, authentication);
                if (response.status === 200) {
                    new AntdMessage('Data Alert was successfully deleted.', 3000);
                } else {
                    new AntdMessage('Error', 3000);
                }
                modal.close();
            },
        });
    };

    btnCancel.onclick = onDiscard;
    btnDelete.onclick = deleteDataAlertItemHandler;

    btnSave.onclick = async () => {
        spinner.classList.remove('hidden');
        btnSave.setAttribute('disabled', 'true');
        const newValues = {
            id: dataAlert.id,
            ...conditionsView.getValues(),
            ...appearanceView.getValues(),
            ...timingView.getValues(),
        };
        const response = await updateDataAlert({ dataAlert: newValues, ...authentication });
        modal.close();
        if (response.status === 200) {
            new AntdMessage('Data Alert updated!', 2500);
            if (!dataAlertItem) {
                dataAlertItem.setDataAlert(response.data.data);
            }
        } else {
            new AntdMessage('Error', 2500);
        }
    };

    container.addEventListener('keyup', () => {
        if (!conditionsView.isValid() || !appearanceView.isValid()) {
            btnSave.disabled = true;
            btnSave.classList.add('autoql-vanilla-disabled');
        } else {
            btnSave.classList.remove('autoql-vanilla-disabled');
            btnSave.disabled = false;
        }
    });

    container.appendChild(conditionsView);
    container.appendChild(timingView);
    container.appendChild(appearanceView);
    modal.addView(container);
    modal.chataModal.classList.add('autoql-vanilla-modal-full-size');
    modal.setTitle('Edit Data Alert Settings');
    modal.addFooterElement(modalFooter);

    return modal;
}
