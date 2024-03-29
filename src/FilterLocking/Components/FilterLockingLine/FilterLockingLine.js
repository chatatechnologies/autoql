import { CLEAR_ALL } from '../../../Svg';
import { ChataSlider } from '../../../ChataComponents';
import { apiCallDelete, apiCallPut } from '../../../Api';
import { strings } from '../../../Strings';
import MobileDetect from 'mobile-detect';
import './FilterLockingLine.scss';

export function FilterLockingLine(datamessenger, conditionList, conditionData, filterLocking) {
    var md = new MobileDetect(window.navigator.userAgent);
    const isMobile = md.mobile() === null ? false : true;
    const { value } = conditionData;

    var view = document.createElement('div');
    var label = document.createElement('div');
    var settings = document.createElement('div');
    var removeButton = document.createElement('span');
    var sliderWrapper = document.createElement('div');
    var slider = new ChataSlider();
    view.classList.add('autoql-vanilla-filter-locking-line');
    label.classList.add('autoql-vanilla-condition-table-list-item');
    settings.classList.add('autoql-vanilla-condition-table-settings');
    removeButton.classList.add('autoql-vanilla-remove-condition-button');
    sliderWrapper.classList.add('autoql-vanilla-slider-wrapper');
    label.textContent = value;
    removeButton.innerHTML = CLEAR_ALL;
    if (!isMobile) {
        removeButton.setAttribute('data-tippy-content', strings.filterLockingRemove);
    }
    sliderWrapper.appendChild(slider);
    settings.appendChild(sliderWrapper);
    settings.appendChild(removeButton);
    view.appendChild(label);
    view.appendChild(settings);
    slider.setChecked('checked');
    view.values = conditionData;

    slider.setOnChange(async () => {
        const { authentication } = datamessenger.options;
        const { id } = view.values;
        filterLocking.displaySavingIndicator();
        if (slider.isChecked()) {
            const { filter_type, key, lock_flag, show_message } = conditionData;
            const url = `${authentication.domain}/autoql/api/v1/query/filter-locking?key=${authentication.apiKey}`;

            const response = await apiCallPut(
                url,
                {
                    columns: [
                        {
                            isSession: false,
                            filter_type,
                            key,
                            lock_flag,
                            show_message,
                            value,
                        },
                    ],
                },
                datamessenger.options,
            );

            view.updateValues(response.data.data);
        } else {
            const url = `${authentication.domain}/autoql/api/v1/query/filter-locking/${id}?key=${authentication.apiKey}`;
            apiCallDelete(url, datamessenger.options);
        }
    });

    view.updateValues = async (values) => {
        const { data } = values;
        var finded = data.find((lockingLineValues) => {
            return value === lockingLineValues.value;
        });

        view.values = finded;
    };

    view.remove = () => {
        const { authentication } = datamessenger.options;
        const { id } = view.values;
        const url = `${authentication.domain}/autoql/api/v1/query/filter-locking/${id}?key=${authentication.apiKey}`;
        apiCallDelete(url, datamessenger.options);
        if (view.parentElement.childElementCount === 2) {
            view.parentElement.replaceChildren();
        } else {
            view.parentElement.removeChild(view);
        }
    };

    view.exclude = () => {
        view.values.filter_type = 'exclude';
    };

    view.include = () => {
        view.values.filter_type = 'include';
    };

    view.getData = () => {
        return view.values;
    };

    removeButton.onclick = () => {
        view.remove();
        filterLocking.displaySavingIndicator();
        if (!conditionList.getData().length) {
            conditionList.clearList();
            conditionList.showConditionEmptyMessage();
        }
    };

    return view;
}
