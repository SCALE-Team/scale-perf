var isLocal = ((self.location+"").split("http://").pop().split("/")[0] == "localhost");

var body = document.getElementsByTagName("body")[0];

var style = document.createElement("style");
style.innerText = "#PerfBar, #PerfToolActiveBar { z-index: 1000000; color: #fff; position: fixed; top: 0px; left: 0px; width: 100%; background-color: #000; box-shadow: 0px 0px 5px #000; }";
style.innerText += "#PerfBar { -webkit-transition:-webkit-transform ease-out 0.3s;-webkit-transform:translateY(-450px); }";
style.innerText += "#PerfToolActiveBar { display: none; }";
style.innerText += "#PerfBar > div, { padding-right: 50px; }";
style.innerText += "#PerfBar > div a, #PerfToolActiveBar a { display: inline-block; cursor: pointer; text-decoration: none !important; color: #fff !important; display: inline-block; padding: 5px; }";
style.innerText += "#PerfBar > div a:hover, #PerfToolActiveBar a:hover { background-color: red !important; }";
style.innerText += "#PerfBar .perfCloseSeparator { display: none; }";
style.innerText += "@media (max-width: 768px) {";
	style.innerText += "#PerfBar { height: auto !important; }";
	style.innerText += "#PerfBar >div { padding: 0px; }";
	style.innerText += "#PerfBar > div a { width:	100%; }";
	style.innerText += "#PerfBar .perfSeparator { display: none; }";
	style.innerText += "#PerfBar .perfClose { display: block; width: 100% !important; text-align: left !important; position: static !important; }";
	style.innerText += "#PerfBar .perfCloseSeparator { display: block; }";
style.innerText += "}";
style.innerText += "#PerfBar .perfClose, #PerfToolActiveBar .perfClose { position: absolute; width: 50px; text-align: right; top: 0px; right: 0px; }";
style.innerText += "#PerfToolTitle { font-weight: bold; }";
style.innerText += "#PerfToolActiveBar .perfToolBackButton { font-weight: bold; }";
body.appendChild(style);

var topBarContainer = document.createElement("div");
topBarContainer.id = "PerfBar";

/*
topBarContainer.style.height = 30;
var oldBodyPaddingTop = body.offsetTop * 1.0;
body.style.paddingTop = oldBodyPaddingTop + topBarContainer.style.height;
//*/

body.appendChild(topBarContainer);

// For the transition animation
setTimeout(function(){
	topBarContainer.style.cssText += ';-webkit-transform:translateY(0px)';
}, 10);

var topBar = document.createElement("div");
topBarContainer.appendChild(topBar);

var scripts = [
	/*
	{
		name:	"Original",
		href:	"//stevesouders.com/mobileperf/mobileperfbkm.js"
	},
	//*/
	{
		name:	"Performance Bookmarklet",
		href:	"https://micmro.github.io/performance-bookmarklet/dist/performanceBookmarklet.min.js"
	},
	{
		name:		"Source load waterfall",
		href:		"https://andydavies.github.io/waterfall/bookmarklet/waterfall.js",
		localHref:	"/tools/waterfall.js",
		onclick:	function() {
			perfBookmarkletAddToolCloseFunction(function()
			{
				var waterfall = document.getElementById("PerfWaterfallDiv");
				waterfall.parentNode.removeChild(waterfall);
			});
		}
	},
	{
		name:	"Picture load times",
		href:	"https://zeman.github.io/perfmap/perfmap.js"
	},
	{
		name:	"Analyze page for tips",
		href:	"https://mir.aculo.us/dom-monster/dommonster.js",
		localHref:	"/tools/dommonster.js",
		onclick:	function() {
			perfBookmarkletAddToolCloseFunction(function()
			{
				var r = document.getElementById("jr_results_tips");
				r.parentNode.removeChild(r);
			});
		}
	},
	{
		name:		"FPS display",
		href:		"https://rawgit.com/mrdoob/stats.js/master/build/stats.min.js",
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
					stats.domElement.style.cssText += "-webkit-transition:-webkit-transform ease-out 0.3s;-webkit-transform:translateY(-450px);";
					
					setTimeout(function(){
						stats.domElement.style.cssText += ';-webkit-transform:translateY(30px)';
					}, 10);
					
					var interval = setInterval(function(){ stats.update(); }, 1000/60);
					
					//* SCALE perf bookmarklet extension
					perfBookmarkletAddToolCloseFunction(function()
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
	//link.data.scriptIndex = i;
	link.innerText = script.name;
	link._onToolStartTrigger = script.onclick;
	link.href = 'javascript:(function(){';
		link.href += 'var jselem = document.createElement("script");';
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
		
		link.href += 'body.appendChild(jselem);';
	link.href += '})()';
	
	link.onclick = function(elem) {
		topBarContainer.style.display = "none";
		toolActiveBar.style.display = "block";
		toolBarActiveTitle.innerText = elem.target.innerText;
		
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
close.innerText = "close";
close.onclick = function() {
	//body.style.paddingTop = oldBodyPaddingTop;
	topBarContainer.style.display = "none";
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
		topBarContainer.style.display = "block";
		closeToolActiveBar.click();
	};
	toolActiveBar.appendChild(toolBarActiveBackButton);
	
		// Add title bar
		var toolBarActiveTitle = document.createElement("span");
		toolBarActiveTitle.id = "PerfToolTitle";
		toolBarActiveTitle.innerText = "Nice tool";
		toolBarActiveBackButton.appendChild(toolBarActiveTitle);
	
	// Add close button
	var closeToolActiveBar = document.createElement("a");
	closeToolActiveBar.className = "perfClose";
	closeToolActiveBar.innerText = "close";
	closeToolActiveBar.onclick = function() {
		toolActiveBar.style.display = "none";
		
		perfExecuteOnCloseTool();
	};
	toolActiveBar.appendChild(closeToolActiveBar);
}

var _perfOnCloseTool = [];
function perfBookmarkletAddToolCloseFunction(func) {
	_perfOnCloseTool.push(func);
}

function perfExecuteOnCloseTool(func) {
	while(_perfOnCloseTool.length > 0)
	{
		var func = _perfOnCloseTool.pop();
		func();
	}
}