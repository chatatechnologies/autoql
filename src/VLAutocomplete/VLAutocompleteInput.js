import { PopoverChartSelector } from '../../Charts/PopoverChartSelector';
import { CARET_DOWN_ICON } from '../../Svg';
import { createIcon, uuidv4 } from '../../Utils';

import {
    fetchVLAutocomplete,
    REQUEST_CANCELLED_ERROR,
    authenticationDefault,
    getAuthentication,
    deepEqual,
} from 'autoql-fe-utils';

import './Select.scss';
import { FilterLockingInput } from '../FilterLocking/Components/FilterLockingInput';

export function VLAutocompleteInput({ options, placeholder = '', initialValue, onChange = () => {}, context, column }) {
    this.ID = uuidv4();
    this.contentKey = uuid();
    this.autoCompleteArray = [];
    this.autocompleteDelay = 100;
    this.TOOLTIP_ID = 'filter-locking-tooltip';
    this.MAX_SUGGESTIONS = 10;
    //   this.suggestionList = undefined
    //   this.inputValue = ''
    //   this.isLoadingAutocomplete = false

    this.showPopover = () => {
        this.popover.show();
        this.scrollToValue(this.selectedValue);
    };

    this.scrollToValue = (value) => {
        const index = options?.findIndex((option) => value == option.value);
        const element = document.querySelector(`#select-option-${this.ID}-${index}`);
        if (element) {
            element.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'center',
            });
        }
    };

    this.createSelect = () => {
        this.autocompleteInput = document.createElement('div');
        this.autocompleteInput.classList.add('autoql-vanilla-select-and-label');

        this.selectedValue = initialValue;

        if (fullWidth) {
            this.autocompleteInput.classList.add('autoql-vanilla-select-full-width');
        }

        if (disabled) {
            this.autocompleteInput.setAttribute('disabled', true);
        }

        if (label) {
            const inputLabel = document.createElement('div');
            inputLabel.classList.add('autoql-vanilla-input-label');
            this.autocompleteInput.appendChild(inputLabel);
        }

        const selectElement = document.createElement('div');
        this.autocompleteInput.appendChild(selectElement);
        selectElement.classList.add('autoql-vanilla-select');

        if (outlined) {
            selectElement.classList.add('outlined');
        }

        if (size === 'small') {
            selectElement.classList.add('autoql-vanilla-select-small');
        } else {
            selectElement.classList.add('autoql-vanilla-select-large');
        }

        const selectText = document.createElement('span');
        selectElement.appendChild(selectText);
        selectText.classList.add('autoql-vanilla-select-text');

        const selectTextContent = document.createElement('span');
        this.selectTextContent = selectTextContent;
        selectText.appendChild(selectTextContent);

        this.autocompleteInput.setValue = (value) => {
            const selectedValue = value ?? this.selectedValue;
            const selectedOption = options.find((option) => option.value == selectedValue);

            if (!selectedOption) {
                return;
            }

            this.selectedValue = selectedOption.value;

            if (selectedOption?.label || selectedOption?.value) {
                selectTextContent.classList.add('autoql-vanilla-menu-item-value-title');
                selectTextContent.innerHTML = `${selectedOption.label ?? selectedOption.value}`;
            } else {
                selectTextContent.classList.add('autoql-vanilla-select-text-placeholder');
                selectTextContent.innerHTML = placeholder;
            }

            onChange(selectedOption);
        };

        this.autocompleteInput.setValue();

        if (showArrow) {
            const selectArrow = document.createElement('div');
            selectArrow.classList.add('autoql-vanilla-select-arrow');

            const selectArrowIcon = createIcon(CARET_DOWN_ICON);
            selectArrow.appendChild(selectArrowIcon);

            selectElement.appendChild(selectArrow);
        }

        selectElement.addEventListener('click', (e) => {
            if (this.popover) {
                this.popover = undefined;
            } else {
                this.popover = new PopoverChartSelector(e, position, align, 0);
                this.popover.classList.add('autoql-vanilla-select-popover');
                if (popoverClassName) this.popover.classList.add(popoverClassName);

                const selectorContent = this.createPopoverContent();

                this.popover.appendContent(selectorContent);

                this.showPopover();
            }
        });
    };

    this.createPopoverContent = () => {
        var selectorContainer = document.createElement('div');
        var selectorContent = document.createElement('ul');

        selectorContainer.classList.add('autoql-vanilla-axis-selector-container');
        selectorContent.classList.add('autoql-vanilla-axis-selector-content');

        options?.forEach((option, i) => {
            const li = document.createElement('li');

            li.classList.add('autoql-vanilla-select-list-item');
            li.id = `select-option-${this.ID}-${i}`;

            if (option.value == this.selectedValue) {
                li.classList.add('active');
            }

            li.onclick = (e) => {
                e.stopPropagation();
                this.autocompleteInput.setValue(option.value);
                this.popover?.close();
            };

            const listLabel = option?.listLabel ?? option?.label ?? option?.value;

            if (typeof listLabel === 'object') {
                li.appendChild(listLabel);
            } else {
                li.innerHTML = listLabel;
            }

            selectorContent.appendChild(li);
        });

        selectorContainer.appendChild(selectorContent);
        return selectorContainer;
    };

    this.createSelect();
    this.createPopoverContent();

    // return this.autocompleteInput;
    return new FilterLockingInput({ options });
}

