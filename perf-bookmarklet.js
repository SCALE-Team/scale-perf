var ScalePerformanceBarClass = function() {
	var superClass = this;
	
	// add all CSS styles
	this.addStyles();
	
	
	var body = document.getElementsByTagName("body")[0];
	
	// Create container element
	superClass.topBarContainer = document.createElement("div");
	superClass.topBarContainer.id = "PerfBar";
	body.appendChild(superClass.topBarContainer);
	
	// For the transition animation (async execution to let it happen after current function executed)
	setTimeout(function() {
		superClass.topBarContainer.style['transform'] = "translateY(0px)";
		superClass.topBarContainer.style['-webkit-transform'] = "translateY(0px)";
	}, 0);
	
	// All tool scripts to be included
	superClass.scripts = [
		{
			name:					"Performance Bookmarklet",
			href:					"https://scale-team.github.io/scale-perf/tools/performanceBookmarklet.js",
			requiresPerformanceApi:	true,
			localHref:				"/tools/performanceBookmarklet.js",
			onclick: function() {
				addFunctionOnToolClose(function()
				{
					var waterfall = document.getElementById("perfbook-iframe");
					waterfall.parentNode.removeChild(waterfall);
				});
			}
		},
		{
			name:					"Page load waterfall",
			href:					"https://scale-team.github.io/scale-perf/tools/waterfall.js",
			requiresPerformanceApi:	true,
			localHref:				"/tools/waterfall.js",
			onclick: function() {
				addFunctionOnToolClose(function() {
					var waterfall = document.getElementById("PerfWaterfallDiv");
					waterfall.parentNode.removeChild(waterfall);
				});
			}
		},
		{
			name:					"Picture load times",
			href:					"https://scale-team.github.io/scale-perf/tools/perfmap.js",
			requiresPerformanceApi:	true,
			localHref:				"/tools/perfmap.js",
			onclick: function() {
				addFunctionOnToolClose(function() {
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
			onclick:	function() {
				addFunctionOnToolClose(function() {
					var r = document.getElementById("jr_results");
					r.parentNode.removeChild(r);
				});
				
				cssElem.innerText += "#jr_stats { float: none !important; width: 100% !important; }";
				cssElem.innerText += "#jr_stats > div { display: inline-block !important; width: 210px !important; }";
				cssElem.innerText += "#jr_stats > div > div:first-child { width: 20px !important; height: 20px !important; margin-right: 5px !important; }";
			}
		},
		{
			name:		"FPS display",
			href:		"https://scale-team.github.io/scale-perf/tools/stats.js",
			localHref:	"/tools/stats.js",
			onclick:	function() {
				var displayStatsInterval = setInterval(function() {
					if(typeof Stats == "function")
					{
						clearInterval(displayStatsInterval);
						
						var stats = new Stats();
						stats.domElement.style.position = "fixed";
						stats.domElement.style.left = "0px";
						stats.domElement.style.top = "0px";
						stats.domElement.style.zIndex = "10000";
						body.appendChild(stats.domElement);
						
						// for the transition animation
						stats.domElement.style.cssText += "transition:transform ease-out 0.3s; transform:translateY(-450px); -webkit-transition:-webkit-transform ease-out 0.3s; -webkit-transform:translateY(-450px);";
						
						setTimeout(function(){
							stats.domElement.style.cssText += 'transform:translateY(30px); -webkit-transform:translateY(30px);';
						}, 10);
						
						var interval = setInterval(function(){ stats.update(); }, 1000/60);
						
						addFunctionOnToolClose(function()
						{
							body.removeChild(stats.domElement);
							clearInterval(interval);
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
			onclick: function() {
				var bar = document.getElementById("PerfToolActiveBar");
				
				bar.superClass.topBarContainer.style.display = "none";
				bar.superClass.avoidPageOverlapWithBar();
			}
		}
	];
	
	var toolsMenu = document.createElement("div");
	superClass.topBarContainer.appendChild(toolsMenu);
	
	var separatorElem = document.createElement("hr");
	separatorElem.className = "perfSymbolsSeparator";
	superClass.topBarContainer.appendChild(separatorElem);
	
	var symbolsBlock = document.createElement("div");
	symbolsBlock.className = "perf-symbols";
	superClass.topBarContainer.appendChild(symbolsBlock);
	
	var logo = document.createElement("img");
	logo.id = "Perf-logo";
	logo.src = "data:image/png;base64,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";
	symbolsBlock.appendChild(logo);
	
	var maxIndex = (superClass.scripts.length - 1);
	
	for(var i in superClass.scripts)
	{
		var script = superClass.scripts[i];
		
		if(i > 0 && !script.pullToSymbols)
		{
			var separatorElem = document.createElement("span");
			separatorElem.className = "perfSeparator";
			separatorElem.innerHTML = "&middot;";
			toolsMenu.appendChild(separatorElem);
		}
		
		// if performance api required, but api not available, disable
		var disableTool = (script.requiresPerformanceApi && window.performance == null);
		
		var link = document.createElement("a");
		link.data = {
			scriptIndex: i
		};
		
		link.className += (disableTool ? " disabled" : "");
		
		link._onToolStartTrigger = script.onclick;
		
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
		
		if(disableTool)
		{
			link.title = "This tool was disabled cause your browser doesn't support the Resource Timing API!";
		}
		else
		{
			if(script.url != null)
			{
				link.href = script.url;
				link.target = "_blank";
			}
			else
			{
				link.onclick = function(elem) {
					var index = (elem.target.data != null ? elem.target.data.scriptIndex : elem.target.parentNode.data.scriptIndex);
					var script = superClass.scripts[index];
					
					if(typeof(elem.target._onToolStartTrigger) == "function")
					{
						elem.target._onToolStartTrigger();
					}
					
					if(script.href == null && script.localHref == null) return;
					
					toolsMenu.style.display = "none";
					superClass.toolActiveBar.style.display = "block";
					toolBarActiveTitle.innerHTML = script.name || script.symbol;
					
					// Add method to remove script after closing tool
					addFunctionOnToolClose(function() {
						var scriptElem = document.getElementById('PerfScript' + index);
						
						scriptElem.parentNode.removeChild(scriptElem);
					});
					
					// Load specified script
					var jselem = document.createElement("script");
					jselem.id = "PerfScript" + index;
					jselem.type = "text/javascript";
					
					// Decide whether to load local or public script
					if(superClass.isLocal() && script.localHref != null)
					{
						console.log("tool loaded locally");
						jselem.src = script.localHref;
					}
					else
					{
						jselem.src = script.href;
					}
					
					document.getElementsByTagName("body")[0].appendChild(jselem);
					
					superClass.avoidPageOverlapWithBar();
				};
			}
		}
		
		if(script.pullToSymbols) symbolsBlock.appendChild(link);
		else toolsMenu.appendChild(link);
	}
	
	/* Tool Active Bary */ {
		superClass.toolActiveBar = document.createElement("div");
		superClass.toolActiveBar.id = "PerfToolActiveBar";
		superClass.toolActiveBar.superClass = this;
		body.appendChild(superClass.toolActiveBar);
		
		var symbolsBlockInToolActiveBar = document.createElement("div");
		symbolsBlockInToolActiveBar.className = "perf-symbols";
		superClass.toolActiveBar.appendChild(symbolsBlockInToolActiveBar);
		
		// Add back button
		var toolBarActiveBackButton = document.createElement("a");
		toolBarActiveBackButton.className = "perfToolBackButton";
		toolBarActiveBackButton.innerHTML = "< ";
		toolBarActiveBackButton.onclick = function(){
			superClass.topBarContainer.style.display = "block";
			closeToolActiveBar.click();
		};
		superClass.toolActiveBar.appendChild(toolBarActiveBackButton);
		
		// Add title bar
		var toolBarActiveTitle = document.createElement("span");
		toolBarActiveTitle.id = "PerfToolTitle";
		toolBarActiveTitle.innerHTML = "Nice tool";
		toolBarActiveBackButton.appendChild(toolBarActiveTitle);
		
		// Add close button
		var symbolsBlockInToolActiveBar = document.createElement("div");
		symbolsBlockInToolActiveBar.className = "perf-symbols";
		superClass.toolActiveBar.appendChild(symbolsBlockInToolActiveBar);
		
		var closeToolActiveBar = document.createElement("a");
		closeToolActiveBar.innerHTML = "X";
		closeToolActiveBar.onclick = function() {
			//alert(22);
			superClass.toolActiveBar.style.display = "none";
			
			executeOnCloseTool();
			
			superClass.avoidPageOverlapWithBar();
		};
		symbolsBlockInToolActiveBar.appendChild(closeToolActiveBar);
	}

	var _onCloseTool = [];
	function addFunctionOnToolClose(func) {
		_onCloseTool.push(func);
	}

	function executeOnCloseTool(func) {
		while(_onCloseTool.length > 0)
		{
			var func = _onCloseTool.pop();
			func();
		}
	}
	
	superClass.show();
};

ScalePerformanceBarClass.prototype = {
	topBarContainer:	null,
	oldBodyPaddingTop:	0,
	
	addStyles: function() {
		var head = document.head || document.getElementsByTagName('head')[0];
		
		var cssElem = document.createElement("style");
		cssElem.id = "PerfBookmarkletStyle";
		var style = "#PerfBar, #PerfToolActiveBar { font-family: Arial !important; font-size: 14px !important; z-index: 1000000; color: #fff; position: fixed; top: 0px; left: 0px; width: 100%; background-color: #000; box-shadow: 0px 0px 5px #000; }";
		style += "#PerfBar { transition:transform ease-out 0.3s; transform:translateY(-450px); -webkit-transition:-webkit-transform ease-out 0.3s; -webkit-transform:translateY(-450px); }";
		style += "#PerfBar #Perf-logo { height: 20px; }";
		style += "#PerfToolActiveBar { display: none; }";
		style += "#PerfBar a, #PerfToolActiveBar a { display: inline-block; cursor: pointer; text-decoration: none !important; color: #fff !important; display: inline-block; padding: 5px; }";
		style += "#PerfBar a:hover, #PerfToolActiveBar a:hover { background-color: red !important; }";
		style += "#PerfBar a.disabled { color: #555 !important; cursor: default; }";
		style += "#PerfBar a.disabled:hover { background-color: transparent !important; }";
		
		style += "#PerfBar .perf-symbols, #PerfToolActiveBar .perf-symbols { position: absolute; top: 0px; right: 0px; vertical-align: middle !important; }";
		style += "#PerfBar .perf-symbols > a, #PerfToolActiveBar .perf-symbols > a { width: 30px; text-align: center; }";
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
		style += "#PerfToolActiveBar .perfToolBackButton { font-weight: bold; }";

		cssElem.innerHTML = style;
		head.appendChild(cssElem);
	},
	
	isLocal: function() {
		// Flag if this script is executes locally or not
		return ((self.location+"").split("http://").pop().split("/")[0] == "localhost");
	},
	
	show: function() {
		// Detect height of performance bar
		this.topBarContainer.style.display = "block";
		
		this.avoidPageOverlapWithBar();
	},
	
	avoidPageOverlapWithBar: function() {
		var body = document.getElementsByTagName("body")[0];
		
		if(this.oldBodyPaddingTop != 0)
		{
			body.style.paddingTop = this.oldBodyPaddingTop.split("px")[0] * 1.0;
			
			this.oldBodyPaddingTop = 0;
		}
		
		this.topBarContainerHeight = Math.max(this.topBarContainer.offsetHeight, this.toolActiveBar.offsetHeight);
		
		// Detect and remember the current padding of the page
		this.oldBodyPaddingTop = body.offsetTop * 1.0;
		
		// move the page to the right place
		body.style.paddingTop = (this.oldBodyPaddingTop + this.topBarContainerHeight) + "px";
	},
};

// Check if PerfBar already exists
if(scalePerformanceBar == null)
{
	var scalePerformanceBar = new ScalePerformanceBarClass();
}
else
{
	scalePerformanceBar.show();
}