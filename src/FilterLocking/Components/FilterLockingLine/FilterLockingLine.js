import './FilterLockingLine.css'

export function FilterLockingLine(data){
    const {
        show_message
    } = data[0]
    console.log(data);
    // app_id: 1500
    // customer_id: "accounting-demo"
    // filter_type: "include"
    // id: 10298
    // key: "ITEM_0_NAME_VALUE_LABEL"
    // lock_flag: null
    // model_id: 10010
    // project_id: 159
    // show_message: "Item Name"
    // user_id: "vidhya@chata.ai"
    // user_type: "user"
    // value: "Seals"
    var view = document.createElement('div')
    var titleContainer = document.createElement('div')
    var titleWrapper = document.createElement('div')
    var title = document.createElement('h4')
    var categoryContainer = document.createElement('span')

    categoryContainer.textContent = show_message

    categoryContainer.classList.add('autoql-vanilla-filter-lock-category-title')
    titleContainer.classList.add('autoql-vanilla-filter-list-title')

    title.appendChild(categoryContainer)
    titleWrapper.appendChild(title)
    titleContainer.appendChild(titleWrapper)
    view.appendChild(titleContainer)

    view.data = data
    return view
}
