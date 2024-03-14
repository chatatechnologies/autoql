import './ConditionList.css'
import { FilterLockingList } from '../FilterLockingList'
import {
    FILTER_LOCKING_OPEN,
    FILTER_LOCKING_CLOSE,
} from '../../../Svg';
export function ConditionList(datamessenger,filterLocking){
    var container = document.createElement('div')
    var emptyConditionListContainer = document.createElement('div')
    var conditionListWrapper = document.createElement('div')
    var conditionList = []
    emptyConditionListContainer.innerHTML = `
        <p class="autoql-vanilla-filter-locking-empty-condition"><i class='autoql-vanilla-filter-locking-empty-condition'>No Filters are locked yet</i></p>
    `
    container.classList.add('autoql-vanilla-condition-list')
    emptyConditionListContainer.classList.add('autoql-vanilla-empty-condition-list')
    container.appendChild(emptyConditionListContainer)
    container.appendChild(conditionListWrapper)

    container.hideConditionEmptyMessage = () => {
		var filterLockingButton = document.querySelector('.autoql-vanilla-chata-button.filter-locking-menu');
		var existingFilterLockingSVG = filterLockingButton.querySelector("svg");
		var filterLockingIconBadge = document.querySelector('.autoql-vanilla-filter-lock-icon-badge')
		if(!filterLockingIconBadge){
			filterLockingIconBadge = document.createElement('div');
			filterLockingIconBadge.classList.add('autoql-vanilla-filter-lock-icon-badge'); 
			filterLockingButton.appendChild(filterLockingIconBadge)
		}
		var parser = new DOMParser();
		var newFilterLockingSVG = parser.parseFromString(FILTER_LOCKING_CLOSE, "image/svg+xml").documentElement;
		filterLockingButton.replaceChild(newFilterLockingSVG, existingFilterLockingSVG);
        emptyConditionListContainer.style.display = 'none'
    }

    container.showConditionEmptyMessage = () => {
		var filterLockingButton = document.querySelector('.autoql-vanilla-chata-button.filter-locking-menu');
		var filterLockingIconBadge = document.querySelector('.autoql-vanilla-filter-lock-icon-badge')
		if(filterLockingIconBadge){
			filterLockingButton.removeChild(filterLockingIconBadge)
		}
		var existingFilterLockingSVG = filterLockingButton.querySelector("svg");	
		var parser = new DOMParser();
		var newFilterLockingSVG = parser.parseFromString(FILTER_LOCKING_OPEN, "image/svg+xml").documentElement;
		filterLockingButton.replaceChild(newFilterLockingSVG, existingFilterLockingSVG);
        emptyConditionListContainer.style.display = 'block'
    }

    container.addList = (data) => {
        if(conditionList.length === 0){
            container.hideConditionEmptyMessage()
        }
        var list = new FilterLockingList(datamessenger, container, data,filterLocking)
        conditionListWrapper.appendChild(list)
        conditionList.push(list)
    }

    container.clearList = () => {
        conditionListWrapper.innerHTML = ''
        FilterLockingList.index = 0
        conditionList = []
    }

    container.getData = () => {
        return conditionList.map(list => Array.from(list.getLines())).flat()
    }

    return container
}
