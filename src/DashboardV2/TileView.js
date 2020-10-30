import './TileView.css'

export function TileView(dashboard, options){
    var view = document.createElement('div')
    const {
        notExecutedText
    } = dashboard.options

    const placeHolderText = `
    <div class="autoql-vanilla-dashboard-tile-placeholder-text">
        <em>${notExecutedText}</em>
    </div>`

    view.innerHTML = placeHolderText

    view.show = () => {
        view.style.display = 'block'
    }

    view.hide = () => {
        view.style.display = 'none'
    }

    view.classList.add('autoql-vanilla-tile-view')

    return view
}
