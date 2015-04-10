$b(

    [
        './params',
        './Q'
    ],

    function (params, Q) {

        'use strict';

        var XHR,
            DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded';

        XHR = function (url, data, method, options) {
            return XHR.send(XHR.prep(url, data, method, options));
        };

        XHR.send = function (xhr) {

            var deferred = Q.defer();

            xhr.onreadystatechange = function () {

                var response;

                if (xhr.readyState === 4) {

                    if (xhr.mimeType === 'json' && xhr.responseType !== 'json') {
                        response = JSON.parse(xhr.responseText);
                    }

                    else if (
                        xhr.responseType === 'json' ||
                        xhr.responseType === 'blob' ||
                        xhr.responseType === 'document' ||
                        xhr.responseType === 'arraybuffer'
                    ) {
                        response = xhr.response;
                    }

                    else {
                        response = xhr.responseText;
                    }

                    if (xhr.status === 200) {
                        deferred.resolve(response);
                    }

                    else {
                        deferred.reject(xhr);
                    }
                }
            };

            xhr.send();

            return deferred.promise;
        };

        XHR.prep = function (url, data, method, options) {

            var xhr,
                body,
                contentType;

            options = options || {};
            method = (method || 'GET').toUpperCase();

            xhr = new XMLHttpRequest();

            if (options.withCredentials) {
                xhr.withCredentials = true;
            }

            if (options.timeout) {
                xhr.timeout = options.timeout;
            }

            if (options.mimeType) {
                xhr.overrideMimeType(options.mimeType);
                xhr.mimeType = options.mimeType;
            }

            if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
                contentType = options.contentType || DEFAULT_CONTENT_TYPE;
                xhr.open(method, url, true, options.user || '', options.password || '');
                xhr.setRequestHeader('Content-Type', contentType);

                if (contentType === 'application/x-www-form-urlencoded') {
                    body = params(data, true);
                }

                else if (contentType === 'application/json') {
                    body = JSON.stringify(data);
                }

                else {
                    body = data;
                }
            }

            else {

                body = params(data);

                xhr.open(
                    method,
                    url + (body ? '?' + body : ''),
                    true,
                    options.user || '',
                    options.password || ''
                );
            }

            return xhr;
        };

        return XHR;
    }

).attach('$b');