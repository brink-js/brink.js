require("./brink/core/Core");

module.exports = {

	//AbstractClass	: require("./brink/core/AbstractClass"),
	Class			: require("./brink/core/Class"),
	Object			: require("./brink/core/Object"),
	Controller		: require("./brink/core/Controller"),
	Mixin			: require("./brink/core/Mixin"),
	Application		: require("./brink/core/Application"),

	Router			: require("./brink/routing/Router"),
	HistoryRouter	: require("./brink/routing/HistoryRouter"),
	HashRouter		: require("./brink/routing/HashRouter"),
	QueryRouter		: require("./brink/routing/QueryRouter"),

	//AbstractView	: require("./brink/views/AbstractView"),
	View			: require("./brink/views/View"),
	ContainerView	: require("./brink/views/ContainerView"),

	DS : {
		Model		: require("./brink/data/Model"),
		Collection	: require("./brink/data/Collection"),
		Adapter		: require("./brink/data/Adapter"),
		Types		: require("./brink/data/Types")
	}
};