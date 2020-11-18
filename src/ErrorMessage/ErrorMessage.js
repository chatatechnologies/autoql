import {
    htmlToElement
} from '../Utils'

export function ErrorMessage(text, onClick=()=>{}){
    console.log();
    var values = text.split('<report>')
    if(values.length > 1){
        console.log('SHOW LINK');
    }else{
        return htmlToElement(text)
    }
}
