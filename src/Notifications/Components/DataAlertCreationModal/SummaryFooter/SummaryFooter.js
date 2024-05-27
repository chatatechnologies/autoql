import './SummaryFooter.scss';

export function SummaryFooter({ queryText }) {
    const container = document.createElement('div');
    const background = document.createElement('div');
    const querySummary = document.createElement('div');
    const summaryText = document.createElement('strong');

    summaryText.textContent = 'Your query: ';

    querySummary.appendChild(summaryText);
    querySummary.appendChild(document.createTextNode(queryText));
    container.appendChild(background);
    container.appendChild(querySummary);

    querySummary.classList.add('autoql-vanilla-data-alert-modal-query-summary');
    background.classList.add('autoql-vanilla-data-alert-modal-query-summary-background');
    container.classList.add('autoql-vanilla-data-alert-modal-query-summary-container');

    return container;
}
