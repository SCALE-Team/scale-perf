var ScalePerformanceBarClass = function() {
	// Set the main class reference for sub-namespaces
	this.menu.superClass = this;
	this.tools.superClass = this;
	this.helpers.superClass = this;
	
	// add all CSS styles
	this.addStyles();
	
	this.putPageContentsToDiv();
	
	// Add the menu
	this.menu.addBar();
	
	// Add the tool-active bar
	this.tools.addBar();
	
	// show the menu
	var superClass = this;
	window.setTimeout(function(){
		superClass.menu.show();
	}, 0);
};

ScalePerformanceBarClass.prototype = {
	styleElem: null,
	
	// All tool scripts to be included
	scripts: [
		{
			name:					"Performance Bookmarklet",
			href:					"https://scale-team.github.io/scale-perf/tools/performanceBookmarklet.js",
			requiresPerformanceApi:	true,
			localHref:				"/tools/performanceBookmarklet.js",
			onclick: function(superClass) {
				superClass.tools.onCloseTool(function() {
					var waterfall = document.getElementById("perfbook-iframe");
					waterfall.parentNode.removeChild(waterfall);
				});
				
				superClass.helpers.waitForExist("perfbook-iframe", function(elem) {
					superClass.helpers.animate(elem, 1000, 30);
				});
			}
		},
		{
			name:					"Page load waterfall",
			href:					"https://scale-team.github.io/scale-perf/tools/waterfall.js",
			requiresPerformanceApi:	true,
			localHref:				"/tools/waterfall.js",
			onclick: function(superClass) {
				superClass.tools.onCloseTool(function() {
					var waterfall = document.getElementById("PerfWaterfallDiv");
					waterfall.parentNode.removeChild(waterfall);
				});
				
				superClass.helpers.waitForExist("PerfWaterfallDiv", function(elem) {
					superClass.helpers.animate(elem, 450, 30);
				});
			}
		},
		{
			name:					"Picture load times",
			href:					"https://scale-team.github.io/scale-perf/tools/perfmap.js",
			requiresPerformanceApi:	true,
			localHref:				"/tools/perfmap.js",
			onclick: function(superClass) {
				superClass.tools.onCloseTool(function() {
					var elems = document.getElementsByClassName("perfmap");
					while(elems.length > 0)
					{
						elems[0].parentNode.removeChild(elems[0]);
					}
					
					var perfmap = document.getElementById("perfmap");
					perfmap.parentNode.removeChild(perfmap);
				});
			}
		},
		{
			name:	"Analyze DOM tree",
			href:	"https://scale-team.github.io/scale-perf/tools/dommonster.js",
			localHref:	"/tools/dommonster.js",
			onclick:	function(superClass) {
				superClass.tools.onCloseTool(function() {
					var r = document.getElementById("jr_results");
					r.parentNode.removeChild(r);
					
					var iframe = document.getElementsByClassName("dommonster_iframe")[0];
					iframe.parentNode.removeChild(iframe);
				});
				
				// Add some styles
				superClass.styleElem.innerHTML += "#jr_stats { float: none !important; width: 100% !important; top:	-450px; }";
				superClass.styleElem.innerHTML += "#jr_stats > div { display: inline-block !important; width: 210px !important; }";
				superClass.styleElem.innerHTML += "#jr_stats > div > div:first-child { width: 20px !important; height: 20px !important; margin-right: 5px !important; }";
				
				superClass.helpers.waitForExist("jr_results", function(elem) {
					superClass.helpers.animate(elem, 450, 30);
				});
			}
		},
		{
			name:		"FPS display",
			href:		"https://scale-team.github.io/scale-perf/tools/stats.js",
			localHref:	"/tools/stats.js",
			onclick:	function(superClass) {
				var body = document.getElementsByTagName("body")[0];
				
				var displayStatsInterval = window.setInterval(function() {
					if(typeof Stats == "function")
					{
						window.clearInterval(displayStatsInterval);
						
						var stats = new Stats();
						stats.domElement.style.position = "fixed";
						stats.domElement.style.left = "0px";
						stats.domElement.style.top = "0px";
						stats.domElement.style.zIndex = "10000";
						body.appendChild(stats.domElement);
						
						// for the transition animation
						superClass.helpers.animate(stats.domElement, 100, 30);
						
						var interval = window.setInterval(function(){ stats.update(); }, 1000/60);
						
						superClass.tools.onCloseTool(function()
						{
							body.removeChild(stats.domElement);
							window.clearInterval(interval);
						});
					}
				}, 100);
			}
		},
		{
			name:			"Help",
			symbol:			"?",
			pullToSymbols:	true,
			url:			"https://github.com/SCALE-Team/scale-perf/blob/master/README.md#readme"
		},
		{
			name:			"Close",
			symbol:			"X",
			pullToSymbols:	true,
			onclick: function(superClass) {
				superClass.menu.hide();
				//superClass.helpers.avoidPageOverlapWithBar();
			}
		}
	],
	
	addStyles: function() {
		var head = document.head || document.getElementsByTagName('head')[0];
		
		this.styleElem = document.createElement("style");
		this.styleElem.id = "PerfBookmarkletStyle";
		
		var style = "#PerfBar, #ToolsActiveBar { font-family: Arial !important; font-size: 14px !important; z-index: 1000000; color: #fff; position: fixed; top: -40px; left: 0px; width: 100%; background-color: #000; box-shadow: 0px 0px 5px #000; }";
		style += "#PerfBar #Perf-logo { height: 20px; }";
		style += "#PerfBar a, #ToolsActiveBar a { display: inline-block; cursor: pointer; text-decoration: none !important; color: #fff !important; display: inline-block; padding: 5px; }";
		style += "#PerfBar a:hover, #ToolsActiveBar a:hover { background-color: red !important; }";
		style += "#PerfBar a.disabled { color: #555 !important; cursor: default; }";
		style += "#PerfBar a.disabled:hover { background-color: transparent !important; }";
		
		style += "#PerfBar .perf-symbols, #ToolsActiveBar .perf-symbols { position: absolute; top: 0px; right: 0px; }";
		style += "#PerfBar .perf-symbols > *, #ToolsActiveBar .perf-symbols > * { vertical-align: middle !important; }";
		style += "#PerfBar .perf-symbols > a, #ToolsActiveBar .perf-symbols > a { width: 30px; text-align: center; }";
		style += "#PerfBar .perf-symbols .fullName { display: none;  }";
		
		style += "#PerfBar .perfSeparator { cursor: default; }";
		
		style += "#PerfBar .perfSymbolsSeparator { display: none; }";
		style += "@media (max-width: 768px) {";
			style += "#PerfBar { height: auto !important; }";
			style += "#PerfBar #Perf-logo { display: none; }";
			style += "#PerfBar { padding: 0px; }";
			style += "#PerfBar a { width:	100%; }";
			style += "#PerfBar .perfSeparator { display: none; }";
			
			style += "#PerfBar .perf-symbols { display: block; width: 100% !important; text-align: left !important; position: static !important; }";
			style += "#PerfBar .perf-symbols > * { display: block; width: 100% !important; text-align: left !important; position: static !important; }";
			style += "#PerfBar .perf-symbols .symbol { display: none; }";
			style += "#PerfBar .perf-symbols .fullName { display: block !important; }";
			style += "#PerfBar .perfSymbolsSeparator { display: block; }";
		style += "}";
		style += "#PerfToolTitle { font-weight: bold; }";
		style += "#ToolsActiveBar .perfToolBackButton { font-weight: bold; }";
		
		style += "#ScalePageContent { position: absolute; left: 0px; top: 0px; width: 100%; }";
		
		style += "#PerfBar, #ToolsActiveBar { transition: top ease-out 0.5s, opacity ease-out 0.5s; -webkit-transition: top ease-out 0.5s, opacity ease-out 0.5s; }";
		style += "#ScalePageContent { transition: top ease-out 0.5s, opacity ease-out 0.5s; -webkit-transition: top ease-out 0.5s, opacity ease-out 0.5s; }";

		this.styleElem.innerHTML = style;
		head.appendChild(this.styleElem);
	},
	
	putPageContentsToDiv: function() {
		var body = document.getElementsByTagName("body")[0];
		
		this.pageContent = document.createElement("div");
		this.pageContent.id = "ScalePageContent";
		
		for(var i = (body.childNodes.length - 1); i>=0; i--)
		{
			if(body.childNodes[i].nodeName == "SCRIPT") continue;
			if(body.childNodes[i].id == "ScalePerfLoadingHint") continue;
			if(body.childNodes[i].id == "PerfBar") continue;
			if(body.childNodes[i].id == "ToolsActiveBar") continue;
			
			if(this.pageContent.childNodes.length == 0) this.pageContent.appendChild(body.childNodes[i]);
			else this.pageContent.insertBefore(body.childNodes[i], this.pageContent.firstChild);
		}
		
		body.appendChild(this.pageContent);
	},
	
	menu: {
		superClass:	null,
		bar:		null,
		toolsMenu:	null,
		logoSrc:	"data:image/png;base64,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",
		
		addBar: function() {
			var superClass = this.superClass;
			var menu = this;
			
			var body = document.getElementsByTagName("body")[0];
			
			// Create container for the bar
			menu.bar = document.createElement("div");
			menu.bar.id = "PerfBar";
			menu.bar.superClass = superClass;
			body.appendChild(menu.bar);
			
			/* Build the scaffold for the bar */ {
				// Container for the tool links
				menu.toolsMenu = document.createElement("div");
				menu.bar.appendChild(menu.toolsMenu);
				
				// Separator between tools and symbols in mobile view
				var separatorElem = document.createElement("hr");
				separatorElem.className = "perfSymbolsSeparator";
				menu.bar.appendChild(separatorElem);
				
				// Container for symbols
				var symbolsBlock = document.createElement("div");
				symbolsBlock.className = "perf-symbols";
				menu.bar.appendChild(symbolsBlock);
				
				// Add logo
				var logo = document.createElement("img");
				logo.id = "Perf-logo";
				logo.src = menu.logoSrc;
				symbolsBlock.appendChild(logo);
			}
			
			/* Add contents */ {
				// Add all tool links
				for(var i in superClass.scripts)
				{
					var script = superClass.scripts[i];
					
					// If it's not the first element, add a separator to the last element
					var isFirst = (i == 0);
					if(!isFirst > 0 && !script.pullToSymbols)
					{
						var separatorElem = document.createElement("span");
						separatorElem.className = "perfSeparator";
						separatorElem.innerHTML = "&middot;";
						menu.toolsMenu.appendChild(separatorElem);
					}
					
					var link = menu.createMenuLink(script);
					
					if(script.pullToSymbols) symbolsBlock.appendChild(link);
					else menu.toolsMenu.appendChild(link);
				}
			}
		},
		
		createMenuLink: function(script) {
			var superClass = this.superClass;
			var menu = this;
			
			var link = document.createElement("a");
			link.data = {
				script: script
			};
			
			// if performance api required, but api not available, disable
			var disableTool = (script.requiresPerformanceApi && window.performance == null);
			link.className += (disableTool ? " disabled" : "");
			if(disableTool) link.title = "This tool was disabled cause your browser doesn't support the Resource Timing API!";
			
			// If not disabled, add click handlers
			if(!disableTool)
			{
				if(script.url != null)
				{
					link.href = script.url;
					link.target = "_blank";
				}
				else
				{
					link.href = "javascript:;";
					link.onclick = menu._onLinkClick;
				}
				
				// Remember the onclick event in the link-element
				link._onToolStartTrigger = script.onclick;
			}
			
			// Add the link-labels
			if(script.name != null)
			{
				var fullName = document.createElement("span");
				fullName.className = "fullName";
				fullName.innerHTML = script.name;
				fullName._onToolStartTrigger = script.onclick;
				link.appendChild(fullName);
			}
			
			if(script.symbol != null)
			{
				var symbol = document.createElement("span");
				symbol.className = "symbol";
				symbol.innerHTML = script.symbol;
				symbol._onToolStartTrigger = script.onclick;
				link.appendChild(symbol);
			}
			
			return link;
		},
		
		// Show the menu bar
		show: function() {
			this.bar.style.top = 0;
			this.superClass.pageContent.style.top = 30;
		},
		
		// Hide the menu bar
		hide: function() {
			this.bar.style.top = -40;
			this.superClass.pageContent.style.top = 0;
		},
		
		_onLinkClick: function(e) {
			// handles clicks on the label or the link itself
			var superClass =
				e.target.parentNode.parentNode.superClass ||
				e.target.parentNode.parentNode.parentNode.superClass;
			var menu = superClass.menu;
			var tools = superClass.tools;
			
			// handles clicks on the label or the link itself
			var script = (e.target.data != null ? e.target.data.script : e.target.parentNode.data.script);
			
			// if onclick function is set, execute it
			if(typeof(e.target._onToolStartTrigger) == "function")
			{
				e.target._onToolStartTrigger(superClass);
			}
			
			if(script.href == null && script.localHref == null) return;
			
			menu.hide();
			tools.show();
			
			// Set teh tools-bar title
			superClass.toolBarActiveTitle.innerHTML = script.name || script.symbol;
			
			// Load specified script
			var jselem = document.createElement("script");
			jselem.id = "PerfScript" + script.index;
			jselem.type = "text/javascript";
			
			// Decide whether to load local or public script
			if(superClass.helpers.isLocal() && script.localHref != null)
			{
				jselem.src = script.localHref;
			}
			else
			{
				jselem.src = script.href;
			}
			
			document.getElementsByTagName("body")[0].appendChild(jselem);
			
			// Add method to remove script after closing tool
			superClass.tools.onCloseTool(function() {
				jselem.parentNode.removeChild(jselem);
			});
			
			//superClass.helpers.avoidPageOverlapWithBar();
		}
	},
	
	tools: {
		superClass:		null,
		_onCloseTool:	[],
		bar:			null,
		
		addBar: function() {
			var superClass = this.superClass;
			var tools = this;
			
			var body = document.getElementsByTagName("body")[0];		
			
			/* Tool Active Bar */ {
				tools.bar = document.createElement("div");
				tools.bar.id = "ToolsActiveBar";
				tools.bar.superClass = superClass;
				body.appendChild(tools.bar);
				
				var symbolsBlock = document.createElement("div");
				symbolsBlock.className = "perf-symbols";
				tools.bar.appendChild(symbolsBlock);
				
				// Add back button
				var toolBarActiveBackButton = document.createElement("a");
				toolBarActiveBackButton.className = "perfToolBackButton";
				toolBarActiveBackButton.href = "javascript:;";
				toolBarActiveBackButton.innerHTML = "< ";
				toolBarActiveBackButton.onclick = function() {
					// Show menu bar
					superClass.menu.show();
					
					// Trigger close of tool-active bar
					close.onclick();
				};
				tools.bar.appendChild(toolBarActiveBackButton);
				
				// Add title bar
				superClass.toolBarActiveTitle = document.createElement("span");
				superClass.toolBarActiveTitle.id = "PerfToolTitle";
				superClass.toolBarActiveTitle.innerHTML = "Nice tool";
				toolBarActiveBackButton.appendChild(superClass.toolBarActiveTitle);
				
				// Add close button
				var symbolsBlock = document.createElement("div");
				symbolsBlock.className = "perf-symbols";
				tools.bar.appendChild(symbolsBlock);
				
				var close = document.createElement("a");
				close.href = "javascript:;";
				close.innerHTML = "X";
				close.onclick = function() {
					tools.hide();
					
					superClass.tools.executeOnCloseTool();
					
					//superClass.helpers.avoidPageOverlapWithBar();
				};
				symbolsBlock.appendChild(close);
			}
		},
		
		// Show the tools bar
		show: function() {
			var superClass = this.superClass;
			
			this.bar.style.top = 0;
			
			var h1 = (superClass.menu.bar != null ? superClass.menu.bar.offsetHeight : 0);
			var h2 = (superClass.tools.bar != null ? superClass.tools.bar.offsetHeight : 0);
			
			this.superClass.pageContent.style.top = Math.max(h1, h2);
		},
		
		// Hide the tools bar
		hide: function() {
			this.bar.style.top = -40;
		},
		
		onCloseTool: function(func) {
			this._onCloseTool.push(func);
		},
		
		executeOnCloseTool: function(func) {
			while(this._onCloseTool.length > 0)
			{
				var func = this._onCloseTool.pop();
				func();
			}
		}
	},
	
	helpers: {
		isLocal: function() {
			// Flag if this script is executes locally or not
			return ((self.location+"").split("http://").pop().split("/")[0] == "localhost");
		},
		
		/*
		avoidPageOverlapWithBar: function() {
			var superClass = this.superClass;
			
			var body = document.getElementsByTagName("body")[0];
			
			var h1 = (superClass.menu.bar != null ? superClass.menu.bar.offsetHeight : 0);
			var h2 = (superClass.tools.bar != null ? superClass.tools.bar.offsetHeight : 0);
			superClass.menu.barHeight = Math.max(h1, h2);
			
			// move the page to the right place
			superClass.pageContent.style.top = (superClass.menu.barHeight) + "px";
		},
		//*/
		
		animate: function(elem, height, endPosition) {
			endPosition = endPosition||0;
			
			if(height != null)
			{
				elem.style.opacity = 0;
				elem.style.top = -height + "px";
			}
			
			elem.style.transition = elem.style['-webkit-transition'] = "top ease-out 0.5s, opacity ease-out 0.5s";
			
			// async execution to let it happen after current function executed
			setTimeout(function() {
				elem.style.opacity = 1;
				elem.style.top = endPosition + "px";
			}, 0);
		},
		
		waitForExist: function(elemId, callback) {
			var interval = window.setInterval(function() {
				var element = document.getElementById(elemId);
				
				if(element != null)
				{
					callback(element);
					
					window.clearInterval(interval);
				}
			}, 10);
		},
		
		filesToHide: [ "perf-bookmarklet.js", "tools/dommonster.js", "tools/perfmap.js", "tools/performanceBookmarklet.js", "tools/stats.js", "tools/waterfall.js" ],
		removeOwnSourcesFromResources: function(resources) {
			var filteredResources = [];
			
			for(var f in resources)
			{
				var r = resources[f];
				var url = r.url || r.name;
				
				var hideThis = false;
				for(var g in this.filesToHide)
				{
					var hideMe = this.filesToHide[g];
					
					if(url.length >= hideMe.length && hideMe == url.substr(url.length - hideMe.length))
					{
						hideThis = true;
						break;
					}
				}
				
				if(hideThis) continue;
				
				filteredResources.push(r);
			}
			
			return filteredResources;
		},
		
		getPageLoadTimeFromResources: function(resources) {
			var pageLoadTime = 0;
			for(var f in resources)
			{
				var resource = resources[f];
				
				if((resource.start - pageLoadTime) >= 2000) break;
				
				pageLoadTime = resource.start + resource.duration;
			}
			
			return Math.round(pageLoadTime);
		}
	}
};

// Check if PerfBar already exists
if(scalePerformanceBar == null)
{
	var scalePerformanceBar = new ScalePerformanceBarClass();
}
else
{
	scalePerformanceBar.menu.show();
}