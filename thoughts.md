Router
	ViewRouter
	HistoryRouter
	HashRouter
	QueryParamRouter

Route
	model
	template

Client and Server-Side

Anything client/server specific is very clearly delineated.

All Client/Server logic should be abstracted as much as possible.

Models should be identical between client/server. Adapters change.

Client : Model.find("1") > Server > Model.find(1)

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
	this.register("main");
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



<nav>

    {{#each link|format}}
        <li class="{{link.className|cssClass}}">
            <a href="{{link.href|href}}">
                {{link.name|capitalize}}
            </a>
        </li>
    {{/each}}

    {{#if 1}}
        <div>So cool!</div>
    {{else}}
        <div>Oooooh la la!</div>
    {{/if}}

</nav>

{{#some-component/}}

{{#/some-component}}

$b.computed({

	watch : ['prop', 'prop2|a,b,c,d,e,f,g']

	get : function () {
		return this._super();
	},

	set : function (val) {

		return this._super(val);
	}
});

$B >
    assert
    alias
    intersect
    merge
    computed
    watch
    unwatch
    parseTemplateString



$B : {
    assert,
}


$b.Controller.extend({

    view        : $b.r('views/PostView'),
    template    : $b.r('templates/post'),
    model       : $b.r('models/Post'),
    config      : $b.r('config'),

    init : function () {

    }

}).define()


$b.define(

    [
        'views/PostView',
        'templates/post',
        'models/Post',
        'config'
    ],

    function (View, template, Model, config) {

        return $b.Controller.extend({

            view : View,
            template : template,
            model : Model,
            config : config,

            init : function () {

            }

        })
    }
);

