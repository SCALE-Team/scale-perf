function Waterfall(conf) {
	// Check for Navigation Timing and Resource Timing APIs
	if(window.performance == null || (window.performance.getEntriesByType == null && window.performance.webkitGetEntriesByType == null))
	{
		alert("Resource Timing API not supported");
		return;
	}
	
	conf = conf||{};
	
	// Remember configs
	this.getPageLoadTime = conf.getPageLoadTime;
	
	// look for erros
	if(typeof(this.getPageLoadTime) != "function")
	{
		alert("Waterfall.js: config.getPageLoadTime must be set in constructor!");
		return;
	}
	
	// do preparations
	this.convertBarColorsToMap();
	
	// add all CSS styles
	this.addStyles();
	
	// get timings
	var timings = this.getTimings();
	
	// display all
	this.drawWaterfall(timings);
};

Waterfall.prototype = {
	chartContainer:		null,
	toolContainer:		null,
	
	/* SCALE performance tool IO functions */
		containerId: 			"PerfWaterfallDiv",
		shouldMovePageContent:	true,
		onclose: function() {
			var waterfall = document.getElementById(this.containerId);
			if(waterfall != null) waterfall.parentNode.removeChild(waterfall);
			
			this.cssElem.parentNode.removeChild(this.cssElem);
		},
	
	barColors: [
		{
			text:	"blocked",
			color:	"rgb(204, 204, 204)",
			showInLegend:	false
		},
		{
			text:	"thirdParty",
			isDark:	true,
			color:	"rgb(  0,   0,   0)",
			showInLegend:	false
		},
		{
			text:	"redirect",
			color:	"rgb(255, 221,   0)",
			showInLegend:	false
		},
		{
			text:	"appCache",
			isDark:	true,
			color:	"rgb(161, 103,  38)",
			showInLegend:	false
		},
		{
			text:	"dns",
			isDark:	true,
			color:	"rgb( 48, 150, 158)",
			showInLegend:	false
		},
		{
			text:	"tcp",
			color:	"rgb(255, 157,  66)",
			showInLegend:	false
		},
		{
			text:	"ssl",
			isDark:	true,
			color:	"rgb(213, 102, 223)",
			showInLegend:	false
		},
		{
			text:	"request",
			color:	"rgb( 64, 255,  64)",
			showInLegend:	false
		},
		{
			text:	"response",
			isDark:	true,
			color:	"rgb( 52, 150, 255)",
			showInLegend:	false
		}
	],
	
	barColorsMap: {},
	
	convertBarColorsToMap: function() {
		for(var f in this.barColors)
		{
			var barColor = this.barColors[f];
			
			this.barColorsMap[barColor.text] = barColor;
		}
	},
	
	buildLegend: function() {
		var id = "WaterfallLegend";
		
		var existingLegend = document.getElementById(id);
		if(existingLegend != null) existingLegend.parentNode.removeChild(existingLegend);
		
		var legend = document.createElement("div");
		legend.id = id;
		this.toolContainer.appendChild(legend);
		
		for(var f in this.barColors)
		{
			var barColor = this.barColors[f];
			
			if(!barColor.showInLegend) continue;
			
			var captionElem = document.createElement("div");
			captionElem.innerHTML = barColor.text;
			captionElem.style.background = barColor.color;
			legend.appendChild(captionElem);
			
			if(barColor.isDark) captionElem.className = "dark";
		}
	},
	
	addStyles: function() {
		var head = document.head || document.getElementsByTagName('head')[0];

		this.cssElem = document.createElement("style");
		this.cssElem.id = "ScaleWaterfallStyle";
		var style = "#" + this.containerId + " { background: #fff; border-bottom: 2px solid #000; margin: 5px; position: absolute; visibility: hidden; left: 0px; z-index: 99999; margin: 0px; padding: 5px 0px 10px 0px; }";
		style += "#" + this.containerId + " input, #" + this.containerId + " button { outline: none; border-radius: 5px; padding: 5px; border: 1px solid #ccc; }";
		style += "#" + this.containerId + " button { background-color: #ddd; padding: 5px 10px; }";
		style += "#" + this.containerId + " .timeSpanInput { width: 70px; }";
		
		style += "#" + this.containerId + " .filterContainer { height: 40px; position: relative; }";
		
		style += "#" + this.containerId + " .filterContainer > div:first-child { position: absolute; left: 0px; top: 0px; right: 200px; padding:5px; }";
		style += "#" + this.containerId + " .filterContainer > div:last-child { position: absolute; right: 0px; width: 450px; top: 0px; text-align: right; padding:5px; }";
		
		style += "#" + this.containerId + " .filterContainer > div:last-child > :first-child { display: inline-block; }";
		style += "#" + this.containerId + " .filterContainer > div:last-child > :first-child input { width: 100%; }";
		
		style += "@media (max-width: 768px) {";
			style += "#" + this.containerId + " .filterContainer { height: auto; }";
			style += "#" + this.containerId + " .filterContainer > div { position: relative !important; width:100% !important; top: 0px !important; right: 0px !important; left: 0px !important; display: block !important; text-align: left !important; }";
			style += "#" + this.containerId + " .filterContainer > div:last-child > :first-child { position: absolute; left: 0px; top: 0px; right: 240px; }";
			style += "#" + this.containerId + " .filterContainer > div:last-child > :last-child { position: absolute; right: 0px; top: 0px; width: 240px; text-align: right; }";
		style += "}";
		
		style += "#" + this.containerId + " #ChartContainer { position: relative; }";
		style += "#" + this.containerId + " .chart_svg { position: absolute; top: 0px; left: 200px; right: 5px; }";
		
		//style += "#" + this.containerId + " .svg_labels { z-index: 10; position: absolute; top: 0px; left: 0px; overflow: visible; }";
		//style += "#" + this.containerId + " .svg_labels text { background:red; }";
		
		style += "#" + this.containerId + " .button-group { display: inline-block; }";
		style += "#" + this.containerId + " .button-group button { border-radius: 0px 0px 0px 0px; border-right: none; cursor: pointer; }";
		style += "#" + this.containerId + " .button-group button:hover { background-color: #eee; }";
		style += "#" + this.containerId + " .button-group button:active { background-color: #ccc; }";
		style += "#" + this.containerId + " .button-group button[disabled] { background-color: #ccc !important; cursor: default; }";
		style += "#" + this.containerId + " .button-group :first-child { border-radius: 5px 0px 0px 5px; }";
		style += "#" + this.containerId + " .button-group :last-child { border-radius: 0px 5px 5px 0px; border-right: 1px solid #ccc; }";
		
		style += "#" + this.containerId + " #WaterfallLegend > div { display: inline-block; padding: 3px; border-radius: 3px; margin: 10px 3px 0px; }";
		style += "#" + this.containerId + " #WaterfallLegend > div.dark { color: #fff; }";

		this.cssElem.innerHTML = style;
		head.appendChild(this.cssElem);
	},
	
	/**
	 * Draw waterfall
	 * @param {object[]} entries
	 */
	drawWaterfall: function(entries) {
		var superClass = this;
		
		superClass.toolContainer = document.getElementById(superClass.containerId);
		
		// If container doesn't exist yet, create it
		if (superClass.toolContainer === null) {
			superClass.toolContainer = document.createElement('div');
			superClass.toolContainer.id = superClass.containerId;
		}
		
		document.body.appendChild(superClass.toolContainer);
		
		/* Filters */ {
			var filterContainer = document.createElement("div");
			filterContainer.className = "filterContainer";
			filterContainer.style.padding = "5px";
			superClass.toolContainer.appendChild(filterContainer);
			
			var leftContainer = document.createElement("div");
			filterContainer.appendChild(leftContainer);
			
			var rightContainer = document.createElement("div");
			filterContainer.appendChild(rightContainer);
			
			var span = document.createElement("span");
			span.innerHTML = "Show from ";
			
			var timeSpanFromInput = document.createElement("input");
			timeSpanFromInput.className = "timeSpanInput";
			timeSpanFromInput.id = "timeSpanFromInput";
			timeSpanFromInput.type = "number";
			span.appendChild(timeSpanFromInput);
			
			span.innerHTML += " ms until ";
			
			var timeSpanUntilInput = document.createElement("input");
			timeSpanUntilInput.className = "timeSpanInput";
			timeSpanUntilInput.id = "timeSpanUntilInput";
			timeSpanUntilInput.type = "number";
			timeSpanUntilInput.timeout = null;
			span.appendChild(timeSpanUntilInput);
			
			span.innerHTML += " ms";
			
			leftContainer.appendChild(span);
			
			// Has to be appended with small delay. Element has to exist on screen
			window.setTimeout(function(){
				var timeSpanUntilInput = document.getElementById("timeSpanUntilInput");
				timeSpanUntilInput.value = superClass.getPageLoadTime(entries);
				
				var timeSpanFromInput = document.getElementById("timeSpanFromInput");
				timeSpanFromInput.value = 0;
				
				var change = function(e, isFrom){
					if(isFrom)
					{
						superClass.chartContainer.data.timeSpanFrom = e.target.value.trim() * 1.0;
					}
					else
					{
						superClass.chartContainer.data.timeSpanUntil = e.target.value.trim() * 1.0;
					}
					
					if(e.target.timeout != null)
					{
						window.clearTimeout(e.target.timeout);
					}
					
					var isEnter = (e.keyCode == 13);
					
					if(isEnter)
					{
						superClass.drawAllBars(entries);
					}
					else
					{
						e.target.timeout = window.setTimeout(function(){
							superClass.drawAllBars(entries);
						}, 50);
					}
				};
				
				timeSpanFromInput.addEventListener("change", function(e){change(e, true)}, true);
				timeSpanFromInput.addEventListener("keyup", function(e){change(e, true)}, true);
				timeSpanUntilInput.addEventListener("change", function(e){change(e, false)}, true);
				timeSpanUntilInput.addEventListener("keyup", function(e){change(e, false)}, true);
			}, 500);
			
			var searchFieldContainer = document.createElement("div");
			var searchField = document.createElement("input");
			searchField.id = "PerfSearchField";
			searchField.placeholder = "Search for...";
			searchField.timeout = null;
			//searchFieldContainer.innerHTML+='<input onkeydown=\'alert("123")\' />';
			searchFieldContainer.appendChild(searchField);
			rightContainer.appendChild(searchFieldContainer);
			
			// Has to be appended with small delay. Element has to exist on screen
			window.setTimeout(function(){
				var searchField = document.getElementById("PerfSearchField");
				
				searchField.addEventListener("keyup", function(e){
					superClass.chartContainer.data.searchText = e.target.value.trim().toLowerCase();
					
					if(e.target.timeout != null)
					{
						window.clearTimeout(e.target.timeout);
					}
					
					var isEnter = (e.keyCode == 13);
					
					if(isEnter)
					{
						superClass.drawAllBars(entries);
					}
					else
					{
						e.target.timeout = window.setTimeout(function(){
							superClass.drawAllBars(entries);
						}, 50);
					}
				},true);
			}, 500);
			
			rightContainer.innerHTML += "&nbsp;";
			
			/* Button Group */ {
				var filterByType = function(elem) {
					var btn = elem.target;
					
					var childs = btn.parentNode.children;
					for(var i=0; i<childs.length; i++)
					{
						childs[i].disabled = false;
					}
					
					btn.disabled = true;
					
					
					superClass.chartContainer.data.allowed = (btn.data!=null ? btn.data.allowed : null);
					superClass.chartContainer.data.notAllowed = (btn.data!=null ? btn.data.notAllowed : null);
					
					superClass.drawAllBars(entries);
				};
				
				var buttonGroup = document.createElement("div");
				buttonGroup.className = "button-group";
				
				var allBtn = document.createElement("button");
				allBtn.innerHTML = "All";
				allBtn.disabled = true;
				allBtn.onclick = filterByType;
				buttonGroup.appendChild(allBtn);
				
				var jsBtn = document.createElement("button");
				jsBtn.innerHTML = "JS";
				jsBtn.data = { allowed: [ "js" ] };
				jsBtn.onclick = filterByType;
				buttonGroup.appendChild(jsBtn);
				
				var cssBtn = document.createElement("button");
				cssBtn.innerHTML = "CSS";
				cssBtn.data = { allowed: [ "css" ] };
				cssBtn.onclick = filterByType;
				buttonGroup.appendChild(cssBtn);
				
				var imgBtn = document.createElement("button");
				imgBtn.innerHTML = "Images";
				imgBtn.data = { allowed: [ "png", "jpg", "jpeg", "gif", "bmp", "svg", "tif" ] };
				imgBtn.onclick = filterByType;
				buttonGroup.appendChild(imgBtn);
				
				var elseBtn = document.createElement("button");
				elseBtn.innerHTML = "Else";
				elseBtn.data = { notAllowed: jsBtn.data.allowed.concat(cssBtn.data.allowed).concat(imgBtn.data.allowed) };
				elseBtn.onclick = filterByType;
				buttonGroup.appendChild(elseBtn);
				
				rightContainer.appendChild(buttonGroup);
			}
		}
		
		superClass.chartContainer = document.createElement("div");
		superClass.chartContainer.id = "ChartContainer";
		superClass.chartContainer.data = {
			allowed:		[],
			nowAllowed:		[],
			searchText:		"",
			timeSpan:		superClass.getPageLoadTime(entries)
		};
		superClass.toolContainer.appendChild(superClass.chartContainer);
		
		superClass.drawAllBars(entries);
	},
	
	// Function to draw all the waterfall bars
	drawAllBars: function(entries) {
		// Height of the bars
		var rowHeight = 20;
		
		// space between the bars
		var rowPadding = 2;
		
		// The width of the labels
		var barOffset = 200;
		
		var entriesToShow = this.filterEntries(entries);
		
		var maxTime = 0;
		for(var n = 0; n < entriesToShow.length; n++) {
			maxTime = Math.max(maxTime, entriesToShow[n].start + entriesToShow[n].duration);
		}
		
		//calculate size of chart
		// - max time
		// - number of entries
		var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		var height = (entriesToShow.length + 1) * (rowHeight + rowPadding); // +1 for axis
		
		this.toolContainer.style.width = "100%";
		
		this.chartContainer.style.width = "100%";
		this.chartContainer.style.height = height;
		
		var svgLabels = this.svg.createSVG(barOffset, height);
		var svgChart = this.svg.createSVG("100%", height);
		
		// draw axis
			// %-space between the seconds on the x-axis
			var interval = 100000 / maxTime; // original: 1 / (maxTime / 1000) * 100
			
			// number of seconds-lines to be shown
			var numberOfLines = Math.ceil(maxTime / 1000);
			
			// coordinates for the seconds-lines
			var x1_percentage = 0,
				y1 = rowHeight + rowPadding,
				y2 = height;

			for(var n = 0; n < numberOfLines; n++) {
				// If first number move a little bit to right to let teh first number not be hidden
				var textX1 = (n==0 ? x1_percentage + 3 : x1_percentage + "%");
				
				svgChart.appendChild(this.svg.createSVGText(textX1, 0, 0, rowHeight, "font: 10px sans-serif;", "middle", n));
				svgChart.appendChild(this.svg.createSVGLine(x1_percentage + "%", y1, x1_percentage + "%", y2, "stroke: #ccc;"));
				x1_percentage += interval;
			} 

		// draw resource entries
		for(var n = 0; n < entriesToShow.length; n++) {
			var entry = entriesToShow[n]; 
			
			var dy = 13;
			
			/* Label of the row */ {
				var rowLabel = this.svg.createSVGGroup("translate(0," + (n + 1) * (rowHeight + rowPadding) + ")");
				rowLabel.appendChild(this.svg.createSVGText(5, 0, 0, dy, "font: 10px sans-serif;", "start", this.shortenURL(entry.url), entry.url));
				svgLabels.appendChild(rowLabel);
			}

			/* The chart */ {
				var rowChart = this.svg.createSVGGroup("translate(0," + (n + 1) * (rowHeight + rowPadding) + ")");
				rowChart.appendChild(this.drawBar(entry, 0, rowHeight, maxTime));
				svgChart.appendChild(rowChart);
			}
			
			/* The chart */ {
				var latestTime = (entry.start + entry.duration);
				
				// Check if the distance to the right border is big enough to fit the text
				var distToRightBorder = (maxTime - latestTime) / maxTime * 260;	// 260px is the width of the chart on mobile device
				if(distToRightBorder > 30)
				{
					var dx = "5px";
					var anchor = "start";
				}
				else
				{
					var dx = "-5px";
					var anchor = "end";
				}
				console.log(distToRightBorder);
				
				var positionX = this.toPercentage(latestTime, maxTime);
				
				rowChart.appendChild(this.svg.createSVGText(positionX, 0, dx, dy, "font: 10px sans-serif;", anchor, Math.round(entry.duration) + "ms", ""));
			}
			
		}
		
		var div = document.createElement("div");
		div.className = "chart_svg";
		div.appendChild(svgChart);
		
		this.chartContainer.appendChild(svgLabels);
		this.chartContainer.appendChild(div);
		
		this.buildLegend();
	},
	
	// Calculates the percentage relation of part to max
	toPercentage: function(part, max) {
		var p = Math.round(part / max * 10000) / 100.0;
		
		return p + "%";
	},
	
	/**
	 * Draw bar for resource 
	 * @param {object} entry Details of URL, and timings for individual resource
	 * @param {int} barOffset Offset of the start of the bar along  x axis
	 * @param {int} rowHeight 
	 * @param {double} the latest point of time of all bars
	 */
	drawBar: function(entry, barOffset, rowHeight, maxTime) {
		//var bar = this.svg.createSVGGroup("translate(" + barOffset + ", 0)");
		var bar = this.svg.createSVGGroup();
		
		//function createSVGRect(x, y, width, height, style)
		bar.appendChild(this.svg.createSVGRect(this.toPercentage(entry.start, maxTime), 0, this.toPercentage(entry.duration, maxTime), rowHeight, "fill:" + this.barColorsMap.blocked.color));
		this.barColorsMap.blocked.showInLegend = true;
		
		//bar.appendChild(this.svg.createSVGRect("10%", 10, "40%", rowHeight, "fill:" + this.barColorsMap.blocked.color));
		
		if(entry.redirectDuration > 0) {
			bar.appendChild(this.svg.createSVGRect(this.toPercentage(entry.redirectStart, maxTime), 0, this.toPercentage(entry.redirectDuration, maxTime), rowHeight, "fill:" + this.barColorsMap.redirect.color));
			this.barColorsMap.redirect.showInLegend = true;
		}

		if(entry.appCacheDuration > 0) {
			bar.appendChild(this.svg.createSVGRect(this.toPercentage(entry.appCacheStart, maxTime), 0, this.toPercentage(entry.appCacheDuration, maxTime) , rowHeight, "fill:" + this.barColorsMap.appCache.color));
			this.barColorsMap.appCache.showInLegend = true;
		}

		if(entry.dnsDuration > 0) {
			bar.appendChild(this.svg.createSVGRect(this.toPercentage(entry.dnsStart, maxTime) , 0, this.toPercentage(entry.dnsDuration, maxTime), rowHeight, "fill:" + this.barColorsMap.dns.color));
			this.barColorsMap.dns.showInLegend = true;
		}

		if(entry.tcpDuration > 0) {
			bar.appendChild(this.svg.createSVGRect(this.toPercentage(entry.tcpStart, maxTime) , 0, this.toPercentage(entry.tcpDuration, maxTime), rowHeight, "fill:" + this.barColorsMap.tcp.color));
			this.barColorsMap.tcp.showInLegend = true;
		}

		if(entry.sslDuration > 0) {
			bar.appendChild(this.svg.createSVGRect(this.toPercentage(entry.sslStart, maxTime) , 0, this.toPercentage(entry.sslDuration, maxTime), rowHeight, "fill:" + this.barColorsMap.ssl.color));
			this.barColorsMap.ssl.showInLegend = true;
		}

		if(entry.requestDuration > 0) {
			bar.appendChild(this.svg.createSVGRect(this.toPercentage(entry.requestStart, maxTime) , 0, this.toPercentage(entry.requestDuration, maxTime), rowHeight, "fill:" + this.barColorsMap.request.color));
			this.barColorsMap.request.showInLegend = true;
		}

		if(entry.responseDuration > 0) {
			bar.appendChild(this.svg.createSVGRect(this.toPercentage(entry.responseStart, maxTime) , 0, this.toPercentage(entry.responseDuration, maxTime), rowHeight, "fill:" + this.barColorsMap.response.color));
			this.barColorsMap.response.showInLegend = true;
		}

		return bar;
	},
	
	filterEntries: function(entries) {
		//this.chartContainer = document.getElementById("ChartContainer");
		this.chartContainer.innerHTML = "";
		
		var allowed = this.chartContainer.data.allowed;
		var notAllowed = this.chartContainer.data.notAllowed;
		var searchText = this.chartContainer.data.searchText;
		var timeSpanUntil = this.chartContainer.data.timeSpanUntil;
		var timeSpanFrom = this.chartContainer.data.timeSpanFrom;
		
		// Filter entries
		var filteredEntries = [];
		for(var f in entries)
		{
			var url = entries[f].url.toLowerCase().split("?")[0].toLowerCase();
			var file = url.split("/").pop();
			var ending = file.split(".").pop();
			var startTime = entries[f].start;
			
			if(allowed != null && allowed.length > 0 && allowed.indexOf(ending) == -1) continue;
			if(notAllowed != null && notAllowed.length > 0 && notAllowed.indexOf(ending) != -1) continue;
			if(timeSpanUntil > 0 && startTime > timeSpanUntil) continue;
			if(timeSpanFrom > 0 && startTime < timeSpanFrom) continue;
			if(searchText.length > 0 && url.indexOf(searchText) == -1) continue;
			/*
			else
			{
				entries[f].url = url.replace(searchText, "<b>" + searchText + "</b>");
				console.log(url);
			}
			//*/
			
			filteredEntries.push(entries[f]);
		}
		
		return filteredEntries;
	},
	
	/**
	 * Creates array of timing entries from Navigation and Resource Timing Interfaces
	 * @returns {object[]}
	 */
	getTimings: function() {

		var entries = [];
	
		// Page times come from Navigation Timing API
		entries.push(this.createEntryFromNavigationTiming());

		// Other entries come from Resource Timing API
		var resources = [];
		
		if(window.performance.getEntriesByType !== undefined) {
			resources = window.performance.getEntriesByType("resource");
		}
		else if(window.performance.webkitGetEntriesByType !== undefined) {
			resources = window.performance.webkitGetEntriesByType("resource");
		}
		
		/* SCALE bookmarklet extension */ {
			resources = scalePerformanceBar.helpers.removeOwnSourcesFromResources(resources);
		}
		
		for(var n = 0; n < resources.length; n++) {
			entries.push(this.createEntryFromResourceTiming(resources[n]));
		}

		return entries;
	},

	/**
	 * Creates an entry from a PerformanceResourceTiming object 
	 * @param {object} resource
	 * @returns {object}
	 */
	createEntryFromNavigationTiming: function() {
		var timing = window.performance.timing;
		
		return {
			url:				document.URL,
			start:				0,
			duration:			timing.responseEnd - timing.navigationStart,
			redirectStart:		timing.redirectStart === 0 ? 0 : timing.redirectStart - timing.navigationStart,
			redirectDuration:	timing.redirectEnd - timing.redirectStart,
			appCacheStart:		0,													// TODO
			appCacheDuration:	0,													// TODO
			dnsStart:			timing.domainLookupStart - timing.navigationStart,
			dnsDuration:		timing.domainLookupEnd - timing.domainLookupStart,
			tcpStart:			timing.connectStart - timing.navigationStart,
			tcpDuration:		timing.connectEnd - timing.connectStart,			// TODO
			sslStart:			0,													// TODO
			sslDuration:		0,													// TODO
			requestStart:		timing.requestStart - timing.navigationStart,
			requestDuration:	timing.responseStart - timing.requestStart,
			responseStart:		timing.responseStart - timing.navigationStart,
			responseDuration:	timing.responseEnd - timing.responseStart
		}
	},

	/**
	 * Creates an entry from a PerformanceResourceTiming object 
	 * @param {object} resource
	 * @returns {object}
	 */
	createEntryFromResourceTiming: function(resource) {
		// NB
		// AppCache: start = fetchStart, end = domainLookupStart, connectStart or requestStart
		// TCP: start = connectStart, end = secureConnectionStart or connectEnd
		// SSL: secureConnectionStart can be undefined
		return {
			url:				resource.name,
			start:				resource.startTime,
			duration:			resource.duration,
			redirectStart:		resource.redirectStart,
			redirectDuration:	resource.redirectEnd - resource.redirectStart,
			appCacheStart:		0,														// TODO
			appCacheDuration:	0,														// TODO
			dnsStart:			resource.domainLookupStart,
			dnsDuration:		resource.domainLookupEnd - resource.domainLookupStart,
			tcpStart:			resource.connectStart,
			tcpDuration:		resource.connectEnd - resource.connectStart,		 	// TODO
			sslStart:			0,														// TODO
			sslDuration:		0,														// TODO
			requestStart:		resource.requestStart,
			requestDuration:	resource.responseStart - resource.requestStart,
			responseStart:		resource.responseStart,
			// ??? - Chromium returns zero for responseEnd for 3rd party URLs, bug?
			responseDuration:	resource.responseStart == 0 ? 0 : resource.responseEnd - resource.responseStart
		}
	},
	
	/**
	 * Shorten URLs over 40 characters
	 * @param {string} url URL to be shortened
	 * @returns {string} Truncated URL
	 */
	shortenURL: function(url) {
		// Strip off any query string and fragment
		var strippedURL = url.match("[^?#]*")

		var shorterURL = strippedURL[0];
		if(shorterURL.length > 40) {
			shorterURL = shorterURL.slice(0, 25) + " ... " + shorterURL.slice(-10);
		}

		return shorterURL;
	},
	
	svg: {
		xmlns: "http://www.w3.org/2000/svg",
		
		/**
		 * Create SVG element
		 * @param {int} width
		 * @param {int} height
		 * @returns {element} SVG element
		 */
		createSVG: function(width, height) {
			var el = document.createElementNS(this.xmlns, "svg");
	 
			el.setAttribute("width", width);
			el.setAttribute("height", height);
		
			return el;
		},

		/**
		 * Create SVG Group element
		 * @param {string} transform SVG tranformation to apply to group element
		 * @returns {element} SVG Group element
		 */
		createSVGGroup: function(transform) {		
			var el = document.createElementNS(this.xmlns, "g");
			
			if(transform != null)
			{
				el.setAttribute("transform", transform);
			}
		
			return el;
		},

		/**
		 * Create SVG Rect element
		 * @param {int} x
		 * @param {int} y
		 * @param {int} width
		 * @param {int} height
		 * @param {string} style
		 * @returns {element} SVG Rect element
		 */
		createSVGRect: function(x, y, width, height, style) {
			var el = document.createElementNS(this.xmlns, "rect");
	 
			el.setAttribute("x", x);
			el.setAttribute("y", y);
			el.setAttribute("width", width);
			el.setAttribute("height", height);
			el.setAttribute("style", style);

			return el;
		},

		/**
		 * Create SVG Rect element
		 * @param {int} x1
		 * @param {int} y1
		 * @param {int} x2
		 * @param {int} y2
		 * @param {string} style
		 * @returns {element} SVG Line element
		 */
		createSVGLine: function(x1, y1, x2, y2, style) {
			var el = document.createElementNS(this.xmlns, "line");

			el.setAttribute("x1", x1);
			el.setAttribute("y1", y1);
			el.setAttribute("x2", x2);
			el.setAttribute("y2", y2);
			el.setAttribute("style", style);

			return el;
		},

		/**
		 * Create SVG Text element
		 * @param {int} x
		 * @param {int} y
		 * @param {int} dx
		 * @param {int} dy
		 * @param {string} style
		 * @param {string} anchor
		 * @param {string} text
		 * @returns {element} SVG Text element
		 */
		createSVGText: function(x, y, dx, dy, style, anchor, text, title) {
			var el = document.createElementNS(this.xmlns, "text");

			el.setAttribute("x", x);
			el.setAttribute("y", y);
			el.setAttribute("dx", dx);
			el.setAttribute("dy", dy);
			el.setAttribute("style", style);
			el.setAttribute("text-anchor", anchor);
			if(title != null) el.setAttribute("title", title);

			el.appendChild(document.createTextNode(text));

			return el;
		}
	}
};