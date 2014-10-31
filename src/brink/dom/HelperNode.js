$b(
    [
        './Node',
        '../utils/intersect'
    ],

    function (Node, intersect) {

        var HelperNode = Node({

            isHelperNode : true,

            update : function (context, properties) {

                var domNodes,
                    origDomNodes;

                if (intersect(this.watchedProperties(), properties).length) {
                    //this.nodes(this._helper(context, this.helperOptions(), this.childNodes));
                }

            }

        });

        return HelperNode;
    }

).attach('$b.dom');