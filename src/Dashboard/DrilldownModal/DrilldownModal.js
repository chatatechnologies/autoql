import Split from 'split.js';

import { Modal } from '../../Modal';
import { refreshTooltips } from '../../Tooltips';

export function DrilldownModal(title, views = []) {
    var modal = new Modal(
        {
            destroyOnClose: true,
            className: 'autoql-vanilla-drilldown-modal',
        },
        () => {
            if (views.length > 1) {
                Split(views, {
                    direction: 'vertical',
                    sizes: [50, 50],
                    minSize: [35, 0],
                    gutterSize: 7,
                    cursor: 'row-resize',
                    onDragEnd: () => {
                        window.dispatchEvent(new CustomEvent('chata-resize', {}));
                    },
                });
            }
        },
    );

    modal.chataModal.classList.add('chata-modal-full-height');
    modal.chataModal.style.width = '90vw';
    views.map((v) => modal.addView(v));
    modal.setTitle(title);

    refreshTooltips();

    return modal;
}
