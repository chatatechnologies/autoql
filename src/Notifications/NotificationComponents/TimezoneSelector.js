import {
    SELECT_ARROW
} from '../../Svg'
import momentTZ from 'moment-timezone'
import { $dom } from '../../Dom'

export function TimezoneSelector(defaultValue=undefined){
    var obj = $dom('div', {
        classes: ['autoql-vanilla-schedule-builder-timezone-section']
    })
    var wrapper = $dom('div')
    var text = $dom('span')
    var selectControl = $dom('div', {
        classes: ['autoql-vanilla-timezone-select'],
    })
    var selectWithArrow = $dom('div', {
        classes: ['autoql-vanilla-select-with-arrow']
    })
    var valueContainer = $dom('div', {
        classes: ['autoql-vanilla-select-value-container']
    })
    var valueElement = $dom('div')
    var indicators = $dom('div', {
        classes: ['autoql-vanilla-select-indicators']
    })
    var indicatorSeparator = document.createElement('div')
    var indicatorContainer = document.createElement('div')
    var popupContainer = document.createElement('div')
    var timezoneList = document.createElement('ul')
    var input = document.createElement('input')
    obj.isOpen = false

    const defaultTimeZone = defaultValue || momentTZ.tz.guess()
    const options = momentTZ.tz.names().map((tz) => {
        return {
            value: tz,
            label: tz,
        }
    })

    text.textContent = 'Time zone: '

    obj.createContent = (opts) => {
        timezoneList.innerHTML = ''
        opts.map(option => {
            var li = document.createElement('li')
            li.textContent = option.label
            timezoneList.appendChild(li)
            if(option.label === defaultTimeZone){
                li.classList.add('selected')
                valueElement.selectedOption = li
            }

            li.onclick = () => {
                input.value = ''
                input.setAttribute('placeholder', li.textContent)
                valueElement.textContent = li.textContent
                valueElement.val = li.label
                valueElement.selectedOption.classList.remove('selected')
                li.classList.add('selected')
                valueElement.selectedOption = li
                obj.createContent(options)
            }
        })
    }


    obj.applyFilter = () => {
        var term = input.value.toLowerCase() || ''
        return options.filter(opt => opt.label.toLowerCase().includes(term))
    }

    indicatorSeparator.classList.add('autoql-vanilla-indicator-separator')
    indicatorContainer.classList.add('autoql-vanilla-indicator-container')
    popupContainer.classList.add('autoql-vanilla-select-popup-container')
    timezoneList.classList.add('autoql-vanilla-select-list')
    input.setAttribute('type', 'text')
    input.setAttribute('placeholder', defaultTimeZone)
    input.classList.add('autoql-vanilla-timezone-input')
    indicatorContainer.innerHTML = SELECT_ARROW

    valueElement.textContent = defaultTimeZone

    indicators.appendChild(indicatorSeparator)
    indicators.appendChild(indicatorContainer)
    popupContainer.appendChild(timezoneList)
    valueContainer.appendChild(valueElement)
    valueContainer.appendChild(input)
    selectWithArrow.appendChild(valueContainer)
    selectWithArrow.appendChild(indicators)
    selectWithArrow.appendChild(popupContainer)
    selectControl.appendChild(selectWithArrow)
    wrapper.appendChild(text)
    wrapper.appendChild(selectControl)
    obj.appendChild(wrapper)

    selectControl.onclick = () => {
        obj.isOpen = !obj.isOpen
        popupContainer.classList.toggle('visible')
        if(obj.isOpen){
            valueElement.selectedOption.scrollIntoView()
            valueElement.style.display = 'none'
            input.style.display = 'block'
            input.focus()
        }else{
            valueElement.style.display = 'block'
            input.style.display = 'none'
            input.style.value = ''
            obj.createContent(options)
        }
    }

    obj.getValue = () => {
        return valueElement.val || ''
    }

    obj.setValue = (val) => {
        valueElement.val = val
        valueElement.textContent = val
    }

    input.onkeydown = () => {
        var filterData = obj.applyFilter()
        obj.createContent(filterData)
    }

    input.onblur = () => {
        setTimeout(() => {
            popupContainer.classList.remove('visible')
            obj.isOpen = false
            valueElement.style.display = 'block'
            input.style.display = 'none'
            input.style.value = ''
            obj.createContent(options)
        }, 100)
    }

    obj.createContent(options)

    return obj
}
