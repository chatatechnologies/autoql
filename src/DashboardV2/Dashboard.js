import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.css';

export function Dashboard(){
    var grid = GridStack.init();

    for (var i = 0; i < 12; i++) {
        var e = document.createElement('h3');
        e.innerHTML = 'FOOO'
        grid.addWidget(e, {width: 4});
    }
}