// export default class VLAutocompleteInput extends React.Component {
//     constructor(props) {
//         super(props);
//     }

//     static propTypes = {
//         authentication: authenticationType,
//         popoverPosition: PropTypes.string,
//         column: PropTypes.string,
//         context: PropTypes.string,
//         onChange: PropTypes.func,
//     };

//     static defaultProps = {
//         authentication: authenticationDefault,
//         popoverPosition: 'bottom',
//         column: undefined,
//         context: undefined,
//         onChange: () => {},
//     };

//     componentDidMount = () => {
//         this._isMounted = true;
//     };

//     shouldComponentUpdate = (nextProps, nextState) => {
//         return !deepEqual(this.props, nextProps) || !deepEqual(this.state, nextState);
//     };

//     componentWillUnmount = () => {
//         this._isMounted = false;
//         clearTimeout(this.focusInputTimeout);
//         clearTimeout(this.highlightFilterEndTimeout);
//         clearTimeout(this.highlightFilterStartTimeout);
//         clearTimeout(this.savingIndicatorTimeout);
//         clearTimeout(this.autocompleteTimer);
//     };

//     showSavingIndicator = () => {
//         if (this.savingIndicatorTimeout) {
//             clearTimeout(this.savingIndicatorTimeout);
//         }
//         this.setState({ isSaving: true });
//         this.savingIndicatorTimeout = setTimeout(() => {
//             this.setState({ isSaving: false });
//         }, 1500);
//     };

//     handleHighlightFilterRow(filterKey) {
//         this.props.onToast?.('This filter has already been applied.');
//         const startAt = 0;
//         const duration = 1300;

//         this.highlightFilterStartTimeout = setTimeout(() => {
//             this.setState({ highlightedFilter: filterKey });
//         }, startAt);

//         this.highlightFilterEndTimeout = setTimeout(() => {
//             this.setState({ highlightedFilter: undefined });
//         }, duration);
//     }

//     animateInputTextAndSubmit = (text) => {
//         if (typeof text === 'string' && text?.length) {
//             const totalTime = 500;
//             const timePerChar = totalTime / text.length;
//             for (let i = 0; i < text.length; i++) {
//                 setTimeout(() => {
//                     if (this._isMounted) {
//                         this.setState({ inputValue: text.slice(0, i + 1) });
//                         if (i === text.length - 1) {
//                             this.focusInputTimeout = setTimeout(() => {
//                                 this.inputElement = document.querySelector('#react-autoql-filter-menu-input');
//                                 this.inputElement?.focus();
//                             }, 300);
//                         }
//                     }
//                 }, i * timePerChar);
//             }
//         }
//     };

//     insertFilter = (filterText) => {
//         const existingFilter = this.findFilter({ filterText });
//         if (filterText && existingFilter) {
//             this.handleHighlightFilterRow(this.getKey(existingFilter));
//         } else {
//             this.animateInputTextAndSubmit(filterText);
//         }
//     };

//     findFilter = ({ filterText, value, key }) => {
//         const allFilters = this.props.filters;

//         if (!allFilters?.length) {
//             return;
//         }

//         if (value && key) {
//             return allFilters.find((filter) => filter.key === key && filter.value === value);
//         } else if (filterText) {
//             return allFilters.find((filter) => filter.value === filterText);
//         }

//         return undefined;
//     };

