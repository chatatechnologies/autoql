import css from '../../css/ChataInput.css'

export function ChataInput(tag, elementProps, svgIcon=undefined, withIcon=true){
    let input;
    input = document.createElement(tag);
    input.classList.add('autoql-vanilla-chata-input-settings')
    if(tag === 'input'){
        if(withIcon){
            input.classList.add('with-icon');
            var span = document.createElement('span');
            span.classList.add('chata-icon');
            span.classList.add('chata-input-icon');
            span.innerHTML = svgIcon;
            this.spanIcon = span;
        }
    }else{
        input.classList.add('area');
    }
    for (var [key, value] of Object.entries(elementProps)) {
        input.setAttribute(key, value);
    }

    this.input = input;
    return this
}
