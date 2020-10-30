import './TileView.css'

export function TileView(dashboard, options, isSecond=false){
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
        view.style.display = 'flex'
    }

    view.hide = () => {
        view.style.display = 'none'
    }

    view.showLoading = () => {
        view.innerHTML = ''

        var responseLoadingContainer = document.createElement('div');
        var responseLoading = document.createElement('div');

        responseLoadingContainer.classList.add(
            'autoql-vanilla-tile-response-loading-container'
        );
        responseLoading.classList.add('response-loading');
        for (var i = 0; i <= 3; i++) {
            responseLoading.appendChild(document.createElement('div'));
        }

        responseLoadingContainer.appendChild(responseLoading);
        view.appendChild(responseLoadingContainer);
        return responseLoadingContainer;
    }

    view.classList.add('autoql-vanilla-tile-view')

    view.showLoading()

    return view
}
