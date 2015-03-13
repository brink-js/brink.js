$b.define(

    function () {

        'use strict';

        var IS_IE,
            IE_VERSION,
            DIRTY_CHECK;

        IE_VERSION = (function (rv, ua, re) {

            if (typeof navigator !== 'undefined' && navigator && navigator.appName === 'Microsoft Internet Explorer') {

                ua = navigator.userAgent;
                re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');

                if (re.exec(ua) != null) {
                    rv = parseFloat(RegExp.$1);
                }
            }

            return rv || -1;
        })();

        IS_IE = IE_VERSION > -1;

        DIRTY_CHECK = (IS_IE && IE_VERSION < 9) || (!Object.defineProperty && !Object.__defineGetter__);

        return ({
            DIRTY_CHECK : DIRTY_CHECK,
            IS_IE : IS_IE,
            IE_VERSION : IE_VERSION
        });
    }

).attach('$b');