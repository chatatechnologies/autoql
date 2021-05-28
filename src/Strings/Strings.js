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
        there: 'there!'
    },
    es: {
        report: 'repórtalo',
        introMessage: 'Hola {0} Analicemos sus datos. ¿Qué puedo ayudarte a descubrir hoy?',
        there: ''
    }
});
