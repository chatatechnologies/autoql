export function FilterLockingLine(data){
    console.log(data);
    var view = document.createElement('div')
    view.innerHTML = data[0].show_message
    return view
}
