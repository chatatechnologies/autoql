import { getSupportedDisplayTypes } from 'autoql-fe-utils';
import { DISPLAY_TYPE_ICONS } from '../Svg';
import { refreshTooltips } from '../Tooltips';
import { strings } from '../Strings';

import './VizToolbar.scss';

export function VizToolbar(json, queryOutput, options = {}, onChange = () => {}) {
    var vizToolbar = document.createElement('div');

    var displayTypes = getSupportedDisplayTypes({ response: { data: json } });

    if (json && displayTypes.length > 1) {
        vizToolbar.buttons = [];

        vizToolbar.classList.add('autoql-vanilla-tile-toolbar');
        vizToolbar.classList.add('autoql-vanilla-viz-toolbar');

        for (var i = 0; i < displayTypes.length; i++) {
            const displayType = displayTypes[i];

            if (!displayType || !DISPLAY_TYPE_ICONS[displayType]) continue;

            var button = document.createElement('button');

            button.classList.add('autoql-vanilla-chata-toolbar-btn');

            if (displayType == queryOutput.displayType) {
                button.classList.add('autoql-vanilla-viz-toolbar-btn-active');
            }

            button.innerHTML = DISPLAY_TYPE_ICONS[displayType];
            button.setAttribute('data-displaytype', displayTypes[i]);
            button.setAttribute('data-tippy-content', strings.displayTypes[displayType]);

            vizToolbar.buttons.push(button);

            if (button.innerHTML != '') {
                vizToolbar.appendChild(button);
                button.onclick = function () {
                    queryOutput?.setOption('displayType', this.dataset.displaytype);

                    vizToolbar.buttons?.forEach((btn) => {
                        btn?.classList.remove('autoql-vanilla-viz-toolbar-btn-active');
                    });

                    this.classList.add('autoql-vanilla-viz-toolbar-btn-active');

                    try {
                        onChange(button);
                    } catch (error) {
                        console.error(error);
                    }
                };
            }
        }

        refreshTooltips();
    }

    return vizToolbar;
}
