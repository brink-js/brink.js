$b(

    [
    	'./Object',
        './Dictionary'
    ],

    function (Obj, Dictionary) {

        var InstanceManager,
            IID = 1;

		InstanceManager = Obj.extend({

            instances : null,

            init : function () {
                this.instances = Dictionary.create();
            },

            add : function (instance, meta) {

                meta = meta || {};
                meta.iid = IID ++;

                this.instances.add([instance, meta]);

                return meta;
            },

            remove : function (instance) {
                this.instances.remove.apply(this.instances, arguments);
            },

            forEach : function (fn) {
                return this.instances.forEach(fn);
            }

		}).create();

        $b.define('instanceManager', InstanceManager).attach('$b');
	}

).attach('$b');