import { updateDataAlert } from 'autoql-fe-utils';

import { Modal } from '../../../../Modal';
import { AntdMessage } from '../../../../Antd';
import { ConditionsStep } from '../DataAlertCreationModal/ConditionsStep';
import { TimingStep } from '../DataAlertCreationModal/TimingStep/TimingStep';
import { ChataConfirmDialog } from '../../../Components/ChataConfirmDialog/ChataConfirmDialog';
import { AppearanceStep } from '../DataAlertCreationModal/AppearanceStep/AppearanceStep';

import './DataAlertEditModal.scss';

const createSectionTitle = (title) => {
    const sectionTitle = document.createElement('div');
    sectionTitle.classList.add('autoql-vanilla-data-alert-setting-section-title');
    sectionTitle.innerHTML = title;
    return sectionTitle;
};

const SectionDivider = () => {
    const divider = document.createElement('div');
    divider.classList.add('autoql-vanilla-divider-horizontal');
    return divider;
};

export function DataAlertEditModal({
    dataAlertItem,
    dataAlert,
    authentication,
    onDeleteClick = () => {},
    fetchAlerts = () => {},
}) {
    const btnDelete = document.createElement('button');
    const btnCancel = document.createElement('button');
    const btnSave = document.createElement('button');
    const modalFooter = document.createElement('div');
    const buttonContainerRight = document.createElement('div');
    const buttonContainerLeft = document.createElement('div');
    const spinner = document.createElement('div');
    const container = document.createElement('div');
    const btnSaveString = document.createElement('span');

    const conditionsSection = new ConditionsStep({ dataAlert });
    const timingSection = new TimingStep({ dataAlert, showSummaryMessage: false });
    const appearanceSection = new AppearanceStep({ dataAlert, showSummaryMessage: false });

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

    const deleteDataAlertItemHandler = async () => {
        await onDeleteClick();
        modal.close();
    };

    btnCancel.onclick = onDiscard;
    btnDelete.onclick = deleteDataAlertItemHandler;

    btnSave.onclick = async () => {
        spinner.classList.remove('hidden');
        btnSave.setAttribute('disabled', 'true');
        const newValues = {
            id: dataAlert.id,
            ...conditionsSection.getValues(),
            ...appearanceSection.getValues(),
            ...timingSection.getValues(),
        };
        try {
            const response = await updateDataAlert({ dataAlert: newValues, ...authentication });
            await fetchAlerts();

            if (response.status === 200) {
                dataAlertItem?.setDataAlert?.(response?.data?.data);
                modal.close();
                new AntdMessage('Data Alert updated!', 2500);
            } else {
                throw new Error('There was a problem saving your Data Alert. Please try again.');
            }
        } catch (error) {
            console.error(error);
            new AntdMessage('Error', 2500);
        }
    };

    container.addEventListener('keyup', () => {
        if (!conditionsSection.isValid() || !appearanceSection.isValid()) {
            btnSave.disabled = true;
            btnSave.classList.add('autoql-vanilla-disabled');
        } else {
            btnSave.classList.remove('autoql-vanilla-disabled');
            btnSave.disabled = false;
        }
    });

    const conditionsSectionTitle = createSectionTitle('Conditions');
    const timingSectionTitle = createSectionTitle('Timing');
    const appearanceSectionTitle = createSectionTitle('Appearance');

    container.appendChild(conditionsSectionTitle);
    container.appendChild(conditionsSection);
    container.appendChild(new SectionDivider());
    container.appendChild(timingSectionTitle);
    container.appendChild(timingSection);
    container.appendChild(new SectionDivider());
    container.appendChild(appearanceSectionTitle);
    container.appendChild(appearanceSection);

    modal.addView(container);
    modal.chataModal.classList.add('autoql-vanilla-modal-full-size');
    modal.setTitle('Edit Data Alert Settings');
    modal.addFooterElement(modalFooter);

    return modal;
}
