export function InputContainer(classList=[]){
    var container = document.createElement('div');
    container.classList.add('chata-input-container');
    for (var i = 0; i < classList.length; i++) {
        container.classList.add(classList[i]);
    }
    return container;
}
