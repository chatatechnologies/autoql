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
        dataAlertTooltip: 'This Alert has been triggered. Scanning will resume on',
        dataAlertFormatDate: 'MMMM DD, YYYY [at] hh:mmA',
        setupDataAlert: 'Set up your Alert',
        notificationPreferences: 'Set Notification Preferences',
        composeAlertMessage: 'Compose Notification Message',
        dataAlertName: 'Name your Data Alert',
        dataAlertNamePlaceholder: 'Add an Alert Name',
        notifyWhen: 'Notify me when:',
        typeQueryPlaceholder: 'Type a query',
        typeQueryNumberPlaceholder: 'Type a query or number',
        compareResult: 'Compare',
        save: 'Save',
        deleteDataAlert: 'Delete Data Alert',
        back: 'Back',
        next: 'Next',
        confirmDialogTitle: 'Are you sure you want to leave this page?',
        confirmDialogDescription: 'All unsaved changes will be lost.',
        discardChanges: 'Discard Changes',
        createDataAlert: 'Create New Data Alert',
        notificationPreferencesMessage: 'When the conditions of this Data Alert are met, how often do you want to be notified?',
        frequencyEvery: 'Every time this happens',
        frequencyDaily: 'Only once per day',
        frequencyWeek: 'Only once per week',
        frequencyMonth: 'Only once per month',
        timezone: 'Time zone: ',
        accessDenied: "Uh oh.. It looks like you don't have access to this resource. Please double check that all required authentication fields are correct.",
        errorMessage: `Oops! It looks like our system is experiencing an issue.
        Try querying again. If the problem persists,
        please send an email to our team at support@chata.ai.
        We'll look into this issue right away and be in touch with you shortly.`,
        clearMessagesTitle: 'Clear all queries & responses?',
        clear: 'Clear',
        watermark: 'We run on AutoQL by Chata',
        errorID: 'Error ID',
        headerFilterPlaceholder: 'filter column...',
        category: 'Category',
        noDataFound: 'No data found.',
        relatedQueriesNotFound: 'Sorry, I couldn’t find any queries matching your input. Try entering a different topic or keyword instead.',
        generatedSql: 'Generated SQL',
        copySqlMessage: 'Successfully copied generated query to clipboard!',
        copySqlToClipboard: 'Copy to Clipboard',
        runQuery: 'Run Query',
        removeTerm: 'Remove term',
        originalTerm: 'Original term',
        optional: 'Optional:',
        notificationMessagePlaceholder: 'This message will be visible when a notification is sent.',
        validateAlert: 'Check Alert & continue',
        loading: 'Loading...',
        infoIconDataAlertName: 'This will be visible to anyone who gets notified when this Alert is triggered',
        infoIconRuleContainer: 'Your query should describe the result you wish to be alerted about.',
        filterButton: 'Open filter locking menu',
        reverseTranslationLabel: 'Interpreted as: ',

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
        singleView: 'Vista única',
        splitView: 'Vista dividida',
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
        closeDrawer: 'Cerrar Data mesenger',
        clearMessages: 'Limpiar respuestas',
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
        deleteDataResponse: 'Eliminar respuesta de datos',
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
        dataAlertTooltip: 'Esta alerta se ha activado. El escaneo se reanudará el',
        dataAlertFormatDate: 'DD [de] MMMM [del] YYYY [a las] hh:mmA',
        setupDataAlert: 'Configura tu alerta',
        notificationPreferences: 'Establecer preferencias de notificación',
        composeAlertMessage: 'Redactar mensaje de notificación',
        dataAlertName: 'Ponle un nombre a tu alerta de datos',
        dataAlertNamePlaceholder: 'Agregar un nombre de alerta',
        notifyWhen: 'Notifícame cuando:',
        typeQueryPlaceholder: 'Escribe una consulta',
        typeQueryNumberPlaceholder: 'Escriba una consulta o un número',
        compareResult: 'Comparar',
        save: 'Guardar',
        deleteDataAlert: 'Eliminar alerta de datos',
        back: 'Regresar',
        next: 'Siguiente',
        confirmDialogTitle: '¿Estás seguro de que quieres salir de esta página?',
        confirmDialogDescription: 'Se perderán todos los cambios no guardados.',
        discardChanges: 'Descartar cambios',
        createDataAlert: 'Crear nueva alerta de datos',
        notificationPreferencesMessage: 'Cuando se cumplan las condiciones de esta Alerta de datos, ¿con qué frecuencia desea que se le notifique?',
        frequencyEvery: 'Cada vez que esto pase',
        frequencyDaily: 'Solo una vez al dia',
        frequencyWeek: 'Solo una vez por semana',
        frequencyMonth: 'Solo una vez al mes',
        timezone: 'Zona horaria: ',
        accessDenied: 'Uh oh... Parece que no tienes acceso a este recurso. Verifique que todos los campos de autenticación requeridos sean correctos.',
        errorMessage: `¡UPS! Parece que nuestro sistema está experimentando un problema.
        Intente consultar de nuevo. Si el problema persiste,
        envíe un correo electrónico a nuestro equipo a support@chata.ai.
        Analizaremos este problema de inmediato y nos comunicaremos con usted en breve.`,
        clearMessagesTitle: '¿Borrar todas las consultas y respuestas?',
        clear: 'Limpiar',
        watermark: 'Corremos en AutoQL de Chata',
        errorID: 'ID del error',
        headerFilterPlaceholder: 'filtrar columna',
        category: 'Categoría',
        noDataFound: 'No encontraron datos.',
        relatedQueriesNotFound: 'Lo siento, no pude encontrar ninguna consulta que coincida con su entrada. Intente ingresar un tema o palabra clave diferente en su lugar.',
        generatedSql: 'SQL Generado',
        copySqlMessage: 'La consulta generada se copió correctamente al portapapeles!',
        copySqlToClipboard: 'Copiar al portapapeles',
        runQuery: 'Ejecutar consulta',
        removeTerm: 'Remover termino',
        originalTerm: 'Término original',
        optional: 'Opcional:',
        notificationMessagePlaceholder: 'Este mensaje será visible cuando se envíe una notificación.',
        validateAlert: 'Checar Alerta y continuar',
        loading: 'Cargando...',
        infoIconDataAlertName: 'Esto será visible para cualquier persona que reciba una notificación cuando se active esta alerta.',
        infoIconRuleContainer: 'Su consulta debe describir el resultado sobre el que desea recibir una alerta.',
        filterButton: 'Abrir menú de bloqueo de filtro',
        reverseTranslationLabel: 'Interpretado como: ',
    }
});