//     fetchAllSuggestions = () => {
//         if (!this.allSuggestions) {
//             this.fetchSuggestions({ value: '' });
//         }
//     };

//     fetchSuggestions = ({ value }) => {
//         // If already fetching autocomplete, cancel it
//         if (this.axiosSource) {
//             this.axiosSource.cancel(REQUEST_CANCELLED_ERROR);
//         }

//         this.setState({ isLoadingAutocomplete: true });

//         this.axiosSource = axios.CancelToken?.source();

//         return fetchVLAutocomplete({
//             ...getAuthentication(this.props.authentication),
//             suggestion: value,
//             context: this.props.context,
//             filter: this.props.column,
//             cancelToken: this.axiosSource.token,
//         })
//             .then((response) => {
//                 const body = response?.data?.data;
//                 const sortingArray = [];
//                 let suggestionsMatchArray = [];
//                 this.autoCompleteArray = [];
//                 suggestionsMatchArray = [...body.matches];

//                 let numMatches = suggestionsMatchArray.length;
//                 if (numMatches > this.MAX_SUGGESTIONS) {
//                     numMatches = this.MAX_SUGGESTIONS;
//                 }

//                 for (let i = 0; i < numMatches; i++) {
//                     sortingArray.push(suggestionsMatchArray[i]);
//                 }

//                 sortingArray.sort((a, b) => {
//                     const aText = a.format_txt;
//                     const bText = b.format_txt;
//                     return aText.toUpperCase() < bText.toUpperCase() ? -1 : aText > bText ? 1 : 0;
//                 });
//                 for (let idx = 0; idx < sortingArray.length; idx++) {
//                     const anObject = {
//                         name: sortingArray[idx],
//                     };
//                     this.autoCompleteArray.push(anObject);
//                 }

//                 if (!value) {
//                     this.allSuggestions = this.autoCompleteArray;
//                 }

//                 this.setState({
//                     suggestions: this.autoCompleteArray,
//                     isLoadingAutocomplete: false,
//                 });

//                 return this.autoCompleteArray;
//             })
//             .catch((error) => {
//                 if (error?.data?.message !== REQUEST_CANCELLED_ERROR) {
//                     console.error(error);
//                 }

//                 this.setState({ isLoadingAutocomplete: false });
//             });
//     };

//     onSuggestionsFetchRequested = ({ value }) => {
//         // Only debounce if a request has already been made
//         if (this.axiosSource) {
//             clearTimeout(this.autocompleteTimer);
//             this.autocompleteStart = Date.now();
//             this.autocompleteTimer = setTimeout(() => {
//                 this.fetchSuggestions({ value });
//             }, this.autocompleteDelay);
//         } else {
//             this.fetchSuggestions({ value });
//         }
//     };

//     onSuggestionsClearRequested = () => {};

//     createNewFilterFromSuggestion = (suggestion) => {
//         let filterType = 'include';
//         const filterSameCategory = this.props.filters?.find?.(
//             (filter) => filter.show_message === suggestion.show_message,
//         );
//         if (filterSameCategory) {
//             filterType = filterSameCategory.filter_type;
//         }

//         const newFilter = {
//             value: suggestion.keyword,
//             format_txt: suggestion.format_txt,
//             show_message: suggestion.show_message,
//             key: suggestion.canonical,
//             filter_type: filterType,
//         };

//         return newFilter;
//     };

//     getSuggestionValue = (sugg) => {
//         const name = sugg.name;
//         const selectedFilter = this.createNewFilterFromSuggestion(name);
//         return selectedFilter;
//     };

//     selectAll = () => {
//         this.inputElement?.select?.();
//     };

//     onInputFocus = () => {
//         this.selectAll();
//         this.fetchAllSuggestions();
//     };

//     onInputChange = (e, { newValue, method }) => {
//         if (method === 'up' || method === 'down') {
//             return;
//         }

//         if (method === 'enter' || method === 'click') {
//             this.props.onChange(newValue);
//             if (this.findFilter(newValue)) {
//                 this.handleHighlightFilterRow(this.getKey(newValue));
//             } else {
//                 this.props.setFilter?.(newValue);
//             }
//         }

//         if (typeof e?.target?.value === 'string') {
//             const newState = { inputValue: e.target.value };
//             if (!e?.target?.value && this.allSuggestions?.length) {
//                 newState.suggestions = this.allSuggestions;
//             }

//             this.setState(newState);
//         }
//     };

