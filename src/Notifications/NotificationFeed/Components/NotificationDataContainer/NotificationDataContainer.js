import { dataFormattingDefault, formatElement, isChartType, isDataLimited } from 'autoql-fe-utils';
import './NotificationDataContainer.scss';
import { ChataUtils } from '../../../../ChataUtils';
import { uuidv4 } from '../../../../Utils';
import { ChataTable } from '../../../../ChataTable';
import { NotificationVizToolbar } from '../NotificationVizToolbar';
import { DataLimitWarningIcon } from '../../../../DataLimitWarningIcon';
import { ChataChartNew } from '../../../../NewCharts';

export function NotificationDataContainer({ queryResponse, widgetOptions }) {
  const container = document.createElement('div');
  const wrapper = document.createElement('div');
  const responseContentContainer = document.createElement('div');
  var idRequest = uuidv4();
  ChataUtils.responses[idRequest] = queryResponse.data;

  responseContentContainer.classList.add('autoql-vanilla-response-content-container');
  wrapper.classList.add('autoql-vanilla-notification-chart-container');
  container.classList.add('autoql-vanilla-notification-data-container');
 
  this.createDataResponse = () => {
    const responseContainer = document.createElement('div');
    const singleValue = document.createElement('div');
    const queryContainer = document.createElement('span');
    const queryWrapper = document.createElement('strong');
    const {
      text,
      columns,
      rows,
    } = queryResponse?.data?.data

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

  this.createVizToolbar = () => {
    return new NotificationVizToolbar({ response: queryResponse, onClick: this.showResponse });
  }

  this.createTable = () => {
    var useInfiniteScroll = isDataLimited({ data: queryResponse?.data });
    new ChataTable(
      idRequest,
      { options: dataFormattingDefault },
      () => {},
      () => {},
      useInfiniteScroll,
      undefined,
    );
  }

  this.createChartContainer = () => {
    var chartContainer = document.createElement('div');
    chartContainer.classList.add('autoql-vanilla-chart-container');

    return chartContainer;
  }
  
  this.createTableResponseContainer = () => {
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
    } = queryResponse?.data?.data;

    return columns.length === 1;
  }

  this.showDataLimitWarning = () => {
    return queryResponse?.data?.data?.rows?.length >= 500;
  }

  this.initializeContainers = () => {
    if(!this.isSingleResponse()) {
      this.tableContainer = this.createTableResponseContainer();
      this.chartContainer = this.createChartContainer();
    
      this.chartContainer.classList.add('autoql-vanilla-hidden');
    
      responseContentContainer.appendChild(this.tableContainer);
      responseContentContainer.appendChild(this.chartContainer);
    }  
  }

  this.showResponse = (displayType) => {
    switch(displayType) {
      case 'data':
      case 'table':
      if(this.isSingleResponse()) {
        responseContentContainer.appendChild(this.createDataResponse());
      } else {
        this.tableContainer.classList.remove('autoql-vanilla-hidden');
        this.chartContainer.classList.add('autoql-vanilla-hidden');
        this.createTable();
      }
      break;
    }
    
    if(isChartType(displayType)) {
      this.tableContainer.classList.add('autoql-vanilla-hidden');
      this.chartContainer.classList.remove('autoql-vanilla-hidden');

      const component = document.querySelector(`[data-componentid='${idRequest}']`);
      
      new ChataChartNew(component, {
        type: displayType,
        queryJson: queryResponse?.data,
        onChartClick: () => {  },
        options: widgetOptions,
      });
    }
    
    if(this.showDataLimitWarning()) {
      responseContentContainer.appendChild(this.createFooter());
    }
    }
    
    this.createFooter = () => {
      const footer = document.createElement('div');
      
      footer.classList.add('autoql-vanilla-output-footer');
      footer.appendChild(new DataLimitWarningIcon());
      
      return footer;
  }

  const displayType = queryResponse.data.data.display_type;
  
  wrapper.appendChild(responseContentContainer);
  if(!this.isSingleResponse()){
    wrapper.appendChild(this.createVizToolbar());
  }
  container.appendChild(wrapper);
  
  this.initializeContainers();

  setTimeout(() => {
    this.showResponse(displayType);
  }, 100);

  return container;
}