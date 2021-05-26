import {
    htmlToElement
} from '../Utils'
import './ErrorMessage.css'
import { strings } from '../Strings'

export function ErrorMessage(text, onClick=()=>{}){
    var startTag = text.indexOf('<')
    var endTag = text.indexOf('>')
    var values = []

    if(startTag != -1 && endTag != -1){
        values.push(text.substr(0, startTag))
        values.push(
            text.substr(endTag, text.length).replace('<', '').replace('>', '')
        )
    }

    if(values.length > 1){
        var div = document.createElement('div')
        var link = document.createElement('a')
        div.innerHTML = values[0]
        link.innerHTML = strings.report
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
