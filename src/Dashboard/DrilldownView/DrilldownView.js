import { uuidv4 } from '../../Utils';
import { ChataUtils } from '../../ChataUtils';
import { ErrorMessage } from '../../ErrorMessage';
import { OptionsToolbar } from '../../OptionsToolbar';
import { QueryOutput } from '../../QueryOutput/QueryOutput';

import './DrilldownView.scss';
import { VizToolbar } from '../../VizToolbar';

export function DrilldownView({
    tile,
    json,
    displayType,
    isStatic = true,
    drilldownFn,
    activeKey,
    options = {},
    onClick = () => {},
}) {
    var view = document.createElement('div');
    var wrapperView = document.createElement('div');
    wrapperView.classList.add('autoql-vanilla-drilldown-wrapper-view');
    view.appendChild(wrapperView);
    view.wrapper = wrapperView;

    if (isStatic) {
        view.classList.add('autoql-vanilla-dashboard-drilldown-original');
    } else {
        view.classList.add('autoql-vanilla-dashboard-drilldown-table');
    }
    const { dashboard } = tile;
    const UUID = uuidv4();
    view.isVisible = true;

    view.onRowClick = () => {};

    view.onCellClick = () => {};

    view.componentClickHandler = (handler, component, selector) => {
        var elements = component.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            elements[i].onclick = (evt) => {
                handler.apply(null, [evt, UUID, view]);
            };
        }
    };

    view.setSelectedElement = (index) => {
        var elem = view.querySelector(`[data-tilechart="${index}"]`);
        elem.classList.add('active');
    };

    view.executeDrilldown = async (data = {}) => {
        if (!drilldownFn) {
            ChataUtils.responses[UUID] = json;
            view.displayData(json);

            return;
        }

        var loading = view.showLoadingDots();

        var response;

        try {
            response = await drilldownFn?.(data);
        } catch (error) {
            console.error(error);
        }

        loading?.parentElement?.removeChild(loading);

        ChataUtils.responses[UUID] = response?.data;

        if (response?.data?.data?.rows?.length > 0) {
            view.displayData(response.data);
        } else {
            var error = new ErrorMessage(response?.data?.message, () => {
                ChataUtils.openModalReport(UUID, dashboard.options, null, null);
            });
            if (error) view.wrapper.appendChild(error);
        }
    };

    view.showLoadingDots = () => {
        wrapperView.innerHTML = '';

        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add('autoql-vanilla-tile-response-loading-container');
        responseLoading.classList.add('autoql-vanilla-response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        view.wrapper.appendChild(responseLoadingContainer);
        return responseLoadingContainer;
    };

    view.getGutter = () => {
        var gutter = view.parentElement.querySelector('.gutter');
        return gutter;
    };

    view.hide = () => {
        view.isVisible = false;
        view.wrapper.style.display = 'none';
        view.classList.add('no-height');
        let gutter = view.getGutter();
        gutter.style.display = 'none';
    };

    view.show = () => {
        view.isVisible = true;
        view.wrapper.style.display = 'block';
        view.classList.remove('no-height');
        let gutter = view.getGutter();
        gutter.style.display = 'block';
    };

    view.displayToolbars = () => {
        if (!isStatic) {
            if (view.toolbarContainer) {
                view.toolbarContainer.innerHTML = '';
            }

            const toolbarContainer = document.createElement('div');
            const leftToolbarContainer = document.createElement('div');
            const rightToolbarContainer = document.createElement('div');

            toolbarContainer.classList.add('autoql-vanilla-dashboard-toolbar-container');
            leftToolbarContainer.classList.add('autoql-vanilla-dashboard-toolbar-container-left');
            rightToolbarContainer.classList.add('autoql-vanilla-dashboard-toolbar-container-right');

            const vizToolbar = new VizToolbar(ChataUtils.responses[view.queryOutput?.uuid], view.queryOutput, options);
            const optionsToolbar = new OptionsToolbar(view.queryOutput?.uuid, view.queryOutput, options);

            view.vizToolbar = vizToolbar;
            view.optionsToolbar = optionsToolbar;

            console.log({ vizToolbar });

            if (vizToolbar) leftToolbarContainer.appendChild(vizToolbar);
            if (optionsToolbar) rightToolbarContainer.appendChild(optionsToolbar);

            toolbarContainer.appendChild(leftToolbarContainer);
            toolbarContainer.appendChild(rightToolbarContainer);

            view.toolbarContainer = toolbarContainer;

            view.appendChild(toolbarContainer);
        }
    };

    view.displayData = (json) => {
        var container = view.wrapper;
        view.wrapper.innerHTML = '';

        view.queryOutput = new QueryOutput(container, {
            ...options,
            displayType,
            queryResponse: json,
            optionsToolbar: view.optionsToolbar,
            onDataClick: onClick,
        });

        view.displayToolbars();

        return;
    };

    if (!isStatic) {
        view.executeDrilldown();
    }

    return view;
}
