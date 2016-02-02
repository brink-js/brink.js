describe('belongsTo', function () {

    var store;

    beforeEach(function () {
        store = $b.Store.create();
    });

    afterEach(function () {
        store.destroy(true);
    });

    it('should properly deserialize belongsTos.', function () {

        var Light,
            LightSwitch,
            lightInstance,
            switchInstance;

        Light = $b.Model({
            modelKey : 'light',

            schema : $b.Schema.create({
                isOn : $b.attr({defaultValue : false})
            })
        });

        LightSwitch = $b.Model({

            modelKey : 'lightSwitch',
            collectionKey : 'lightSwitches',

            schema : $b.Schema.create({
                light : $b.belongsTo('light')
            }),

            flip : function () {
                this.light.isOn = !this.light.isOn;
            }
        });

        lightInstance = Light.create({id : 1});
        store.add('light', lightInstance);

        switchInstance = LightSwitch.create();
        store.add('lightSwitch', switchInstance);

        switchInstance.deserialize({
            light : 1
        });

        expect(switchInstance.light).to.equal(lightInstance);
        expect(switchInstance.light.isOn).to.equal(false);
        switchInstance.flip();
        expect(switchInstance.light.isOn).to.equal(true);
    });

    it('should properly serialize belongsTos.', function () {

        var json,
            Light,
            LightSwitch,
            lightInstance,
            switchInstance;

        Light = $b.Model({
            modelKey : 'light',

            schema : $b.Schema.create({
                isOn : $b.attr({defaultValue : false})
            })
        });

        LightSwitch = $b.Model({

            modelKey : 'lightSwitch',
            collectionKey : 'lightSwitches',

            schema : $b.Schema.create({
                light : $b.belongsTo('light')
            }),

            flip : function () {
                this.light.isOn = !this.light.isOn;
            }
        });

        lightInstance = Light.create({id : 1});
        store.add('light', lightInstance);

        switchInstance = LightSwitch.create();
        store.add('lightSwitch', switchInstance);

        switchInstance.deserialize({
            light : 1
        });

        json = switchInstance.serialize();

        expect(json).to.deep.equal({light : 1});
    });

    it('should properly deserialize embedded belongsTos.', function () {

        var Light,
            LightSwitch,
            switchInstance;

        Light = $b.Model({
            modelKey : 'light',

            schema : $b.Schema.create({
                isOn : $b.attr({defaultValue : false})
            })
        });

        LightSwitch = $b.Model({

            modelKey : 'lightSwitch',
            collectionKey : 'lightSwitches',

            schema : $b.Schema.create({
                light : $b.belongsTo('light', {embedded : true})
            }),

            flip : function () {
                this.light.isOn = !this.light.isOn;
            }
        });

        store.addModels(Light, LightSwitch);

        switchInstance = LightSwitch.create();
        store.add('lightSwitch', switchInstance);

        switchInstance.deserialize({
            light : {
                isOn : true
            }
        });

        expect(switchInstance.light).to.be.an.instanceof(Light);
        expect(switchInstance.light.isOn).to.equal(true);
        switchInstance.flip();
        expect(switchInstance.light.isOn).to.equal(false);
    });

    it('should properly serialize embedded belongsTos.', function () {

        var json,
            Light,
            LightSwitch,
            switchInstance;

        Light = $b.Model({
            modelKey : 'light',

            schema : $b.Schema.create({
                isOn : $b.attr({defaultValue : false})
            })

        });

        LightSwitch = $b.Model({

            modelKey : 'lightSwitch',
            collectionKey : 'lightSwitches',

            schema : $b.Schema.create({
                light : $b.belongsTo('light', {embedded : true})
            }),

            flip : function () {
                this.light.isOn = !this.light.isOn;
            }
        });

        store.addModels(Light, LightSwitch);

        switchInstance = LightSwitch.create();
        store.add('lightSwitch', switchInstance);

        switchInstance.deserialize({
            light : {
                isOn : true
            }
        });

        switchInstance.flip();

        json = switchInstance.serialize();

        expect(json).to.deep.equal({
            light : {
                isOn : false
            }
        });
    });

    it('should allow filtering.', function () {

        var json,
            Light,
            LightSwitch,
            switchInstance;

        Light = $b.Model({
            modelKey : 'light',

            schema : $b.Schema.create({
                isOn : $b.attr({defaultValue : false}),
                isDimmable : $b.attr({defaultValue : false, internal : true}),
                voltage : $b.attr({readOnly: true})
            })
        });

        LightSwitch = $b.Model({

            modelKey : 'lightSwitch',
            collectionKey : 'lightSwitches',

            schema : $b.Schema.create({
                light : $b.belongsTo('light', {embedded : true}),
                linkedTo : $b.belongsTo('light', {embedded: true, readOnly : true}),
                linkedToNull : $b.belongsTo('light', {embedded: true, defaultValue : null})
            }),

            flip : function () {
                this.light.isOn = !this.light.isOn;
            }
        });

        store.addModels(Light, LightSwitch);

        switchInstance = LightSwitch.create();
        store.add('lightSwitch', switchInstance);

        switchInstance.deserialize({
            light : {
                isOn : true,
                voltage: 1.2
            },
            linkedTo: {isOn: true, voltage: 123}
        }, false, function (meta) {
            return !meta.options.readOnly;
        });

        switchInstance.flip();
        expect(switchInstance.linkedTo).to.be.an.instanceOf(Light);
        expect(switchInstance.linkedToNull).to.equal(null);
        switchInstance.linkedTo = Light.create({voltage: 345});

        json = switchInstance.serialize(function (meta) {
            return !meta.options.internal;
        });

        expect(json).to.deep.equal({
            light : {
                isOn : false
            },
            linkedTo: {
                isOn: false,
                voltage: 345
            },
            linkedToNull : null
        });
    });
});
