Router
	ViewRouter
	HistoryRouter
	HashRouter
	QueryParamRouter

Route
	model 
	template

{{outlet}}
{{link-to}}
{{partial}}

{{render "template" controller="jijo" model="instance"}}

{{component}}

var viewRouter,
	modalRouter,
	historyRouter,
	queryParamRouter;

historyRouter = Brink.HistoryRouter.create();

viewRouter = Brink.ViewRouter.create(function () {
	this.connectOutlet("main");
	this.link(historyRouter);
	this.add("about", About);
	this.add("contact", {
		controller : null,
		model : null,
		template : null,
		path : null
	});
});

queryParamRouter = Brink.QueryParamRouter.create();
modalRouter = Brink.ViewRouter.create().link(queryParamRouter);

App.addRouters(viewRouter, modalRouter);

App.addComponent("component", "component");
App.inject("controller", "component", component);
App.register("urls", urls);

App.setResolver(Brink.RS.AMDResolver);
App.setResolver(Brink.RS.CJSResolver);

App.initialize();

var controller = Brink.Controller.extend({
	model : null,
	template : null,

	this.$.q();
	this.$.invalidate();
});


Brink.Application
Brink.Object
Brink.Class
Brink.Component

Brink.Router
Brink.Controller
Brink.HistoryRouter
Brink.HashRouter
Brink.QueryParamRouter
Brink.ContainerView
Brink.View

Brink.DS.Model;
Brink.DS.Collection;
Brink.DS.Adapter;
Brink.DS.STRING;
Brink.DS.NUMBER;
Brink.DS.ARRAY;


this.redirect();
this.route();


transitionIn : function () {

}

transitionOut : function () {

}

<a href="{{urls.about}}"></a>

