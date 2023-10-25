import { getSupportedDisplayTypes } from 'autoql-fe-utils';
import { DISPLAY_TYPE_ICONS } from '../../Svg';
import { refreshTooltips } from '../../Tooltips';
import { strings } from '../../Strings';

import './TileVizToolbar.scss';

export function TileVizToolbar(json, view, tile) {
    var displayTypes = getSupportedDisplayTypes({ response: { data: json } });
    var { dashboard } = tile;
    var dummyArray = [];
    dummyArray.forEach.call(view.querySelectorAll('.autoql-vanilla-viz-toolbar'), function (e) {
        e.parentNode.removeChild(e);
    });

    if (displayTypes.length > 1) {
        var vizToolbar = document.createElement('div');

        vizToolbar.buttons = [];

        if (!view.isSecond) vizToolbar.classList.add('first');
        if (!view.isSecond && tile.options.isSplit) vizToolbar.classList.add('is-split');

        vizToolbar.classList.add('autoql-vanilla-tile-toolbar');
        vizToolbar.classList.add('autoql-vanilla-viz-toolbar');

        for (var i = 0; i < displayTypes.length; i++) {
            const displayType = displayTypes[i];

            if (!displayType || !DISPLAY_TYPE_ICONS[displayType]) continue;

            var button = document.createElement('button');

            button.classList.add('autoql-vanilla-chata-toolbar-btn');

            if (displayType == view.internalDisplayType) {
                button.classList.add('autoql-vanilla-viz-toolbar-btn-active');
            }

            button.innerHTML = DISPLAY_TYPE_ICONS[displayType];
            button.setAttribute('data-displaytype', displayTypes[i]);
            button.setAttribute('data-tippy-content', strings.displayTypes[displayType]);

            vizToolbar.buttons.push(button);

            if (button.innerHTML != '') {
                vizToolbar.appendChild(button);
                button.onclick = function () {
                    dashboard.setUndoData(
                        'display-type-change',
                        () => {
                            var curValue = view.internalDisplayType;
                            vizToolbar.querySelectorAll('.autoql-vanilla-viz-toolbar-btn')?.forEach((btn) => {
                                btn?.classList.remove('autoql-vanilla-viz-toolbar-btn-active');
                            });

                            button.classList.add('autoql-vanilla-viz-toolbar-btn-active');

                            view.displayData();
                            return curValue;
                        },
                        view,
                    );
                    view.internalDisplayType = this.dataset.displaytype;
                    view.displayData();
                };
            }
        }

        view.appendChild(vizToolbar);
        refreshTooltips();
    }
}
