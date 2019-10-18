# Demo
Live demo of ChatDrawer component: https://vicente_rincon.gitlab.io/widget/

# Installation

you have to import the javascript and css file from the widget

```
<link rel="stylesheet" type="text/css" href="https://ucarecdn.com/fd4b2bdf-fbc1-4ab2-af8b-5a1efc0f7285/chatastyles.css">
<script src="https://ucarecdn.com/9912723e-ab89-46c9-ba6c-2825821f7111/ChatDrawermin.js"></script>
```

# Environment Support

- Modern browsers

- Support for voice to text button in Google Chrome only. Will fail silently in other browsers.

# Authentication
You will need a API key, customer ID, user ID, and domain to query your database through these widgets. Additionally, we require that you pass in a valid JWT token to be used on every endpoint call.

For more information on these requirements or how to retrieve/refresh your token please visit the chata.io developer site https://chata.readme.io

# Components

#### ChatDrawer
A chat panel that slides open from the edge of the screen. You will find a list of available props and their defaults in the next section.
```
<div id="my-drawer-container">
</div>

<script>
var chata = ChatDrawer.init('my-drawer-container', {
    placement: 'left',
    width: 650,
    theme: 'light',
    apiKey: 'your-api-key',
    customerId: 'your-customer-id',
    userId: 'your@email.com',
    domain: 'https://yourdomain.com'
});
</script>

```

#### ChatBar and ResponseRenderer

A chat bar component and visualization component that can be placed anywhere. The ChatBar component ref should be passed into the ResponseRenderer component as a prop. This will link the two components together so they can interact with eachother.

You will find a list of available props and their defaults in the next section.
```
<script>
//Create the components
var chatBar = ChatDrawer.getChatBar({
    apiKey: 'your-api-key',
    customerId: 'your-customer-id',
    userId: 'your@email.com',
    domain: 'https://yourdomain.com',
    autoCompletePlacement: 'bottom',
});
var responseRenderer = ChatDrawer.createResponseRenderer({});

//Bind the chatBar to responseRenderer
chatBar.bind(responseRenderer);

//Add components to document
document.getElementById('my-container').append(chatBar);
document.getElementById('my-response').append(responseRenderer);
</script>
```


# Props

#### ChatDrawer Props

| Prop | Type | Default Value |
| :------------ | :------------- | :------------ |
| token (Required) | String | - |
| apiKey (Required) | String | - |
| customerId (Required) | String | - |
| userId (Required) | String | - |
| domain (Required) | String | - |
| isVisible |  Boolean | false |
| placement | String: 'left' &#124;&#124; 'right' &#124;&#124; 'top' &#124;&#124; 'bottom' |  'right' |
| width | String &#124;&#124; Number | 500 |
| height | String &#124;&#124; Number | 350 |
| theme | String: 'light' &#124;&#124; 'dark' | 'light' |
| accentColor | String | light theme: '#28a8e0', dark theme: '#525252' |
| title | String | 'Chat with your data' |
| showHandle | Boolean | true |
| handleStyles | Object | {} |
| onVisibleChange | Function | () => {} |
| onHandleClick | Function | () => {} |
| onMaskClick | Function | onHandleClick |
| maskClosable | Boolean | true |
| customerName | String | 'there' |
| introMessage | String | 'Hi {customerName}! I'm here to help you access, search and analyze your data.' |
| maxMessages |  Number | undefined |
| clearOnClose | Boolean | false |
| enableVoiceRecord | Boolean | true |
| enableAutocomplete | Boolean | true |
| autocompleteStyles | Object | {} |
| enableSafetyNet | Boolean | true |
| enableDrilldowns |  Boolean | true |
| demo | Boolean | false |
| fontFamily | String | 'sans-serif' |
| chartColors | Array | ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'] |

#### ChatBar Props
| Prop | Type | Default Value |
| :------------ | :------------- | :------------ |
| token (Required) | String | - |
| apiKey (Required) | String | - |
| customerId (Required) | String | - |
| userId (Required) | String | - |
| domain (Required) | String | - |
| isDisabled | Boolean | false |
| onSubmit | Function | () => {} |
| onResponseCallback | Function | () => {} |
| autoCompletePlacement | String | 'top' |
| showLoadingDots | Boolean | true |
| showChataIcon | Boolean | true |
| enableAutocomplete | Boolean | true |
| autocompleteStyles | Object | {} |
| enableSafetyNet | Boolean | true |
| enableDrilldowns |  Boolean | true |
| demo | Boolean | false |
| fontFamily | String | 'sans-serif' |

#### ResponseRenderer Props
| Prop | Type | Default Value |
| :------------ | :------------- | :------------ |
| supportsSuggestions | Boolean | true |
| onSuggestionClick | Function | undefined |
| tableBorderColor | String | undefined |
| tableHoverColor | String | undefined |
| displayType | String | undefined |
| renderTooltips | Boolean | true |
| fontFamily | String | 'sans-serif' |
| chartColors | Array | ['#355C7D', '#6C5B7B', '#C06C84', '#f67280', '#F8B195'] |

#### Prop Descriptions
**isVisible**: Whether the drawer is open or not. You have full control over the visibility of the drawer by using your own state.

**placement**: Which edge of the screen to place the drawer.

**width**: Set the drawer width in pixels. If the value is larger than the screen width, the screen width will be used. This value will only be applied for placements "left" and "right" only. The value will be ignored for "top" and "bottom" placements.

**height**: Set the drawer height in pixels. If the value is larger than the screen height, the screen height will be used. This value will only be applied for placements "top" and "bottom" only. The value will be ignored for "left" and "right" placements.

**title**: Text that appears in the header of the chat window. You must provide an empty string if you do not want text here, otherwise the default text will be used.

