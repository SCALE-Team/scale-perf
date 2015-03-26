var body = document.getElementsByTagName("body")[0];

var topBar = document.createElement("div");
topBar.style.color = "#fff";
topBar.style.position = "absolute";
topBar.style.top = 0;
topBar.style.left = 0;
topBar.style.width = "100%";
topBar.style.backgroundColor = "#000";
topBar.style.boxShadow = "0 0 5px #000";
body.appendChild(topBar);

var scripts = [
	{
		name:	"Original",
		href:	"//stevesouders.com/mobileperf/mobileperfbkm.js"
	},
	{
		name:	"Performance Bookmarklet",
		href:	"https://micmro.github.io/performance-bookmarklet/dist/performanceBookmarklet.min.js"
	},
	{
		name:	"Waterfall",
		href:	"https://andydavies.github.io/waterfall/bookmarklet/waterfall.js"
	},
	{
		name:	"Perf Map",
		href:	"https://zeman.github.io/perfmap/perfmap.js"
	},
	{
		name:	"DOM Monster",
		href:	"http://mir.aculo.us/dom-monster/dommonster.js?" + Math.floor((+new Date)/(864e5))
	},
	{
		name:	"Display Stats",
		href:	"//rawgit.com/mrdoob/stats.js/master/build/stats.min.js",
		onclick:	function(){
			var displayStatsInterval = setInterval(function(){
				console.log("hii :)");
				if(typeof Stats == "function")
				{
					clearInterval(displayStatsInterval);
					
					var stats = new Stats();
					stats.domElement.style.position = "fixed";
					stats.domElement.style.left = "0px";
					stats.domElement.style.top = "0px";
					stats.domElement.style.zIndex = "10000";
					document.body.appendChild(stats.domElement);
					
					setInterval(function(){ stats.update(); }, 1000/60);
				}
			}, 100);
		}
	},
];

for(var f in scripts)
{
	var script = scripts[f];
	
	var link = document.createElement("a");
	link.innerText = script.name;
		link.href = 'javascript:(function(){';
			link.href += 'var jselem = document.createElement("script");';
			link.href += 'jselem.type = "text/javascript";';
			link.href += 'jselem.src = "' + script.href + '";';
			link.href += 'body.appendChild(jselem);';
		link.href += '})()';
	link.style.display = "inline-block";
	link.style.padding = 5;
	link.style.color = "#fff";
	
	if(typeof(script.onclick) != null)
	{
		link.onclick = script.onclick;
	}
	
	topBar.appendChild(link);
}