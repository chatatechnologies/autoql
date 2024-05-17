export function ChartLoader (container) {
    var chartLoader = document.createElement('div');
    var spinnerContainer = document.createElement('div');
    var spinner = document.createElement('div');

    chartLoader.classList.add('autoql-vanilla-table-loader');
    chartLoader.classList.add('autoql-vanilla-table-page-loader');
    chartLoader.classList.add('autoql-vanilla-table-loader-hidden');
    spinnerContainer.classList.add('autoql-vanilla-page-loader-spinner');
    spinner.classList.add('autoql-vanilla-spinner-loader');

    spinnerContainer.appendChild(spinner);

    chartLoader.appendChild(spinnerContainer);

    chartLoader.setChartLoading = (isLoading) => {
        if (isLoading) {
            chartLoader.classList.remove('autoql-vanilla-table-loader-hidden');
        } else {
            chartLoader.classList.add('autoql-vanilla-table-loader-hidden');
        }
    };
    
    container.appendChild(chartLoader);
    return chartLoader;
};