//     getKey = (filter) => {
//         const key = filter.key || filter.canonical;
//         const value = filter.value || filter.keyword;
//         return `${key}-${value}`;
//     };

//     renderSuggestion = ({ name }) => {
//         const displayName = name.format_txt ?? name.keyword;

//         if (!displayName) {
//             return null;
//         }

//         let displayNameType = '';
//         if (name.show_message) {
//             displayNameType = `(${name.show_message})`;
//         }

//         return (
//             <span
//                 className='filter-lock-suggestion-item'
//                 data-tooltip-id={this.props.tooltipID ?? this.TOOLTIP_ID}
//                 data-tooltip-delay-show={1000}
//                 data-tooltip-html={`<strong>${displayName}</strong> <em>${displayNameType}</em>`}
//             >
//                 <strong>{displayName}</strong> <em>{displayNameType}</em>
//             </span>
//         );
//     };

//     renderSuggestionsContainer = ({ containerProps, children, query }) => {
//         let maxHeight = 150;
//         const padding = 20;
//         const listContainerHeight = this.filterListContainerRef?.clientHeight;

//         if (!isNaN(listContainerHeight)) {
//             maxHeight = listContainerHeight - padding;
//         }

//         return (
//             <div {...containerProps}>
//                 <div className='react-autoql-filter-suggestion-container'>
//                     {/* <CustomScrollbars autoHeight autoHeightMin={0} maxHeight={maxHeight}> */}
//                     {children}
//                     {/* </CustomScrollbars> */}
//                 </div>
//             </div>
//         );
//     };

//     getSuggestions = () => {
//         const showAllSuggestions = !this.state.inputValue && this.allSuggestions?.length;
//         const noSuggestions =
//             this.state.suggestions && !this.state.suggestions?.length && !this.state.isLoadingAutocomplete;
//         const title = this.state.inputValue ? `Results for "${this.state.inputValue}"` : undefined;

//         // Suggestions have not been fetched yet
//         if (!this.state.suggestions) {
//             return [];
//         }

//         // If text is deleted, but full list has previously been fetched, show full list
//         if (showAllSuggestions) {
//             return [
//                 {
//                     title: undefined,
//                     suggestions: this.allSuggestions,
//                 },
//             ];
//         }

//         // Suggestions have been fetched, but there were no results
//         if (noSuggestions) {
//             return [
//                 {
//                     title,
//                     suggestions: [{ name: '' }],
//                     emptyState: true,
//                 },
//             ];
//         }

//         // Default to current suggestion state
//         return [
//             {
//                 title,
//                 suggestions: this.state.suggestions,
//             },
//         ];
//     };

//     renderSectionTitle = (section) => {
//         return (
//             <>
//                 <strong>{section.title}</strong>
//                 {section.emptyState ? (
//                     <div className='filter-locking-no-suggestions-text'>
//                         <em>No results</em>
//                     </div>
//                 ) : null}
//             </>
//         );
//     };

//     render = () => {
//         return (
//             <ErrorBoundary>
//                 <span className='react-autoql-vl-autocomplete-input-wrapper'>
//                     <Autosuggest
//                         id='react-autoql-filter-menu-input'
//                         highlightFirstSuggestion
//                         suggestions={this.getSuggestions()}
//                         renderSuggestion={this.renderSuggestion}
//                         getSuggestionValue={this.getSuggestionValue}
//                         onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
//                         onSuggestionsClearRequested={this.onSuggestionsClearRequested}
//                         renderSuggestionsContainer={this.renderSuggestionsContainer}
//                         getSectionSuggestions={(section) => section.suggestions}
//                         renderSectionTitle={this.renderSectionTitle}
//                         alwaysRenderSuggestions={true}
//                         multiSection={true}
//                         inputProps={{
//                             ref: (r) => (this.inputElement = r),
//                             onChange: this.onInputChange,
//                             value: this.state.inputValue,
//                             disabled: this.props.isFetchingFilters || this.state.isFetchingFilters,
//                             placeholder: this.props.placeholder ?? 'Search & select a filter',
//                             ['data-test']: 'react-autoql-filter-locking-input',
//                             className: 'react-autoql-vl-autocomplete-input',
//                             id: 'react-autoql-filter-menu-input',
//                             onFocus: this.onInputFocus,
//                         }}
//                     />
//                 </span>
//             </ErrorBoundary>
//         );
//     };
// }
