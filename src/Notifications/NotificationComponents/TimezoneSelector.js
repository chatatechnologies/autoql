export function TimezoneSelector(){
    var obj = document.createElement('div')
    var wrapper = document.createElement('div')
    var text = document.createElement('span')
    var selectControl = document.createElement('div')
    var selectWithArrow = document.createElement('div')
    var valueContainer = document.createElement('div')
    var valueElement = document.createElement('div')
    text.textContent = 'Time zone: '

    obj.classList.add('autoql-vanilla-schedule-builder-timezone-section')
    selectControl.classList.add('autoql-vanilla-timezone-select')
    selectWithArrow.classList.add('autoql-vanilla-select-with-arrow')
    valueElement.textContent = 'TEST'

    valueContainer.appendChild(valueElement)
    selectWithArrow.appendChild(valueContainer)
    selectControl.appendChild(selectWithArrow)
    wrapper.appendChild(text)
    wrapper.appendChild(selectControl)
    obj.appendChild(wrapper)

    return obj
}
