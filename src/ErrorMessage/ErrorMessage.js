import {
    htmlToElement
} from '../Utils'
import './ErrorMessage.css'

export function ErrorMessage(text, onClick=()=>{}){
    var values = text.split('<report>')

    if(values.length > 1){
        var div = document.createElement('div')
        var link = document.createElement('a')
        div.innerHTML = values[0]
        link.innerHTML = 'report'
        link.classList.add('autoql-vanilla-report-link')
        link.onclick = (evt) => {
            onClick(evt)
        }
        div.appendChild(link)
        div.appendChild(document.createTextNode(values[1]))
        return div
    }else{
        return htmlToElement(text)
    }
}
