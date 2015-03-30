var ScalePerformanceBarClass = function() {
	var superClass = this;
	
	var isLocal = ((self.location+"").split("http://").pop().split("/")[0] == "localhost");

	var body = document.getElementsByTagName("body")[0];
	var head = document.head || document.getElementsByTagName('head')[0];

	var cssElem = document.createElement("style");
	cssElem.id = "PerfBookmarkletStyle";
	var style = "#PerfBar, #PerfToolActiveBar { z-index: 1000000; color: #fff; position: fixed; top: 0px; left: 0px; width: 100%; background-color: #000; box-shadow: 0px 0px 5px #000; }";
	style += "#PerfBar { transition:transform ease-out 0.3s; transform:translateY(-450px); -webkit-transition:-webkit-transform ease-out 0.3s; -webkit-transform:translateY(-450px); }";
	style += "#PerfToolActiveBar { display: none; }";
	style += "#PerfBar > div, { padding-right: 50px; }";
	style += "#PerfBar > div a, #PerfToolActiveBar a { display: inline-block; cursor: pointer; text-decoration: none !important; color: #fff !important; display: inline-block; padding: 5px; }";
	style += "#PerfBar > div a:hover, #PerfToolActiveBar a:hover { background-color: red !important; }";
	style += "#PerfBar .perfCloseSeparator { display: none; }";
	style += "@media (max-width: 768px) {";
		style += "#PerfBar { height: auto !important; }";
		style += "#PerfBar >div { padding: 0px; }";
		style += "#PerfBar > div a { width:	100%; }";
		style += "#PerfBar .perfSeparator { display: none; }";
		style += "#PerfBar .perfClose { display: block; width: 100% !important; text-align: left !important; position: static !important; }";
		style += "#PerfBar .perfCloseSeparator { display: block; }";
	style += "}";
	style += "#PerfBar .perfClose, #PerfToolActiveBar .perfClose { position: absolute; width: 50px; text-align: right; top: 0px; right: 0px; }";
	style += "#PerfToolTitle { font-weight: bold; }";
	style += "#PerfToolActiveBar .perfToolBackButton { font-weight: bold; }";

	cssElem.innerHTML = style;
	head.appendChild(cssElem);

	superClass.topBarContainer = document.createElement("div");
	superClass.topBarContainer.id = "PerfBar";

	/*
	superClass.topBarContainer.style.height = 30;
	var oldBodyPaddingTop = body.offsetTop * 1.0;
	body.style.paddingTop = oldBodyPaddingTop + superClass.topBarContainer.style.height;
	//*/

	body.appendChild(superClass.topBarContainer);

	// For the transition animation
	setTimeout(function(){
		superClass.topBarContainer.style.cssText += 'transform:translateY(0px); -webkit-transform:translateY(0px);';
	}, 10);

	var topBar = document.createElement("div");
	superClass.topBarContainer.appendChild(topBar);

	var scripts = [
		/*
		{
			name:	"Original",
			href:	"//stevesouders.com/mobileperf/mobileperfbkm.js"
		},
		//*/
		{
			name:	"Performance Bookmarklet",
			href:	"https://rawgit.com/scale-team/scale-perf/master/tools/performanceBookmarklet.js",
			localHref:	"/tools/performanceBookmarklet.js",
			onclick:	function() {
				addFunctionOnToolClose(function()
				{
					var waterfall = document.getElementById("perfbook-iframe");
					waterfall.parentNode.removeChild(waterfall);
				});
			}
		},
		{
			name:		"Source load waterfall",
			href:		"https://rawgit.com/scale-team/scale-perf/master/tools/waterfall.js",
			localHref:	"/tools/waterfall.js",
			onclick:	function() {
				addFunctionOnToolClose(function()
				{
					var waterfall = document.getElementById("PerfWaterfallDiv");
					waterfall.parentNode.removeChild(waterfall);
				});
			}
		},
		{
			name:		"Picture load times",
			href:		"https://rawgit.com/scale-team/scale-perf/master/tools/perfmap.js",
			localHref:	"/tools/perfmap.js",
			onclick:	function() {
				addFunctionOnToolClose(function()
				{
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
			name:	"Analyze page for tips",
			href:	"https://rawgit.com/scale-team/scale-perf/master/tools/dommonster.js",
			localHref:	"/tools/dommonster.js",
			onclick:	function() {
				addFunctionOnToolClose(function()
				{
					var r = document.getElementById("jr_results");
					r.parentNode.removeChild(r);
				});
			}
		},
		{
			name:		"FPS display",
			href:		"https://rawgit.com/scale-team/scale-perf/master/tools/stats.js",
			localHref:	"/tools/stats.js",
			onclick:	function() {
				var displayStatsInterval = setInterval(function(){
					if(typeof Stats == "function")
					{
						clearInterval(displayStatsInterval);
						
						var stats = new Stats();
						stats.domElement.style.position = "fixed";
						stats.domElement.style.left = "0px";
						stats.domElement.style.top = "0px";
						stats.domElement.style.zIndex = "10000";
						document.body.appendChild(stats.domElement);
						
						// for the transition animation
						stats.domElement.style.cssText += "transition:transform ease-out 0.3s; transform:translateY(-450px); -webkit-transition:-webkit-transform ease-out 0.3s; -webkit-transform:translateY(-450px);";
						
						setTimeout(function(){
							stats.domElement.style.cssText += 'transform:translateY(30px); -webkit-transform:translateY(30px);';
						}, 10);
						
						var interval = setInterval(function(){ stats.update(); }, 1000/60);
						
						//* SCALE perf bookmarklet extension
						addFunctionOnToolClose(function()
						{
							document.body.removeChild(stats.domElement);
							clearInterval(interval);
						});
						//*/
					}
				}, 100);
			}
		},
	];

	var maxIndex = (scripts.length - 1);
	var randomInt = (Math.round(Math.random() * Math.pow(2, 16)));

	for(var i in scripts)
	{
		var script = scripts[i];
		
		var link = document.createElement("a");
		link.data = {
			scriptIndex: i
		};
		link.innerHTML = script.name;
		link._onToolStartTrigger = script.onclick;
		link.href = 'javascript:(function(){';
			link.href += 'var jselem = document.createElement("script");';
			link.href += 'jselem.id = "PerfScript' + i + '";';
			link.href += 'jselem.type = "text/javascript";';
			
			if(isLocal && script.localHref != null)
			{
				link.href += 'console.log("tool loaded locally");';
				link.href += 'jselem.src = "' + script.localHref + '?' + randomInt + '";';
			}
			else
			{
				link.href += 'jselem.src = "' + script.href + '?' + randomInt + '";';
			}
			
			link.href += 'document.getElementsByTagName("body")[0].appendChild(jselem);';
		link.href += '})()';
		
		link.onclick = function(elem) {
			superClass.topBarContainer.style.display = "none";
			toolActiveBar.style.display = "block";
			toolBarActiveTitle.innerHTML = elem.target.innerHTML;
			
			// Add method to remove script after closing tool
			addFunctionOnToolClose(function(){
				var index = elem.target.data.scriptIndex;
				var scriptElem = document.getElementById('PerfScript' + index);
				
				scriptElem.parentNode.removeChild(scriptElem);
			});
			
			if(typeof(elem.target._onToolStartTrigger) == "function")
			{
				elem.target._onToolStartTrigger();
			}
		};
		
		topBar.appendChild(link);
		
		if(i < maxIndex)
		{
			var separatorElem = document.createElement("span");
			separatorElem.className = "perfSeparator";
			separatorElem.innerHTML = "&middot;";
			topBar.appendChild(separatorElem);
		}
	}

	var separatorElem = document.createElement("hr");
	separatorElem.className = "perfCloseSeparator";
	topBar.appendChild(separatorElem);

	// Add close button
	var close = document.createElement("a");
	close.className = "perfClose";
	close.innerHTML = "close";
	close.onclick = function() {
		//body.style.paddingTop = oldBodyPaddingTop;
		superClass.topBarContainer.style.display = "none";
	};
	topBar.appendChild(close);

	/* Tool close button */ {
		var toolActiveBar = document.createElement("div");
		toolActiveBar.id = "PerfToolActiveBar";
		body.appendChild(toolActiveBar);

		// Add back button
		var toolBarActiveBackButton = document.createElement("a");
		toolBarActiveBackButton.className = "perfToolBackButton";
		toolBarActiveBackButton.innerHTML = "< ";
		toolBarActiveBackButton.onclick = function(){
			superClass.topBarContainer.style.display = "block";
			closeToolActiveBar.click();
		};
		toolActiveBar.appendChild(toolBarActiveBackButton);
		
			// Add title bar
			var toolBarActiveTitle = document.createElement("span");
			toolBarActiveTitle.id = "PerfToolTitle";
			toolBarActiveTitle.innerHTML = "Nice tool";
			toolBarActiveBackButton.appendChild(toolBarActiveTitle);
		
		// Add close button
		var closeToolActiveBar = document.createElement("a");
		closeToolActiveBar.className = "perfClose";
		closeToolActiveBar.innerHTML = "close";
		closeToolActiveBar.onclick = function() {
			//alert(22);
			toolActiveBar.style.display = "none";
			
			executeOnCloseTool();
		};
		toolActiveBar.appendChild(closeToolActiveBar);
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
};

ScalePerformanceBarClass.prototype = {
	topBarContainer:	null,
	
	show: function() {
		this.topBarContainer.style.display = "block";
	}
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