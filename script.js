const INPUT_BUBBLES = `
<svg x="0px" y="0px" width="23.7px" height="23.7px" viewBox="0 0 23.7 23.7">
    <path class="chata-icon-svg-0" d="M8.7,3.6l0.1,0l0,0l0,0l0.1,0c2.2,0,4.3,1.3,5.2,3.3c0.2,0.4,0.3,0.7,0.4,1.1l0,0c0.1,0.4,0.1,0.8,0.1,1.2 c0,1.3-0.5,2.5-1.3,3.4c-0.4,0.4-0.8,0.7-1.2,1c-0.3,0.2-0.7,0.4-1,0.5c-0.4,0.1-0.7,0.2-1.1,0.3c-0.4,0.1-0.8,0.1-1.2,0.1 c-0.2,0-0.4,0-0.6,0c-0.2,0-0.4,0-0.6-0.1l-0.2,0c-0.3-0.1-0.6-0.2-1-0.3c-0.4-0.2-0.7-0.4-1-0.6l-1-0.9l-1,1 c-0.1,0.1-0.2,0.2-0.3,0.2c0-0.3,0-0.6,0-1l0-3.6c0-0.1,0-0.1,0-0.2C3.2,6,5.7,3.6,8.7,3.6L8.7,3.6 M8.7,2.1c-3.8,0-6.9,3-7,6.9 c0,0.1,0,0.2,0,0.2v3.6c0,2.6-1,3.2-1,3.2c0.1,0,0.2,0,0.3,0c1.3,0,2.5-0.5,3.5-1.4c0.4,0.4,0.9,0.7,1.5,0.9c0.5,0.2,1,0.3,1.5,0.4 l0,0C7.7,16,7.9,16,8.1,16c0.2,0,0.5,0,0.7,0c0,0,0,0,0,0c0.5,0,1,0,1.5-0.1c0.5-0.1,0.9-0.2,1.4-0.4c0.4-0.2,0.9-0.4,1.3-0.6 c0.6-0.4,1.1-0.8,1.6-1.3c1.1-1.2,1.7-2.8,1.7-4.5c0-0.5-0.1-1-0.2-1.5l0,0c0,0,0,0,0,0c0,0,0,0,0,0l0,0c-0.1-0.5-0.3-1-0.5-1.5 c-1.2-2.5-3.8-4.1-6.6-4.1c0,0-0.1,0-0.1,0C8.8,2.1,8.7,2.1,8.7,2.1L8.7,2.1z">
    </path>
    <path class="chata-icon-svg-0" d="M15,9.1c3,0,5.4,2.4,5.5,5.4c0,0.1,0,0.1,0,0.2v3.6c0,0.4,0,0.7,0,1c-0.1-0.1-0.2-0.2-0.3-0.2l-1-1l-1,0.9 c-0.3,0.3-0.7,0.5-1,0.6c-0.3,0.1-0.6,0.2-0.9,0.3L16,20c-0.2,0-0.4,0.1-0.6,0.1c-0.2,0-0.4,0-0.6,0c-0.4,0-0.8,0-1.2-0.1 c-0.4-0.1-0.8-0.2-1.1-0.3c-0.3-0.1-0.7-0.3-1-0.5c-0.5-0.3-0.9-0.6-1.2-1C9.5,17.2,9,16,9,14.7c0-0.4,0-0.8,0.1-1.1l0,0l0,0 c0.1-0.4,0.2-0.8,0.4-1.1c1-2,3-3.3,5.2-3.3l0.1,0l0,0l0,0L15,9.1 M15,7.6c0,0-0.1,0-0.1,0c0,0-0.1,0-0.1,0c-2.8,0-5.4,1.6-6.6,4.1 c-0.2,0.5-0.4,1-0.5,1.5l0,0c0,0,0,0,0,0c0,0,0,0,0,0l0,0c-0.1,0.5-0.2,1-0.2,1.5c0,1.6,0.6,3.2,1.7,4.5c0.5,0.5,1,1,1.6,1.3 c0.4,0.2,0.8,0.5,1.3,0.6c0.4,0.2,0.9,0.3,1.4,0.4c0.5,0.1,1,0.1,1.5,0.1c0,0,0,0,0,0c0.2,0,0.5,0,0.7,0c0.2,0,0.5,0,0.7-0.1l0,0 c0.5-0.1,1-0.2,1.5-0.4c0.6-0.2,1.1-0.5,1.5-0.9c0.9,0.9,2.2,1.4,3.5,1.4c0.1,0,0.2,0,0.3,0c0,0-1-0.6-1-3.2v-3.6 c0-0.1,0-0.2,0-0.2C21.9,10.7,18.8,7.6,15,7.6L15,7.6z">
    </path>
</svg>
`;


const getActiveIntegrator = (domain) => {
    if (domain.includes('spira')) {
        return 'spira'
    } else if (domain.includes('locate')) {
        return 'locate'
    } else if (domain.includes('purefacts')) {
        return 'purefacts'
    } else if (domain.includes('bluelink')) {
        return 'bluelink'
    } else if (domain.includes('lefort')) {
        return 'lefort'
    } else if (domain.includes('nbccontest')) {
        return 'nbcomp'
    } else if (domain.includes('vitruvi')) {
        return 'vitruvi'
    } else if (domain.includes('accounting-demo')) {
        return 'demo'
    }

    return '';
}

