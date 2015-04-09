(function() {
	function Waterfall(conf) {
		// Check for Navigation Timing and Resource Timing APIs
		if(window.performance == null || (window.performance.getEntriesByType == null && window.performance.webkitGetEntriesByType == null))
		{
			alert("Resource Timing API not supported");
			return;
		}
		
		conf = conf||{};
		
		// Remmeber configs
		this.getPageLoadTime = conf.getPageLoadTime;
		
		// look for erros
		if(typeof(this.getPageLoadTime) != "function")
		{
			alert("Waterfall.js: config.getPageLoadTime must be set in constructor!");
			return;
		}
		
		// add all CSS styles
		this.addStyles();
		
		// get timings
		var timings = this.getTimings();
		
		// display all
		this.drawWaterfall(timings);
	};

	Waterfall.prototype = {
		toolContainerId:	"PerfWaterfallDiv",
		chartContainer:		null,
		toolContainer:		null,
		
		barColors: {
			blocked:	"rgb(204, 204, 204)",
			thirdParty:	"rgb(  0,   0,   0)",
			redirect:	"rgb(255, 221,   0)",
			appCache:	"rgb(161, 103,  38)",
			dns:		"rgb( 48, 150, 158)",
			tcp:		"rgb(255, 157,  66)",
			ssl:		"rgb(213, 102, 223)",
			request:	"rgb( 64, 255,  64)",
			response:	"rgb( 52, 150, 255)"
		},
		
		addStyles: function() {
			var head = document.head || document.getElementsByTagName('head')[0];

			var cssElem = document.createElement("style");
			cssElem.id = "PerfBookmarkletStyle";
			var style = "#" + this.toolContainerId + " { background: #fff; border-bottom: 2px solid #000; margin: 5px; position: absolute; top: 0px; left: 0px; z-index: 99999; margin: 0px; padding: 5px 0px 10px 0px; }";
			style += "#" + this.toolContainerId + " input, #" + this.toolContainerId + " button { outline: none; border-radius: 5px; padding: 5px; border: 1px solid #ccc; }";
			style += "#" + this.toolContainerId + " button { background-color: #ddd; padding: 5px 10px; }";
			style += "#" + this.toolContainerId + " #TimeSpanInput { width: 70px; }";
			
			style += "#" + this.toolContainerId + " .filterContainer { height: 40px; position: relative; }";
			
			style += "#" + this.toolContainerId + " .filterContainer > div:first-child { position: absolute; left: 0px; top: 0px; right: 200px; padding:5px; }";
			style += "#" + this.toolContainerId + " .filterContainer > div:last-child { position: absolute; right: 0px; width: 450px; top: 0px; text-align: right; padding:5px; }";
			
			style += "#" + this.toolContainerId + " .filterContainer > div:last-child > :first-child { display: inline-block; }";
			style += "#" + this.toolContainerId + " .filterContainer > div:last-child > :first-child input { width: 100%; }";
			
			style += "@media (max-width: 768px) {";
				style += "#" + this.toolContainerId + " .filterContainer { height: auto; }";
				style += "#" + this.toolContainerId + " .filterContainer > div { position: relative !important; width:100% !important; top: 0px !important; right: 0px !important; left: 0px !important; display: block !important; text-align: left !important; }";
				style += "#" + this.toolContainerId + " .filterContainer > div:last-child > :first-child { position: absolute; left: 0px; top: 0px; right: 240px; }";
				style += "#" + this.toolContainerId + " .filterContainer > div:last-child > :last-child { position: absolute; right: 0px; top: 0px; width: 240px; text-align: right; }";
			style += "}";
			
			style += "#" + this.toolContainerId + " .button-group { display: inline-block; }";
			style += "#" + this.toolContainerId + " .button-group button { border-radius: 0px 0px 0px 0px; border-right: none; }";
			style += "#" + this.toolContainerId + " .button-group button:hover { background-color: #eee; }";
			style += "#" + this.toolContainerId + " .button-group button:active { background-color: #ccc; }";
			style += "#" + this.toolContainerId + " .button-group button[disabled] { background-color: #ccc !important; }";
			style += "#" + this.toolContainerId + " .button-group :first-child { border-radius: 5px 0px 0px 5px; }";
			style += "#" + this.toolContainerId + " .button-group :last-child { border-radius: 0px 5px 5px 0px; border-right: 1px solid #ccc; }";

			cssElem.innerHTML = style;
			head.appendChild(cssElem);
		},
		
		/**
		 * Draw waterfall
		 * @param {object[]} entries
		 */
		drawWaterfall: function(entries) {
			var superClass = this;
			
			superClass.toolContainer = document.getElementById(superClass.toolContainerId);
			
			// If container doesn't exist yet, create it
			if (superClass.toolContainer === null) {
				superClass.toolContainer = document.createElement('div');
				superClass.toolContainer.id = superClass.toolContainerId;
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
				span.innerHTML = "Show first ";
				var timeSpanInput = document.createElement("input");
				timeSpanInput.id = "TimeSpanInput";
				timeSpanInput.type = "number";
				
				timeSpanInput.timeout = null;
				span.appendChild(timeSpanInput);
				span.innerHTML += " ms";
				leftContainer.appendChild(span);
				
				// Has to be appended with small delay. Element has to exist on screen
				window.setTimeout(function(){
					var timeSpanInput = document.getElementById("TimeSpanInput");
					timeSpanInput.value = superClass.getPageLoadTime(entries);
					
					var change = function(e){
						superClass.chartContainer.data.timeSpan = e.target.value.trim() * 1.0;
						
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
					
					timeSpanInput.addEventListener("change", change,true);
					timeSpanInput.addEventListener("keyup", change,true);
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
			var rowHeight = 10;
			var rowPadding = 2;
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
			
			width -= 25;
			
			this.toolContainer.style.width = "100%";
			
			this.chartContainer.style.width = "100%";
			this.chartContainer.style.height = height;
			
			var svg = this.svg.createSVG(width, height);
			
			// scale
			var scaleFactor = maxTime / (width - 5 - barOffset);
			
			// draw axis
			var interval = 1000 / scaleFactor;
			var numberOfLines = maxTime / interval;
			var x1 = barOffset,
				y1 = rowHeight + rowPadding,
				y2 = height;

			for(var n = 0; n < numberOfLines; n++) {
				svg.appendChild(this.svg.createSVGText(x1, 0, 0, rowHeight, "font: 10px sans-serif;", "middle", n));
				svg.appendChild(this.svg.createSVGLine(x1, y1, x1, y2, "stroke: #ccc;"));
				x1 += interval;
			} 

			// draw resource entries
			for(var n = 0; n < entriesToShow.length; n++) {

				var entry = entriesToShow[n]; 

				var row = this.svg.createSVGGroup("translate(0," + (n + 1) * (rowHeight + rowPadding) + ")");

				row.appendChild(this.svg.createSVGText(5, 0, 0, rowHeight, "font: 10px sans-serif;", "start", this.shortenURL(entry.url), entry.url));

				row.appendChild(this.drawBar(entry, barOffset, rowHeight, scaleFactor));

				svg.appendChild(row);
				// console.log(JSON.stringify(entry) + "\n" );
			}

			this.chartContainer.appendChild(svg);
		},
		
		/**
		 * Draw bar for resource 
		 * @param {object} entry Details of URL, and timings for individual resource
		 * @param {int} barOffset Offset of the start of the bar along  x axis
		 * @param {int} rowHeight 
		 * @param {double} scaleFactor Factor used to scale down chart elements
		 * @returns {element} SVG Group element containing bar
		 */
		drawBar: function(entry, barOffset, rowHeight, scaleFactor) {
			var bar = this.svg.createSVGGroup("translate(" + barOffset + ", 0)");

			bar.appendChild(this.svg.createSVGRect(entry.start / scaleFactor, 0, entry.duration / scaleFactor, rowHeight, "fill:" + this.barColors.blocked));
			
			if(entry.redirectDuration > 0) {
				bar.appendChild(this.svg.createSVGRect(entry.redirectStart / scaleFactor , 0, entry.redirectDuration / scaleFactor, rowHeight, "fill:" + this.barColors.redirect));
			}

			if(entry.appCacheDuration > 0) {
				bar.appendChild(this.svg.createSVGRect(entry.appCacheStart / scaleFactor , 0, entry.appCacheDuration / scaleFactor, rowHeight, "fill:" + this.barColors.appCache));
			}

			if(entry.dnsDuration > 0) {
				bar.appendChild(this.svg.createSVGRect(entry.dnsStart / scaleFactor , 0, entry.dnsDuration / scaleFactor, rowHeight, "fill:" + this.barColors.dns));
			}

			if(entry.tcpDuration > 0) {
				bar.appendChild(this.svg.createSVGRect(entry.tcpStart / scaleFactor , 0, entry.tcpDuration / scaleFactor, rowHeight, "fill:" + this.barColors.tcp));
			}

			if(entry.sslDuration > 0) {
				bar.appendChild(this.svg.createSVGRect(entry.sslStart / scaleFactor , 0, entry.sslDuration / scaleFactor, rowHeight, "fill:" + this.barColors.ssl));
			}

			if(entry.requestDuration > 0) {
				bar.appendChild(this.svg.createSVGRect(entry.requestStart / scaleFactor , 0, entry.requestDuration / scaleFactor, rowHeight, "fill:" + this.barColors.request));
			}

			if(entry.responseDuration > 0) {
				bar.appendChild(this.svg.createSVGRect(entry.responseStart / scaleFactor , 0, entry.responseDuration / scaleFactor, rowHeight, "fill:" + this.barColors.response));
			}

			return bar;
		},
		
		filterEntries: function(entries) {
			//this.chartContainer = document.getElementById("ChartContainer");
			this.chartContainer.innerHTML = "";
			
			var allowed = this.chartContainer.data.allowed;
			var notAllowed = this.chartContainer.data.notAllowed;
			var searchText = this.chartContainer.data.searchText;
			var timeSpan = this.chartContainer.data.timeSpan;
			
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
				if(timeSpan > 0 && startTime > timeSpan) continue;
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
		 
				el.setAttribute("transform", transform);
			
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
	
	new Waterfall({ getPageLoadTime: scalePerformanceBar.helpers.getPageLoadTimeFromResources });
})();