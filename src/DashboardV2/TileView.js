import './TileView.css'
import {
    apiCall
} from '../Api'

export function TileView(tile, isSecond=false){
    var view = document.createElement('div')

    const {
        notExecutedText
    } = tile.dashboard.options

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

    view.run = async () => {
        var loading = view.showLoading()
        var data = await view.executeQuery()
        view.removeChild(loading)
    }

    view.executeQuery = async () => {
        var val = tile.inputQuery.value
        return apiCall(
            val, tile.dashboard.options, 'dashboards.user'
        )
    }

    view.classList.add('autoql-vanilla-tile-view')

    return view
}
