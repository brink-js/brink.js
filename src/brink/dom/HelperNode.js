$B.DOM.HelperNode = $B.DOM.Node.extend({

    props : {
        domNodes : null
    },

    isHelperNode : $B.C(true),

    helper : function (val) {

        if (typeof val !== undefined) {
            this._helper = $B.getTemplateHelper(val);
            $B.assert(this._helper, 'Invalid template helper "' + val + '"');
        }

        return this._helper;
    },

    helperOptions : function (val) {

        if (typeof val !== undefined) {
            this._helperOptions = val;
            this.watchedProperties(this._helper.properties(val));
        }

        return this._helperOptions;
    },

    update : function (context, properties) {

        var domNodes,
            origDomNodes;

        if ($B.intersect(this.watchedProperties(), properties).length) {
            this.domNodes(this._helper(context, this.helperOptions(), this.childNodes()));
        }

    }


});