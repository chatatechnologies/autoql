import {
    htmlToElement
} from '../Utils'
import './ErrorMessage.css'

export function ErrorMessage(text, onClick=()=>{}){
    var startTag = text.indexOf('<')
    var endTag = text.indexOf('>')
    var values = []
    console.log(startTag);
    console.log(endTag);

    if(startTag != -1 && endTag != -1){
        values.push(text.substr(0, startTag))
        values.push(
            text.substr(endTag, text.length).replace('<', '').replace('>', '')
        )
    }
    console.log(values);
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