const getIntroMessageTopics = (integrator) => {
    const topics =
    {
        spira: [
            {
                topic: 'Revenue',
                queries: [
                    'Total revenue this year',
                    'Total revenue by month for the last six months',
                    'Total revenue by area last year',
                    'Total revenue by customer for the last six months',
                    'Average revenue by area last year',
                    'Average revenue by ticket type for the last six months',
                ],
            },
            {
                topic: 'Estimates',
                queries: [
                    'Total estimates by area last year',
                    'Total estimates by ticket type last year',
                    'Number of estimates by customer this year',
                    'Number of estimates by job type last year',
                    'Average estimates by ticket type last year',
                    'Average estimates by month last year',
                ],
            },
            {
                topic: 'Utilization',
                queries: [
                    'Total utilization on resources last month',
                    'Total resource hours by area last month ',
                    'Total hours utilized for personnel last month',
                    'Total hours utilization by job last month',
                    'Total hours utilization on equipment last year',
                    'Average hours utilization by job type last month',
                ],
            },
            {
                topic: 'Jobs',
                queries: [
                    'All jobs scheduled to start this year',
                    'All active jobs scheduled to end last year',
                    'All jobs still open from last year',
                    'All jobs in bid state',
                    'Number of scheduled jobs by area',
                    'Number of open jobs by customer',
                ],
            },
            {
                topic: 'Tickets',
                queries: [
                    'Total tickets by month last year',
                    'Total tickets by customer this year',
                    'Average ticket by area last year',
                    'All void tickets over 10000',
                    'Average ticket by ticket type last year',
                    'Total tickets by type by month for the last six months',
                ],
            },
        ],
        locate: [
            {
                topic: 'Sales',
                queries: [
                    'Total sales by state last year',
                    'Average sales by month last year',
                    'Total sales by customer this year',
                ],
            },
            {
                topic: 'Purchase Orders',
                queries: [
                    'Last purchase order over 10000',
                    'Total purchase orders by vendor this year',
                    'All unissued purchase orders from last year',
                ],
            },
            {
                topic: 'Parts',
                queries: [
                    'Top 5 parts by sales order',
                    'Show me all parts expiring this year',
                    'All parts priced below last cost',
                ],
            },
            {
                topic: 'Margins',
                queries: [
                    'Gross margin by part this year',
                    'Gross margin by customer last year',
                    'Gross margin by invoice this year',
                ],
            },
        ],
        demo: [
            {
                topic: 'Sales',
                queries: [
                    'Total sales last month',
                    'Top 5 customers by sales this year',
                    'Total sales by revenue account last year',
                    'Total sales by item from services last year',
                    'Average sales per month last year',
                ],
            },
            {
                topic: 'Items',
                queries: [
                    'Top 5 items by sales',
                    'Which items were sold the least last year',
                    'Average items sold per month last year',
                    'Total profit per item last month',
                    'Total items sold for services last month',
                ],
            },
            {
                topic: 'Expenses',
                queries: [
                    'All expenses last month',
                    'Monthly expenses by vendor last year',
                    'Total expenses by account last quarter',
                    'Total expenses by quarter last year',
                    'Show me expenses last year over 10000',
                ],
            },
            {
                topic: 'Purchase Orders',
                queries: [
                    'All purchases over 10000 this year',
                    'All open purchase orders',
                    'Total purchase orders by vendor this year',
                    'Total purchase orders by quarter last year',
                    'Top 5 vendors by purchase orders',
                ],
            },
        ],
        lefort: [
            {
                topic: 'Ingresos',
                queries: [
                    'ingresos el año pasado',
                    'ingresos totales por mes 2017',
                    'promedio de las facturas de ingresos por mes 2017',
                    'cuántos facturas de ingresos hay por mes 2017',
                ],
            },
            {
                topic: 'Egresos',
                queries: [
                    'egresos para MXN',
                    'egresos totales para MXN',
                    'promedio de las facturas de egresos por mes 2017',
                    'cuántos facturas de egresos hay por mes 2017',
                ],
            },
            {
                topic: 'Pagos',
                queries: [
                    'pagos el año pasado',
                    'promedio de pagos por año',
                    'pagos totales 2017',
                    'pagos totales por autorizado por tipo',
                ],
            },
            {
                topic: 'Nómina',
                queries: [
                    'nóminas',
                    'nómina total por año',
                    'promedio de nómina por año',
                    'cuántas nóminas hay por mes',
                ],
            },
        ],
        vitruvi: [
            {
                topic: 'Tickets',
                queries: [
                    'All open tickets due this year',
                    'All tickets created last year',
                    'Number of tickets by status',
                ],
            },
            {
                topic: 'Work Package',
                queries: [
                    'All work packages created this year',
                    'how many work packages for each manager this year',
                    'how many work packages by type last year',
                ],
            },
            {
                topic: 'Work Order',
                queries: [
                    'List all work orders created this year',
                    'Number of working orders in progress by region this year',
                    'Number of work orders by program this year',
                ],
            },
        ],
        bluelink: [
            {
                topic: 'Sales orders',
                queries: [
                    'All open sales orders from last year',
                    'Total sales orders by customer last year',
                    'Total sales orders by month last year',
                ],
            },
            {
                topic: 'Products',
                queries: [
                    'All products sold at a loss last year',
                    'Top 5 average sales orders by product last year',
                    'Total sales by product by month last year',
                ],
            },
            {
                topic: 'Gross margin',
                queries: [
                    'Total gross margin by country last year',
                    'Total gross margin by customer last year',
                    'Total gross margin by product last year',
                ],
            },
        ]
    }

    return topics[integrator]
}
