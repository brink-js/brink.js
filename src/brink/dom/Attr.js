$b(

    [
        './DOMObject'
    ],

    function (DOMObject) {

        'use strict';

        return DOMObject({

            isAttr : true,
            isDynamic : true,
            updateProp : 'value'

        });
    }

).attach('$b.dom');