**showHandle**: Whether or not to show the handle. If you do not want to show the handle, you can use your own custom button and control the drawer with the isVisible prop.

**handleStyles**: Specify custom css styles for the handle. (ie. { 'background-color': '#000000' }).

**clearOnClose**: Whether or not to clear all messages when the drawer is closed. The intro message will still show when you open the drawer again.

**maxMessages**: Maximum amount of messages to show in the drawer at one time. If a new message is added and you have reached the maximum, the oldest message will be erased. Any number smaller than 2 will be ignored.

**theme**: Color theme for the chat drawer. Currently there is a light theme and a dark theme. You can also change the accent colour with the accentColor prop in addition to changing the theme.

**accentColor**: Main accent color used in the chat drawer. This is the color of the header, speech-to-text button, and the request messages. The chart colours will not be affected by this.

**chartColors**: An array of colors for the chart themes starting with the most primary. You can pass in any valid css color format in here, however it is recommended that the color is opaque. ie. "#26A7E9", "rgb(111, 227, 142)", or "red". The charts will always use the colors in order from first to last. If the chart requires more colors than provided, it will repeat the colors provided.

**onVisibleChange**: Callback after the drawer closes or opens.

**onHandleClick**: Callback when drawer handle is clicked.

**showMask**: Whether or not to show the mask (grayed out overlay when the chat drawer is open).

**onMaskClick**: If showMask is true, this is the callback for when the mask is clicked.

**maskClosable**: If this value is set to true, the onHandleClick function will be called when the mask is clicked. If showMask is false, this prop will be ignored.

**customerName**: Name used in the intro message (ie. "Hi Nikki! I am here..."). You can customize this value using names from your own database.

**introMessage**: Customize the intro message to use your own branded voice. The customerName prop will be ignored if this is provided.

**fontFamily**: Customize the font family to the provided font wherever possible. Accepts any css font family that is available, and if not it will default on sans-serif

**enableVoiceRecord**: Enables the speech to text button. Note that this feature is only available in Google Chrome. It will fail silently on other browsers.

**enableAutocomplete**: If this is enabled, you will see query suggestions as you type in the chat bar.

**autocompleteStyles**: Object with jsx css to style the auto-complete popup (ie. { borderRadius: '4px' }).

**enableSafetyNet**: If this is enabled, the query will first go through a "safetynet" endpoint. If chata detects that a label might be misspelled, suggestions for that label will be returned in a message.

For example: If you query 'How much money does Nikk owe me?', safetynet may detect that there is no label called 'Nikk', but there are labels called 'Nikki', and 'Nick' in your database. The message will then let you choose a different label and re-run the query.

If this value is false, the query will bypass the "safetynet" endpoint and be sent straight to the "query" endpoint.

**enableDrilldowns**: A new query will be sent when clicking on a table or chart element to "drill down" into the data. A new message will be sent to the user with more detailed data related to that clicked element. If this is false, nothing will happen when a table or chart element is clicked.

**demo**: If this value is true, the widget will use chata's demo Plumbing Co. as a data source.

**supportsSuggestions**: If this is true, the response message can have a list of suggestions if the query is not understood. If it is false, there will be a general error message in its place.

**processDrilldown**: Function to be called when a table or chart element is clicked. The ChatDrawer uses the drilldown endpoint from the chata.io open API https://chata.readme.io/reference/queries-1#querydrilldown

**onSuggestionClick**: Function to be called when a button from a suggestion response is clicked. By default, the query will be submitted through the ChatBar component.

**tableBorderColor**: Custom color provided to the tables for the dividing lines and borders. Default is a medium gray.

**tableHoverColor**: Custom color provided to the tables for the rows on hover. Default is a medium-dark gray.

**displayType**: This is where you can pass in the type of visualization you want for the data. The full list of display types is below:

| Display Type | Prop Value | Description |
| :------------ | :------------ | :------------ |
| Table | `table` | Displays array data in a regular table. |
| Pivot Table | `pivot_column` | Displays a multi-dimensional table |
| Bar Chart | `bar` | Ordinal data is on the y-axis, numerical data is on the x-axis, bars are horizontal. Will show a series for each column of data where applicable |
| Column Chart | `column` | Ordinal data is on the x-axis, numerical data is on the y-axis, bars are vertical. Will show a series for each column of data where applicable |
| Line Chart | `line` | Ordinal data is on the x-axis, numerical data is on the y-axis. Will show a line series for each column of data where applicable |
| Heat Map | `heatmap` | The position of the squares are based on the categories, and the opacity of the squares are based on the values |
| Bubble Chart | `bubble` | The position of the bubbles are based on the categories, and the radius of the bubbles are based on the values |
| Stacked Column chart | `stacked_column` | Ordinal data is on the x-axis, numerical data is on the y-axis, bars are vertical. Will show a series for each column in a stacked way of data when appropriate |
| Stacked Bar chart | `stacked_bar` | Ordinal data is on the y-axis, numerical data is on the x-axis, bars are horizontal. Will show a series for each column in a stacked way of data when appropriate |

You must pass in a supported display type to the ResponseRenderer (see the Supported Display Types section below for more details). If an invalid display type or non-supported display type is passed in, it will default to a regular table.

**renderTooltips**: Whether or not to render tooltips for chart display types. When this value is true, each chart element will have a tooltip showing the ordinal title/value and numerical title/value.


# Supported Display Types

You can get the supported display types calling the ChatDrawer.getSupportedDisplayTypesArray() that returns an array of strings.

```
// Will return ['table', 'pivot_table', 'bar' ...]
var supportedDisplayTypes = ChatDrawer.getSupportedDisplayTypesArray();

```
