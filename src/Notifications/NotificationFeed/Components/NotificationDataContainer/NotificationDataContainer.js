import { dataFormattingDefault, formatElement, isDataLimited } from 'autoql-fe-utils';
import './NotificationDataContainer.scss';
import { ChataUtils } from '../../../../ChataUtils';
import { uuidv4 } from '../../../../Utils';
import { ChataTable } from '../../../../ChataTable';

export function NotificationDataContainer({ queryResponse }) {
  const container = document.createElement('div');
  const wrapper = document.createElement('div');
  const responseContentContainer = document.createElement('div');
  var idRequest = uuidv4();
  ChataUtils.responses[idRequest] = queryResponse;

  responseContentContainer.classList.add('autoql-vanilla-response-content-container');
  wrapper.classList.add('autoql-vanilla-notification-chart-container');
  container.classList.add('autoql-vanilla-notification-data-container');
 
  console.log(queryResponse);

  this.createDataResponse = () => {
    const responseContainer = document.createElement('div');
    const singleValue = document.createElement('div');
    const queryContainer = document.createElement('span');
    const queryWrapper = document.createElement('strong');
    const {
      text,
      columns,
      rows,
    } = queryResponse?.data

    queryWrapper.textContent = text;

    queryContainer.appendChild(queryWrapper)
    queryContainer.appendChild(document.createTextNode(': '));
    singleValue.appendChild(queryContainer);
    singleValue.appendChild(document.createTextNode(formatElement({
      element: rows[0][0],
      column: columns[0],
    })));
    responseContainer.appendChild(singleValue);

    singleValue.classList.add('autoql-vanilla-single-value-response');
    responseContainer.classList.add('autoql-vanilla-single-value-response-flex-container');
    return responseContainer;
  }

  this.createTable = () => {
    console.log(idRequest);
    console.log(document.querySelector(`[data-componentid='${idRequest}']`));
    var useInfiniteScroll = isDataLimited({ data: queryResponse });
    new ChataTable(
      idRequest,
      { options: dataFormattingDefault },
      () => {},
      () => {},
      useInfiniteScroll,
      undefined,
    );
  }
  
  this.createTableResponse = () => {
    var tableContainer = document.createElement('div');
    var tableWrapper = document.createElement('div');

    tableWrapper.setAttribute('data-componentid', idRequest);
    tableWrapper.classList.add('autoql-vanilla-chata-table');
    tableContainer.classList.add('autoql-vanilla-chata-table-container');

    tableContainer.appendChild(tableWrapper);

    return tableContainer;
  }

  this.isSingleResponse = () => {
    const {
      columns
    } = queryResponse?.data;

    return columns.length === 1;
  }

  this.showResponse = (displayType) => {

    switch(displayType) {
      case 'data':
        if(this.isSingleResponse()) {
          responseContentContainer.appendChild(this.createDataResponse());
        } else {
          console.log('TABLE');
          responseContentContainer.appendChild(this.createTableResponse());
          this.createTable();
        }
        break;
    }
  }

  const displayType = queryResponse.data.display_type;

  
  wrapper.appendChild(responseContentContainer);
  container.appendChild(wrapper);

  setTimeout(() => {
    this.showResponse(displayType);
  }, 300);

  return container;
}