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
        queryText: 'Query',
        titleText: 'Title',
        allColsHidden: 'All columns in this table are currently hidden. You can adjust your column visibility preferences using the Column Visibility Manager (<span class="chata-icon eye-icon">{0}</span>) in the Options Toolbar.'
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
        queryText: 'Consulta',
        titleText: 'Título',
        allColsHidden: 'Actualmente, todas las columnas de esta tabla están ocultas. Puede ajustar sus preferencias de visibilidad de columna usando el Administrador de visibilidad de columna (<span class="chata-icon eye-icon">{0}</span>) en la barra de herramientas de opciones.'
    }
});
