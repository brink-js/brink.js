$b(

    [
        './DOMObject'
    ],

    function (DOMObject) {

        'use strict';

        return DOMObject({

            isText : true,
            updateProp : 'nodeValue'

        });
    }

).attach('$b.dom');
