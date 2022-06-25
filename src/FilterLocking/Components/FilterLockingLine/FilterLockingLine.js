import { CLEAR_ALL } from '../../../Svg'
import { ChataSlider } from '../../../ChataComponents'
import {
    apiCallDelete,
    apiCallPut
} from '../../../Utils'
import './FilterLockingLine.css'

export function FilterLockingLine(datamessenger, conditionData){
    const {
        value
    } = conditionData
    var view = document.createElement('div')
    var label = document.createElement('div')
    var settings = document.createElement('div')
    var removeButton = document.createElement('span')
    var sliderWrapper = document.createElement('div')
    var slider = new ChataSlider()
    view.classList.add('autoql-vanilla-filter-locking-line')
    label.classList.add('autoql-vanilla-condition-table-list-item')
    settings.classList.add('autoql-vanilla-condition-table-settings')
    removeButton.classList.add('autoql-vanilla-remove-condition-button')
    sliderWrapper.classList.add('autoql-vanilla-slider-wrapper')

    label.textContent = value
    removeButton.innerHTML = CLEAR_ALL

    sliderWrapper.appendChild(slider)
    settings.appendChild(sliderWrapper)
    settings.appendChild(removeButton)
    view.appendChild(label)
    view.appendChild(settings)

    slider.setOnChange(() => {
        console.log(datamessenger);
        if(slider.isChecked()){
            console.log('CHEKED');
        }else{
            console.log('DELETE');


        }
    })

    return view
}
