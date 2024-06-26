import { MAX_DATA_PAGE_SIZE } from 'autoql-fe-utils';
import LocalizedStrings from 'localized-strings';

String.prototype.chataFormat = function () {
    var a = this;
    for (var k in arguments) {
        a = a.replace(new RegExp('\\{' + k + '\\}', 'g'), arguments[k]);
    }
    return a;
};

export const strings = new LocalizedStrings({
    en: {
        report: 'report',
        introMessage: 'Hi {0} Let’s dive into your data. \r\n \r\n',
        dataExplorerIntroMessageOne: 'Get started by asking a query below, or use ',
        dataExplorerIntroMessageTwo: ' to discover what data is available to you!',
        there: 'there!',
        dataIncorrect: 'The data is incorrect',
        dataIncomplete: 'The data is incomplete',
        other: 'Other...',
        reportProblemTitle: 'Report a Problem',
        reportProblemQuestion: "What's happening?",
        reportProblemMessage: 'Please tell us more about the problem you are experiencing:',
        reportProblem: 'Report',
        feedback: 'Thank you for your feedback',
        cancel: 'Cancel',
        viewSQL: 'View generated SQL',
        createAlert: 'Create a Data Alert...',
        dataRowLimit:
            'The display limit of {0} rows has been reached. Try querying a smaller time-frame to ensure all your data is displayed.',
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
        allColsHidden:
            'All columns in this table are currently hidden. You can adjust your column visibility preferences using the Column Visibility Manager in the Options Toolbar.',
        safetynet:
            'I need your help matching a term you used to the exact corresponding term in your database. Verify by selecting the correct term from the menu below:',
        addedNewTile1: 'Add a  ',
        addedNewTile2: '<span class="empty-dashboard-new-tile-btn">New Tile </span>',
        addedNewTile3: 'to get started',
        showChart: 'Show Chart',
        hideChart: 'Hide Chart',
        closeDrawer: 'Close Drawer',
        clearMessages: 'Clear Messages',
        clearFilter: 'Clear Filter',
        dataExplorer: 'Data Explorer',
        clearSearch: 'Clear Search',
        notifications: 'Notifications',
        dmInputPlaceholder: 'Type your queries here',
        voiceRecord: 'Click for voice-to-text',
        voiceRecordError:
            "You have denied permission for the use of your microphone. Please update the microphone permissions in your browser's settings.",
        dataExplorerInput: 'Search terms or topics',
        dataExplorer: 'Data Explorer',
        relatedTo: 'Related to',
        topics: 'Topics',
        recent: 'Recent',
        clearHistory: 'Clear history',
        loadingTopics: 'Loading Topics',
        noResults: 'No results',
        topicSelectionLabel: 'Select a Topic related to',
        fieldSelectionLabel: 'Select all fields of interest from',
        fieldsOfInterest: 'fields of interest',
        welcomeTo: 'Welcome to ',
        dataExplorerIntro:
            'Explore your data and discover what you can ask AutoQL. Simply enter a term or topic above and',
        dataExplorerMessage1: 'Preview available data in a snapshot',
        dataExplorerMessage2: 'Explore data structure and column types',
        dataExplorerMessage3: 'View a variety of query suggestions',
        cascaderIntro: 'Some things you can ask me:',
        cascaderFooter: 'to further explore the possibilities.',
        seeMore: 'See more...',
        use: 'Use',
        displayTypes: {
            table: 'Table',
            pivot_table: 'Pivot View',
            bar: 'Bar Chart',
            column: 'Column Chart',
            line: 'Line Chart',
            pie: 'Pie Chart',
            stacked_bar: 'Stacked Bar Chart',
            stacked_column: 'Stacked Column Chart',
            stacked_line: 'Stacked Area Chart',
            histogram: 'Histogram',
            column_line: 'Column Line Combo',
            scatterplot: 'Scatterplot',
            heatmap: 'Heatmap',
            bubble: 'Bubble Chart',
        },
        deleteDataResponse: 'Delete data response',
        moreOptions: 'More options',
        downloadPNG: 'Download as PNG',
        filterTable: 'Filter Table',
        showHideCols: 'Show/Hide Columns',
        copyTable: 'Copy table to clipboard',
        downloadCSV: 'Download as CSV',
        downloadingCSV: 'Downloading your file',
        downloadedCSVSuccessully: 'Your file has successfully been downloaded with the query',
        downloadedCSVWarning: "WARNING: The file you've requested is larger than",
        partialCSVDataWarning: 'This exceeds the maximum download size and you will only receive partial data.',
        fetchingCSV: 'Fetching your file',
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
        notificationPreferencesMessage:
            'When the conditions of this Data Alert are met, how often do you want to be notified?',
        frequencyEvery: 'Every time this happens',
        frequencyDaily: 'Only once per day',
        frequencyWeek: 'Only once per week',
        frequencyMonth: 'Only once per month',
        timezone: 'Time zone: ',
        accessDenied:
            "Uh oh.. It looks like you don't have access to this resource. Please double check that all required authentication fields are correct.",
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
        sampleQueries: 'Sample Queries',
        sampleQueriesNotFound:
            'Sorry, I couldn’t find any sample queries matching your input. Try entering a different topic or keyword instead.',
        sampleQueriesGeneralError:
            'Uh oh.. an error occured while trying to retrieve your sample queries. Please try again.',
        topicsGeneralError:
            'Uh oh.. an error occured while trying to retrieve the topics for this value. Please try again.',
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
        lockedValueLabel: 'This filter is currently locked. Click to view it in the Filter Locking menu.',
        reverseTranslationLabel: 'Interpreted as: ',
        reverseTranslationTooltip:
            'This statement reflects how your query was interpreted in order to return this data response.',
        filterLocking: 'Filter Locking',
        filterLockingSaving: ' Saving...',
        continue: 'Continue',
        filterLockingTooltip:
            'Filters can be applied to narrow down<br /> your query results. Locking a filter<br /> ensures that only the specific data<br /> you wish to see is returned.',
        filterLockingInputPlaceholder: 'Search & select a filter',
        filterLockingAddFilterWarning: 'This filter has already been applied.',
        filterLockingRemove: 'Remove Filter',
        emptyFilterConditionList: 'No Filters are locked yet',
        include: 'INCLUDE',
        exclude: 'EXCLUDE',
        filterLockingListTooltip:
            'Persistent filters remain locked at all<br /> times, unless the filter is removed. If<br /> unchecked, the filter will be locked<br /> until you end your browser session.',
        persist: 'Persist',
        maximizeButton: 'Full Screen',
        maximizeButtonExit: 'Exit Full Screen',
        maxDataWarningTooltip: `Row limit (${MAX_DATA_PAGE_SIZE}) reached. Try applying a filter or narrowing your search to return full results.`,
        dataSubsetWarningTooltip:
            'This visualization is showing a subset of the data. <em>Drilldowns</em> will be executed on the <strong>full</strong> dataset.',
        visualizingText: 'Visualizing',
        scrolledText: 'Scrolled',
        rowsText: 'rows',
        suggestionResponse: 'I want to make sure I understood your query. Did you mean:',
    },
    es: {
        report: 'repórtalo',
        introMessage: 'Hola {0} Analicemos sus datos. \r\n \r\n',
        dataExplorerIntroMessageOne: 'Comience haciendo una consulta a continuación o use ',
        dataExplorerIntroMessageTwo: ' para descubrir qué datos están disponibles para usted!',
        there: '',
        dataIncorrect: 'Los datos son incorrectos',
        dataIncomplete: 'Los datos están incompletos',
        other: 'Otro...',
        reportProblemTitle: 'Reportar un problema',
        reportProblemQuestion: '¿Que está sucediendo?',
        reportProblemMessage: 'Cuéntenos más sobre el problema que estás presentando:',
        reportProblem: 'Reportar',
        feedback: 'Gracias por tu retroalimentación',
        cancel: 'Cancelar',
        viewSQL: 'Ver SQL generado',
        createAlert: 'Crear una alerta de datos...',
        dataRowLimit:
            'Se alcanzó el límite de visualización de {0} filas. Intente consultar un rango de tiempo más pequeño para asegurarse de que se muestren todos sus datos.',
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
        allColsHidden:
            'Actualmente, todas las columnas de esta tabla están ocultas. Puede ajustar sus preferencias de visibilidad de columna usando el Administrador de visibilidad de columna (<span class="chata-icon eye-icon">{0}</span>) en la barra de herramientas de opciones.',
        safetynet:
            'Necesito tu ayuda para hacer coincidir un término que utilizó con el término correspondiente exacto en su base de datos. Verifique seleccionando el término correcto en el menú a continuación:',
        addedNewTile1: 'Agregue un  ',
        addedNewTile2: '<span class="empty-dashboard-new-tile-btn">nuevo título </span>',
        addedNewTile3: 'para comenzar',
        showChart: 'Mostrar gráfico',
        hideChart: 'Ocultar gráfico',
        closeDrawer: 'Cerrar Data mesenger',
        clearMessages: 'Limpiar respuestas',
        clearFilter: 'Limpiar filtro',
        dataExplorer: 'Explorar Consultas',
        dataExplorer: 'Explorador de datos',
        clearSearch: 'Borrar búsqueda',
        notifications: 'Notificaciones',
        dmInputPlaceholder: 'escriba sus consultas aquí',
        voiceRecord: 'Mantenga presionado para convertir voz a texto',
        voiceRecordError: 'La grabación de voz no está disponible porque has negado el permiso para usar tu micrófono',
        dataExplorerInput: 'Buscar términos o temas',
        dataExplorer: 'Exploradora de datos',
        relatedTo: 'Relacionado con',
        topics: 'Temas',
        recent: 'Búsquedas recientes',
        clearHistory: 'Limpiar historial',
        loadingTopics: 'Cargando temas',
        noResults: 'No hay resultados',
        topicSelectionLabel: 'Seleccione un tema relacionado con',
        fieldSelectionLabel: 'Seleccione todos los campos de interés de',
        fieldsOfInterest: 'campos de interés',
        welcomeTo: 'Bienvenido a ',
        dataExplorerIntro:
            'Explora tus datos y descubre qué puedes preguntarle a AutoQL. Simplemente ingrese un término o tema arriba y',
        dataExplorerMessage1: 'Vista previa de los datos disponibles en una instantánea',
        dataExplorerMessage2: 'Explorar la estructura de datos y los tipos de columnas',
        dataExplorerMessage3: 'Ver una variedad de sugerencias de consultas',
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
        pivotTable: 'Vista dinámica',
        deleteDataResponse: 'Eliminar respuesta de datos',
        moreOptions: 'Mas opciones',
        downloadPNG: 'Descargar como PNG',
        filterTable: 'Filtrar Tabla',
        showHideCols: 'Mostrar/Ocultar Columnas',
        copyTable: 'Copiar tabla al portapapeles',
        downloadCSV: 'Descargar como CSV',
        downloadingCSV: 'Descargando tu archivo',
        downloadedCSVSuccessully: 'Su archivo se ha descargado exitosamente con la consulta',
        downloadedCSVWarning: 'ADVERTENCIA: El archivo que ha solicitado es más grande que el limite permitido',
        partialCSVDataWarning: 'Este archivo excede el tamaño máximo de descarga y solo recibirá datos parciales.',
        fetchingCSV: 'Obteniendo su archivo',
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
        notificationPreferencesMessage:
            'Cuando se cumplan las condiciones de esta Alerta de datos, ¿con qué frecuencia desea que se le notifique?',
        frequencyEvery: 'Cada vez que esto pase',
        frequencyDaily: 'Solo una vez al dia',
        frequencyWeek: 'Solo una vez por semana',
        frequencyMonth: 'Solo una vez al mes',
        timezone: 'Zona horaria: ',
        accessDenied:
            'Uh oh... Parece que no tienes acceso a este recurso. Verifique que todos los campos de autenticación requeridos sean correctos.',
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
        sampleQueries: 'Consultas de muestra',
        sampleQueriesNotFound:
            'Lo siento, no pude encontrar ninguna consulta de muestra que coincida con su entrada. Intente ingresar un tema o palabra clave diferente en su lugar.',
        sampleQueriesGeneralError:
            'Lo siento, se produjo un error al intentar recuperar sus consultas de muestra. Inténtalo de nuevo.',
        topicsGeneralError:
            'Lo siento, se produjo un error al intentar recuperar los temas para este valor. Inténtalo de nuevo.',
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
        infoIconDataAlertName:
            'Esto será visible para cualquier persona que reciba una notificación cuando se active esta alerta.',
        infoIconRuleContainer: 'Su consulta debe describir el resultado sobre el que desea recibir una alerta.',
        filterButton: 'Abrir menú de bloqueo de filtro',
        lockedValueLabel: 'Este filtro está bloqueado. Haga clic para verlo en el menú de bloqueo de filtro.',
        reverseTranslationLabel: 'Interpretado como: ',
        reverseTranslationTooltip:
            'Esta declaración refleja cómo se interpretó su consulta para devolver esta respuesta de datos.',
        filterLocking: 'Bloqueo de filtros',
        filterLockingSaving: 'Cargando...',
        continue: 'Continuar',
        filterLockingTooltip:
            'Se pueden aplicar filtros para restringir<br /> los resultados de su consulta. Bloquear un filtro<br /> garantiza que solo se devuelvan los datos específicos<br /> que desea ver.',
        filterLockingInputPlaceholder: 'Buscar y seleccionar un filtro',
        filterLockingAddFilterWarning: 'Este filtro ya se ha aplicado.',
        filterLockingRemove: 'Remover Filtro',
        emptyFilterConditionList: 'Ningún filtro está bloqueado todavía',
        include: 'INCLUIR',
        exclude: 'EXCLUIR',
        filterLockingListTooltip:
            'Los filtros persistentes permanecen bloqueados en todo <br /> momento, a menos que se elimine el filtro. Si<br /> no está marcado, el filtro se bloqueará<br /> hasta que finalice la sesión del navegador.',
        persist: 'Persistir',
        maximizeButton: 'Pantalla completa',
        maximizeButtonExit: 'Salir pantalla completa',
        maxDataWarningTooltip: `Límite de filas (${MAX_DATA_PAGE_SIZE}) alcanzado. Intenta aplicar un filtro o reducir tu búsqueda para obtener resultados completos.`,
        dataSubsetWarningTooltip:
            'Esta visualización muestra un subconjunto de los datos. Las <em>Desgloses</em> se ejecutarán en el conjunto de datos <strong>completo</strong>.',
        visualizingText: 'Visualizando',
        scrolledText: 'Desplazado',
        rowsText: 'filas',
        suggestionResponse: 'Quiero asegurarme de que entendí tu consulta. Querías decir:',
        displayTypes: {
            table: 'Tabla',
            pivot_table: 'Tabla dinámica',
            bar: 'Gráfico de barras',
            column: 'Gráfico de columnas',
            line: 'Gráfico de linea',
            pie: 'Gráfico circular',
            stacked_bar: 'Gráfico de barras apiladas',
            stacked_column: 'Gráfico de columnas apiladas',
            stacked_line: 'Gráfico de áreas apiladas',
            histogram: 'Histograma',
            column_line: 'Gráfico combinación columna-línea',
            scatterplot: 'Gráfico de dispersión',
            heatmap: 'Mapa de calor',
            bubble: 'Gráfico de burbujas',
        },
    },
});
