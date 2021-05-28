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
        createAlert: 'Create a Data Alert...'
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
        createAlert: 'Crear una alerta de datos...'

    }
});
