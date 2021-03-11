export function TimezoneSelector(){
    var obj = document.createElement('div')
    var wrapper = document.createElement('div')
    var text = document.createElement('span')
    var selectControl = document.createElement('div')
    text.textContent = 'Time zone: '

    obj.classList.add('autoql-vanilla-schedule-builder-timezone-section')
    selectControl.classList.add('autoql-vanilla-timezone-select')
    selectControl.textContent = 'TEST'
    wrapper.appendChild(text)
    wrapper.appendChild(selectControl)
    obj.appendChild(wrapper)

    return obj
}
