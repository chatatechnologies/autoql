import {
    SELECT_ARROW
} from '../../Svg'
import momentTZ from 'moment-timezone'

export function TimezoneSelector(){
    var obj = document.createElement('div')
    var wrapper = document.createElement('div')
    var text = document.createElement('span')
    var selectControl = document.createElement('div')
    var selectWithArrow = document.createElement('div')
    var valueContainer = document.createElement('div')
    var valueElement = document.createElement('div')
    var indicators = document.createElement('div')
    var indicatorSeparator = document.createElement('div')
    var indicatorContainer = document.createElement('div')
    var popupContainer = document.createElement('div')
    var timezoneList = document.createElement('ul')

    const defaultTimeZone = momentTZ.tz.guess()
    const options = momentTZ.tz.names().map((tz) => {
        return {
            value: tz,
            label: tz,
        }
    })

    text.textContent = 'Time zone: '

    options.map(option => {
        var li = document.createElement('li')
        li.textContent = option.label
        timezoneList.appendChild(li)
        if(option.label === defaultTimeZone){
            li.classList.add('selected')
            valueElement.selectedOption = li
        }

        li.onclick = () => {
            valueElement.textContent = li.textContent
            valueElement.val = li.label
            valueElement.selectedOption.classList.remove('selected')
            li.classList.add('selected')
            valueElement.selectedOption = li
        }
    })

    obj.classList.add('autoql-vanilla-schedule-builder-timezone-section')
    selectControl.classList.add('autoql-vanilla-timezone-select')
    selectWithArrow.classList.add('autoql-vanilla-select-with-arrow')
    valueContainer.classList.add('autoql-vanilla-select-value-container')
    indicators.classList.add('autoql-vanilla-select-indicators')
    indicatorSeparator.classList.add('autoql-vanilla-indicator-separator')
    indicatorContainer.classList.add('autoql-vanilla-indicator-container')
    popupContainer.classList.add('autoql-vanilla-select-popup-container')
    timezoneList.classList.add('autoql-vanilla-select-list')
    indicatorContainer.innerHTML = SELECT_ARROW

    valueElement.textContent = defaultTimeZone

    indicators.appendChild(indicatorSeparator)
    indicators.appendChild(indicatorContainer)
    popupContainer.appendChild(timezoneList)
    valueContainer.appendChild(valueElement)
    selectWithArrow.appendChild(valueContainer)
    selectWithArrow.appendChild(indicators)
    selectWithArrow.appendChild(popupContainer)
    selectControl.appendChild(selectWithArrow)
    wrapper.appendChild(text)
    wrapper.appendChild(selectControl)
    obj.appendChild(wrapper)

    selectControl.onclick = () => {
        popupContainer.classList.toggle('visible')
    }

    obj.getValue = () => {
        return valueElement.val || ''
    }

    obj.setValue = (val) => {
        valueElement.val = val
        valueElement.textContent = val
    }

    return obj
}
