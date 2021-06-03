import LocalizedStrings from 'localized-strings';

String.prototype.chataFormat = function () {
    var a = this;
    for (var k in arguments) {
        a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
    }
    return a
}

export const strings = new LocalizedStrings({
    en:{
        report: 'report',
        introMessage: 'Hi {0} Let’s dive into your data. What can I help you discover today?',
        there: 'there!',
        dataIncorrect: 'The data is incorrect',
        dataIncomplete: 'The data is incomplete',
        other: 'Other...',
        reportProblemTitle: 'Report a Problem',
        reportProblemMessage: 'Please tell us more about the problem you are experiencing:',
        reportProblem: 'Report',
        feedback: 'Thank you for your feedback',
        cancel: 'Cancel',
        viewSQL: 'View generated SQL',
        createAlert: 'Create a Data Alert...',
        dataRowLimit: 'The display limit of {0} rows has been reached. Try querying a smaller time-frame to ensure all your data is displayed.',
        copyTextToClipboard: 'Successfully copied table to clipboard!',
        initTileMessage: 'To get started, enter a query and click',
        singleView: 'Single View',
        splitView: 'Split View',
        dashboardQueryInput: 'Type a query in your own words',
        dashboarTitleInput: 'Add descriptive title (optional)',
        executeDashboard: 'Hit "Execute" to run this dashboard',
        noQuerySupplied: 'No query was supplied for this tile.',
        untitledTile: 'Untitled',
        queryText: 'Query',
        titleText: 'Title',
        allColsHidden: 'All columns in this table are currently hidden. You can adjust your column visibility preferences using the Column Visibility Manager (<span class="chata-icon eye-icon">{0}</span>) in the Options Toolbar.',
        safetynet: 'I need your help matching a term you used to the exact corresponding term in your database. Verify by selecting the correct term from the menu below:',
        addedNewTile1: 'Add a  ',
        addedNewTile2: '<span class="empty-dashboard-new-tile-btn">New Tile </span>',
        addedNewTile3: 'to get started',
        showChart: 'Show Chart',
        hideChart: 'Hide Chart',
        closeDrawer: 'Close Drawer',
        clearMessages: 'Clear Messages',
        exploreQueries: 'Explore Queries',
        notifications: 'Notifications',
        dmInputPlaceholder: 'Type your queries here',
        voiceRecord: 'Hold for voice-to-text',
        exploreQueriesInput: 'Search relevant queries by topic',
        exploreQueriesMessage1: 'Discover what you can ask by entering a topic in the search bar above.',
        exploreQueriesMessage2: 'Simply click on any of the returned options to run the query in Data Messenger.',
        cascaderIntro: 'Some things you can ask me:',
        cascaderFooter: 'to further explore the possibilities.',
        seeMore: 'See more...',
        use: 'Use',
        barChart: 'Bar Chart',
        columnChart: 'Column Chart',
        lineChart: 'Line Chart',
        pieChart: 'Pie Chart',
        stackedBar: 'Stacked Bar Chart',
        stackedColumn: 'Stacked Column Chart',
        stackedLine: 'Stacked Area Chart',
        heatmap: 'Heatmap',
        bubbleChart: 'Bubble Chart',
        table: 'Table',
        pivotTable: 'Pivot Table',
        deleteDataResponse: 'Delete data response',
        moreOptions: 'More options',
        downloadPNG: 'Download as PNG',
        filterTable: 'Filter Table',
        showHideCols: 'Show/Hide Columns',
        copyTable: 'Copy table to clipboard',
        downloadCSV: 'Download as CSV',
        columnName: 'Column Name',
        visibility: 'Visibility',
        apply: 'Apply',
        turnDataAlertOff: 'Turn Data Alert Off',
        turnDataAlertOn: 'Turn Data Alert On',
        editDataAlert: 'Edit Data Alert',
        dismissAll: 'Dismiss All',
        noneOfThese: 'None of these',
        dataAlertsTitleCustom: 'Custom Data Alerts',
        dataAlertsTitle: 'Subscribe to a Data Alert',
        dataAlertsMessage1: 'Choose from a range of ready-to-use Alerts that have been set up for you',
        dataAlertsMessage2: 'View and manage your custom Data Alerts',
    },
    es: {
        report: 'repórtalo',
        introMessage: 'Hola {0} Analicemos sus datos. ¿Qué puedo ayudarte a descubrir hoy?',
        there: '',
        dataIncorrect: 'Los datos son incorrectos',
        dataIncomplete: 'Los datos están incompletos',
        other: 'Otro...',
        reportProblemTitle: 'Reportar un problema',
        reportProblemMessage: 'Cuéntenos más sobre el problema que estás presentando:',
        reportProblem: 'Reportar',
        feedback: 'Gracias por tu retroalimentación',
        cancel: 'Cancelar',
        viewSQL: 'Ver SQL generado',
        createAlert: 'Crear una alerta de datos...',
        dataRowLimit: 'Se alcanzó el límite de visualización de {0} filas. Intente consultar un rango de tiempo más pequeño para asegurarse de que se muestren todos sus datos.',
        copyTextToClipboard: 'La consulta generada se copió correctamente en el portapapeles.',
        initTileMessage: 'Para comenzar, ingrese una consulta y haga click en ejecutar',
        singleView: 'Single View',
        splitView: 'Split View',
        dashboardQueryInput: 'Escribe una consulta con sus propias palabras',
        dashboarTitleInput: 'Agregar título descriptivo (opcional)',
        executeDashboard: 'Haga clic en "Ejecutar" para ejecutar este tablero.',
        noQuerySupplied: 'No se proporcionó ninguna consulta para este titulo.',
        untitledTile: 'Sin titulo',
        queryText: 'Consulta',
        titleText: 'Título',
        allColsHidden: 'Actualmente, todas las columnas de esta tabla están ocultas. Puede ajustar sus preferencias de visibilidad de columna usando el Administrador de visibilidad de columna (<span class="chata-icon eye-icon">{0}</span>) en la barra de herramientas de opciones.',
        safetynet: 'Necesito tu ayuda para hacer coincidir un término que utilizó con el término correspondiente exacto en su base de datos. Verifique seleccionando el término correcto en el menú a continuación:',
        addedNewTile1: 'Agregue un  ',
        addedNewTile2: '<span class="empty-dashboard-new-tile-btn">nuevo título </span>',
        addedNewTile3: 'para comenzar',
        showChart: 'Mostrar gráfico',
        hideChart: 'Ocultar gráfico',
        closeDrawer: 'Cerrar Cajón',
        clearMessages: 'Limpiar mensajes',
        exploreQueries: 'Explorar Consultas',
        notifications: 'Notificaciones',
        dmInputPlaceholder: 'escriba sus consultas aquí',
        voiceRecord: 'Mantenga presionado para convertir voz a texto',
        exploreQueriesInput: 'Buscar consultas relevantes por tema',
        exploreQueriesMessage1: 'Descubra lo que puede preguntar ingresando un tema en la barra de búsqueda de arriba.',
        exploreQueriesMessage2: 'Simplemente haga clic en cualquiera de las opciones devueltas para ejecutar la consulta en Data Messenger.',
        cascaderIntro: 'Algunas cosas que puedes preguntarme:',
        cascaderFooter: 'para explorar más posibilidades.',
        seeMore: 'Ver mas...',
        use: 'Utilice',
        barChart: 'Gráfico de barras',
        columnChart: 'Gráfico de columnas',
        lineChart: 'Gráfico de linea',
        pieChart: 'Gráfica de pastel',
        stackedBar: 'Gráfico de barras apiladas',
        stackedColumn: 'Gráfico de columnas apiladas',
        stackedLine: 'Gráfico de área apilada',
        heatmap: 'Mapa de calor',
        bubbleChart: 'Gráfico de burbujas',
        table: 'Tabla',
        pivotTable: 'Tabla Pivote',
        deleteDataResponse: 'Borrar mensaje',
        moreOptions: 'Mas opciones',
        downloadPNG: 'Descargar como PNG',
        filterTable: 'Filtrar Tabla',
        showHideCols: 'Mostrar/Ocultar Columnas',
        copyTable: 'Copiar tabla al portapapeles',
        downloadCSV: 'Descargar como CSV',
        columnName: 'Nombre de la columna',
        visibility: 'Visibilidad',
        apply: 'Aplicar',
        turnDataAlertOff: 'Desactivar la alerta de datos',
        turnDataAlertOn: 'Activar alerta de datos',
        editDataAlert: 'Editar Alerta de datos',
        dismissAll: 'Descartar todo',
        noneOfThese: 'Ninguna de estas',
        dataAlertsTitleCustom: 'Alertas de datos personalizadas',
        dataAlertsTitle: 'Suscríbase a una alerta de datos',
        dataAlertsMessage1: 'Elija entre una variedad de alertas listas para usar que se han configurado para usted',
        dataAlertsMessage2: 'Ver y administrar sus alertas de datos personalizadas',

    }
});
