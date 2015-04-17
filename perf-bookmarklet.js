var ScalePerformanceBarClass = function() {
	// Set the main class reference for sub-namespaces
	this.menu.superClass = this;
	this.tools.superClass = this;
	this.helpers.superClass = this;
	this.popup.superClass = this;
	
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
			devHref:					"https://scale-team.github.io/scale-perf-dev/tools/performanceBookmarklet.js",
			localHref:				"/tools/performanceBookmarklet.js",
			helpText:				"A bookmarklet with several metrics about your page. View the documentation at <a href='https://github.com/micmro/performance-bookmarklet'>Github</a>.",
			requiresPerformanceApi:	true,
			onload: function(superClass) {
				superClass.tools.activeTool = new PerfBookmarklet();
			}
		},
		{
			name:					"Page load waterfall",
			href:					"https://scale-team.github.io/scale-perf/tools/waterfall.js",
			devHref:				"https://scale-team.github.io/scale-perf-dev/tools/waterfall.js",
			requiresPerformanceApi:	true,
			localHref:				"/tools/waterfall.js",
			helpText:				"Gives you an overview about all resources loaded by the page and their load times. Use the time filters to zoom into the waterfall.<br />The waterfall automatically calculates the 'page load time' and sets it as the maximum time ('until xxx'). It's the time the page needed build up completely, including external resources. Continuous requests to the server should be hidden by doing this.",
			onload: function(superClass) {
				superClass.tools.activeTool = new Waterfall({ getPageLoadTime: superClass.helpers.getPageLoadTimeFromResources });
			}
		},
		{
			name:					"Picture load times",
			href:					"https://scale-team.github.io/scale-perf/tools/perfmap.js",
			devHref:				"https://scale-team.github.io/scale-perf-dev/tools/perfmap.js",
			localHref:				"/tools/perfmap.js",
			helpText:				"This tool shows you The time the pictures were loaded and how long they took to load.",
			requiresPerformanceApi:	true,
			onload: function(superClass) {
				superClass.tools.activeTool = new PerfMap();
			}
		},
		{
			name:		"Analyze DOM tree",
			href:		"https://scale-team.github.io/scale-perf/tools/dommonster.js",
			devHref:	"https://scale-team.github.io/scale-perf-dev/tools/dommonster.js",
			localHref:	"/tools/dommonster.js",
			helpText:	"Analyze the DOM tree for tipps.<br />elements: Amount of HTML elements<br />text nodes: Amount of text nodes<br />nodes: Total amount of elements (HTML + text nodes)",
			onload: function(superClass) {
				superClass.tools.activeTool = new DomMonster();
			}
		},
		{
			name:		"FPS display",
			href:		"https://scale-team.github.io/scale-perf/tools/stats.js",
			devHref:	"https://scale-team.github.io/scale-perf-dev/tools/stats.js",
			localHref:	"/tools/stats.js",
			helpText:	"Shows you how fast your webpage is rendered. It has the same meaning like in games. If your webpage gets below 30 FPS it is definitely too complex to be rendered fast enough.<br />Play with it! E.g. scroll down your webpage, reload things and watch the impact at your rendering performance. The efefct will be more visible when you simulate a slow network connection. You can set this in the Chrome developer tools (<a href='http://www.elijahmanor.com/enhanced-chrome-emulation-tools/'>have a look here</a>).",
			onload: function(superClass) {
				superClass.tools.activeTool = new Stats();
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
			}
		}
	],
	
	addStyles: function() {
		var head = document.head || document.getElementsByTagName('head')[0];
		
		this.styleElem = document.createElement("style");
		this.styleElem.id = "PerfBookmarkletStyle";
		
		var style = "#PerfBar, #ToolsActiveBar { font-family: Arial !important; font-size: 14px !important; z-index: 1000000; color: #fff; position: fixed; top: 0px; left: 0px; width: 100%; background-color: #000; box-shadow: 0px 0px 5px #000; }";
		style += "#PerfBar.hideBar, #ToolsActiveBar.hideBar { top: -40px; }";
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
			style += "#PerfBar.hideBar, #ToolsActiveBar.hideBar { top: -300px; }";
			style += "#PerfBar #Perf-logo { display: none; }";
			style += "#PerfBar { padding: 0px; }";
			style += "#PerfBar a { width:	100%; }";
			style += "#PerfBar .perfSeparator { display: none; }";
			
			style += "#PerfBar .perf-symbols { display: block; width: 100% !important; text-align: left !important; position: static !important; }";
			style += "#PerfBar .perf-symbols > * { display: block; width: 100% !important; text-align: left !important; position: static !important; }";
			style += "#PerfBar .perf-symbols .symbol { display: none; }";
			style += "#PerfBar .perf-symbols .fullName { display: block !important; }";
			style += "#PerfBar .perfSymbolsSeparator { display: block; }";
			
			style += "#ScalePageContent, #PerfBar, #ToolsActiveBar, .scaleToolContainer { transition: none !important; } ";
			
			style += "#ScalePopUp { top: 5px; right: 5px; bottom: 5px; left: 5px; }";
		style += "}";
		style += "#PerfToolTitle { font-weight: bold; }";
		style += "#ToolsActiveBar .perfToolBackButton { font-weight: bold; }";
		
		style += "#ScalePageContent { position: absolute; left: 0px; top: 0px; width: 100%; }";
		
		style += "#PerfBar, #ToolsActiveBar { transition: top ease-out 0.5s, opacity ease-out 0.5s; -webkit-transition: top ease-out 0.5s, opacity ease-out 0.5s; }";
		style += "#ScalePageContent { transition: top ease-out 0.5s, opacity ease-out 0.5s; -webkit-transition: top ease-out 0.5s, opacity ease-out 0.5s; }";
		
		style += "#ScalePopUp { z-index: 1000002; position: fixed; top: 10px; bottom: 10px; left: 50%; margin-left: -200px; 0px auto; width: 400px; height: auto; min-height: auto; background: #fff; box-shadow: 2px 2px 10px rgba(0,0,0,0.7); }";
		style += "#ScalePopUp.is_short { height: 300px; }";
		style += "#ScalePopUp .content { position: absolute; top: 0px; left: 0px; right: 0px; bottom: 50px; overflow: auto; padding: 15px; }";
		style += "#ScalePopUp .button-row { position: absolute; bottom: 0px; left: 0px; right: 0px; height: 50px; }";
		style += "#ScalePopUp .button-row a { position: absolute; top: 0px; right: 0px; bottom: 0px; left: 0px; color: #555; font-size: 16px; background: rgba(0,0,0,0.1); padding: 14px; text-align: center; }";
		style += "#ScalePopUp .button-row a:hover { cursor: pointer; background-color: rgba(0,0,0,0.2); }";
		style += "#ScalePopUpBackground { z-index: 1000001; position: fixed; top: 0px; right: 0px; bottom: 0px; left: 0px; background: rgba(0,0,0,0.5); }";
		
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
			menu.bar.className = "hideBar";
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
					link.onclick = function(e) {
						superClass.tools.onActiveToolLoaded(function() {
							// Wait for the tool container to exist and afterwards move the page content down
							superClass.helpers.waitForElementExist(superClass.tools.activeTool.containerId, function(containerElem) {
								containerElem.className += " scaleToolContainer";
								containerElem.style.top = -containerElem.offsetHeight + "px";
								containerElem.style.visibility = "visible";
								containerElem.style.transition = containerElem.style['-webkit-transition'] = "top ease-out 0.5s, opacity ease-out 0.5s";
								
								window.setTimeout(function() {
									containerElem.style.top = superClass.tools.bar.offsetHeight + "px";
									
									var pageContentTop = superClass.tools.bar.offsetHeight;
									
									if(superClass.tools.activeTool.shouldMovePageContent) pageContentTop += containerElem.offsetHeight;
									
									superClass.pageContent.style.top = pageContentTop + "px";
								}, 0);
							});
						});
						
						menu._onLinkClick(e);
					};
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
			this.bar.className = this.superClass.helpers.removeClass(this.bar.className, "hideBar");
			
			this.superClass.pageContent.style.top = this.bar.offsetHeight + "px";
		},
		
		// Hide the menu bar
		hide: function() {
			this.bar.className = this.superClass.helpers.addClass("hideBar");
			
			this.superClass.pageContent.style.top = "0px";
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
			
			// Set the tools-bar title
			superClass.toolBarActiveTitle.innerHTML = script.name || script.symbol;
			superClass.currentHelperContent = script.helpText;
			
			var loadScript = function() {
				// Load specified script
				var jselem = document.createElement("script");
				jselem.id = "PerfScript";
				jselem.type = "text/javascript";
				
				// Decide whether to load local, dev or public script
				if(superClass.helpers.isLocal() && script.localHref != null)
				{
					jselem.src = script.localHref;
				}
				else if(superClass.helpers.isDev() && script.devHref != null)
				{
					jselem.src = script.devHref;
				}
				else
				{
					jselem.src = script.href;
				}
				
				if(script.onload != null)
				{
					jselem.onload = function() {
						script.onload(superClass);
						
						if(tools.activeTool.onload != null) tools.activeTool.onload();
						
						tools.executeOnActiveToolLoaded();
					}
				}
				
				document.getElementsByTagName("body")[0].appendChild(jselem);
			};
			
			loadScript();
		}
	},
	
	tools: {
		superClass:		null,
		bar:			null,
		
		addBar: function() {
			var superClass = this.superClass;
			var tools = this;
			
			var body = document.getElementsByTagName("body")[0];		
			
			/* Tool Active Bar */ {
				tools.bar = document.createElement("div");
				tools.bar.id = "ToolsActiveBar";
				tools.bar.className = "hideBar";
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
					// Trigger close of tool-active bar
					close.onclick(true);
				};
				tools.bar.appendChild(toolBarActiveBackButton);
				
				// Add title bar
				superClass.toolBarActiveTitle = document.createElement("span");
				superClass.toolBarActiveTitle.id = "PerfToolTitle";
				superClass.toolBarActiveTitle.innerHTML = "Nice tool";
				toolBarActiveBackButton.appendChild(superClass.toolBarActiveTitle);
				
				// Add symbols
				var symbolsBlock = document.createElement("div");
				symbolsBlock.className = "perf-symbols";
				tools.bar.appendChild(symbolsBlock);
				
					// Add help button
					var help = document.createElement("a");
					help.href = "javascript:;";
					help.innerHTML = "?";
					help.superClass = superClass;
					help.onclick = function(e) {
						var content = e.target.superClass.currentHelperContent;
						
						scalePerformanceBar.popup.show(content);
					};
					symbolsBlock.appendChild(help);
					
					// Add close button
					var close = document.createElement("a");
					close.href = "javascript:;";
					close.innerHTML = "X";
					close.onclick = function(isBackButton) {
						tools.hide();
						
						// if back button was triggered originally
						if(isBackButton === true)
						{
							// Show menu bar
							superClass.menu.show();
						}
						else
						{
							// Set page content back to normal position
							superClass.pageContent.style.top = "0px";
						}
						
						var elem = document.getElementById(tools.activeTool.containerId);
						elem.style.top = -elem.offsetHeight + "px";
						
						window.setTimeout(function() {
							// Remove the tool script
							var scriptElem = document.getElementById("PerfScript");
							scriptElem.parentNode.removeChild(scriptElem);
							
							if(tools.activeTool.onclose != null) tools.activeTool.onclose();
						}, 500);
					};
					symbolsBlock.appendChild(close);
			}
		},
		
		// Show the tools bar
		show: function() {
			this.bar.className = this.superClass.helpers.removeClass(this.bar.className, "hideBar");
			
			this.superClass.pageContent.style.top = this.superClass.tools.bar.offsetHeight + "px";
		},
		
		// Hide the tools bar
		hide: function() {
			this.bar.className = this.superClass.helpers.addClass("hideBar");
		},
		
		_onActiveToolLoaded: [],
		onActiveToolLoaded: function(func) {
			this._onActiveToolLoaded.push(func);
		},
		
		executeOnActiveToolLoaded: function(func) {
			while(this._onActiveToolLoaded.length > 0)
			{
				var func = this._onActiveToolLoaded.pop();
				func();
			}
		}
	},
	
	helpers: {
		isLocal: function() {
			// Flag if this script is executes locally or not
			return ((self.location+"").split("http://").pop().split("/")[0] == "localhost");
		},
		
		isDev: function() {
			// Flag if this script is executes locally or not
			return (typeof(isDevelopmentMode) == "undefined" ? false : isDevelopmentMode);
		},
		
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
		
		waitForElementExist: function(elemId, callback) {
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
				
				var fin = resource.start + resource.duration;
				
				if((fin - pageLoadTime) >= 2000) break;
				
				pageLoadTime = Math.max(pageLoadTime, fin);
			}
			return Math.round(pageLoadTime);
		},
		
		removeClass: function(elemClassName, classToRemove) {
			var classes = elemClassName.split(" ");
			var index = classes.indexOf(classToRemove);
			
			if(index != -1) classes.splice(index, 1);
			
			return classes.join(" ");
		},
		
		addClass: function(elemClassName, classToAdd) {
			return elemClassName += " " + classToAdd;
		}
	},
	
	popup: {
		id:				"ScalePopUp",
		backgroundId:	"ScalePopUpBackground",
		elem:			null,
		contentElem:	null,
		backgroundElem:	null,
		
		show: function(content) {
			var popup = this.superClass.popup;
			
			if(popup.elem == null)
			{
				popup.elem = document.createElement("div");
				popup.elem.id = popup.id;
				document.body.appendChild(popup.elem);
				
				popup.contentElem = document.createElement("div");
				popup.contentElem.className = "content";
				popup.elem.appendChild(popup.contentElem);
				
				var buttonRow = document.createElement("div");
				buttonRow.className = "button-row";
				popup.elem.appendChild(buttonRow);
				
				var closeButton = document.createElement("a");
				closeButton.innerHTML = "close";
				closeButton.onclick = function(){ popup.hide() };
				buttonRow.appendChild(closeButton);
				
				// Background
				popup.backgroundElem = document.createElement("div");
				popup.backgroundElem.id = popup.backgroundId;
				popup.backgroundElem.onclick = function(){ popup.hide() };
				document.body.appendChild(popup.backgroundElem);
			}
			
			popup.elem.style.display = "block";
			popup.backgroundElem.style.display = "block";
			
			if(typeof(content) == "string")
			{
				popup.elem.className = "is_short";
				
				popup.contentElem.innerHTML = content;
			}
			else if(typeof(content) == "object")
			{
				popup.contentElem.className = "";
				
				for(var f in content)
				{
					popup.contentElem.appendChild(content[f]);
				}
			}
		},
		
		hide: function() {
			var popup = this.superClass.popup;
			
			popup.elem.style.display = "none";
			popup.backgroundElem.style.display = "none";
			popup.contentElem.innerHTML = "";
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