export function $dom(elem, options={}){
    var el = document.createElement(elem)
    const {
        classes,
        attributes,
        dataAttributes,
        events
    } = options

    const setAttributes = (_attributes, prefix='') => {
        for(let [key, value] of Object.entries(_attributes)){
            el.setAttribute(`${prefix}${key}`, value)
        }
    }

    if(classes)classes.map(cl => el.classList.add(cl))

    if(attributes){
        setAttributes(attributes)
    }

    if(dataAttributes){
        setAttributes(dataAttributes, 'data-')
    }

    if(events){
        events.map(evt => {
            let {
                evtName,
                evtFn
            } = evt
            el[evtName] = evtFn
        })
    }

    return el

}
