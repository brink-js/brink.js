$b(

    [
        './DOMObject'
    ],

    function (DOMObject) {

        'use strict';

        return DOMObject({

            isText : true,
            isDynamic : true,
            updateProp : 'value'

        });
    }

).attach('$b.dom');
