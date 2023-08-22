import './NotificationDataContainer.scss';

export function NotificationDataContainer({ queryResponse }) {
  const container = document.createElement('div');
  const wrapper = document.createElement('div');
  const responseContentContainer = document.createElement('div');
  
  responseContentContainer.classList.add('autoql-vanilla-response-content-container');
  wrapper.classList.add('autoql-vanilla-notification-chart-container');
  container.classList.add('autoql-vanilla-notification-data-container');
 
  console.log(queryResponse);

  this.createDataResponse = () => {
    const responseContainer = document.createElement('div');
    const singleValue = document.createElement('div');
    const queryContainer = document.createElement('span');
    const queryWrapper = document.createElement('strong');

    queryWrapper.textContent = queryResponse?.data?.text;
    
    queryContainer.appendChild(queryWrapper)
    queryContainer.appendChild(document.createTextNode(': '));
    singleValue.appendChild(queryContainer);
    singleValue.appendChild(document.createTextNode('test'));
    responseContainer.appendChild(singleValue);

    singleValue.classList.add('autoql-vanilla-single-value-response');
    responseContainer.classList.add('autoql-vanilla-single-value-response-flex-container');
    return responseContainer;
  }

  this.showResponse = (displayType) => {
    console.log(displayType);
    switch(displayType) {
      case 'data':
        responseContentContainer.appendChild(this.createDataResponse());
        break;
    }
  }

  const displayType = queryResponse.data.display_type;

  this.showResponse(displayType);

  wrapper.appendChild(responseContentContainer);
  container.appendChild(wrapper);
  return container;
}