import {
    htmlToElement
} from '../Utils'
import './ErrorMessage.css'

export function ErrorMessage(text, onClick=()=>{}){
    var values = text.split('<report>')

    if(values.length > 1){
        var span = document.createElement('span')
        var link = document.createElement('a')
        span.innerHTML = values[0]
        link.innerHTML = 'report'
        link.classList.add('autoql-vanilla-report-link')
        link.onclick = (evt) => {
            onClick(evt)
        }
        span.appendChild(link)
        span.appendChild(document.createTextNode(values[1]))
        return span
    }else{
        return htmlToElement(text)
    }
}
