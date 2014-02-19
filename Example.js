define(

    [
        "Brink"
    ],

    function (Brink) {

        "use strict";

        var App = Brink.Application.create(function () {

			this.add(Brink.ViewRouter.create(function () {

				this.set("resolver", Brink.AMDResolver);
				//this.set("resolver", Brink.CJSResolver);
				//this.set("resolver", Brink.ES6Resolver);

				this.add('dashboard', 'controllers/Dashboard', {path : '/'});

				this.add('setup', 'controllers/setup/Setup', Brink.ViewRouter.create(function () {

					this.add('1', 'controllers/setup/Step', {template : 'templates/setup/step1'});
					this.add('2', 'controllers/setup/Step', {template : 'templates/setup/step2'});
					this.add('3', 'controllers/setup/Step', {template : 'templates/setup/step3'});
					this.add('4', 'controllers/setup/Step', {template : 'templates/setup/step4'});
					this.add('5', 'controllers/setup/Step', {template : 'templates/setup/step5'});

				}));

				this.add('maps', 'controlles/maps/Maps', Brink.ViewRouter.create(function () {

					this.add(':id', 'controlles/maps/Map', {
						model : SomeModel,
						template : 'maps/map',
						view : 'maps/map'
					});
	
					this.add('add', 'controlles/maps/MapAdd');
					this.add('edit/:id', 'controlles/maps/MapEdit');

				}));

				this.link(Brink.HistoryRouter);

	        }));

        });

        return App;
    }
);