import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

export function refreshTooltips(){
    tippy('[data-tippy-content]', {
        theme: 'chata-theme',
        allowHTML: true,
        delay: [500],
        dynamicTitle: true
    })
}

export function tooltipCharts(){
    var get2dContent = (instance) => {
        var dataset = instance.reference.dataset;
        var content  = `
            <span class='title-tip'>${dataset.col1}:</span>
            <span class="text-tip">${dataset.colvalue1}</span>
        `;
        content += '<br/>';
        content += `
        <span class='title-tip'>${dataset.col2}:</span>
        <span class="text-tip">${dataset.colvalue2}</span>
        `;
        return content;
    }

    tippy('.tooltip-2d', {
        theme: 'chata-theme',
        allowHTML: true,
        onShow: function(instance){
            instance.setContent(
                get2dContent(instance)
            );
        }
    })

    tippy('.tooltip-3d', {
        theme: 'chata-theme',
        allowHTML: true,
        onShow: function(instance){
            var dataset = instance.reference.dataset;
            var content = get2dContent(instance);
            content += '<br/>';
            content += `
                <span class='title-tip'>${dataset.col3}:</span>
                <span class="text-tip">${dataset.colvalue3}</span>
            `;
            instance.setContent(
                content
            );
        }
    })
}
