import * as d3 from 'd3'

const MARGIN = { TOP: 10, BOTTOM: 80, LEFT: 100, RIGHT: 20 }
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;


class LatencyChart {
	state = {
		width : 1100
	}

	constructor(element) {
		window.vis = this
		const vis = this

		vis.g = d3.select(element)
			.append("svg")
				.attr("width", this.state.width + MARGIN.LEFT + MARGIN.RIGHT)
				.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
			.append("g")
				.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

		vis.x = d3.scaleLinear()
			.range([0, this.state.width])
			
	
		vis.y = d3.scaleLog()
			.range([HEIGHT, 0])

		vis.xAxisGroup = vis.g.append("g")
			.attr("transform", `translate(0, ${HEIGHT})`);
		vis.yAxisGroup = vis.g.append("g");

		vis.g.append("text")
			.attr("x", this.state.width / 2)
			.attr("y", HEIGHT + 40)
			.attr("font-size", 20)
			.attr("text-anchor", "middle")
			.text("Rows Loaded");

		vis.g.append("text")
			.attr("x", -HEIGHT / 2)
			.attr("y", -60)
			.attr("transform", "rotate(-90)")
			.attr("font-size", 20)
			.attr("text-anchor", "middle")
			.text("Load Time");

		vis.div = d3.select("body").append("div")	
			.attr("class", "tooltip")				
			.style("opacity", 0);
		// vis.update(data)		
	}

	chooseColor(d) {
		if (d > 1000) {
			return "#B33A3A" // red
		} else if (d > 100) {
			return "#ffae42"  // orange
		} else {
			return "gray"
			
		}
	}

	updateWidth(width) {
		this.state.width = width;
	}

	update(data) {
		// const vis = window.vis
		// const dataAll = vis.dataAll
		const times = data.state.fetchTimes
		const vis = window.vis
		if (times !== null && 
			times !== undefined)  {
			vis.x.domain([0, d3.max(times, time => time.index) * 65536])
			vis.y.domain([1, 10000])
			const xAxisCall = d3.axisBottom(vis.x);
			vis.xAxisGroup.transition(300).call(xAxisCall)
			const yAxisCall = d3.axisLeft(vis.y)
					.tickValues([100, 1000, 10000])
					.tickFormat(function(d){
						var p = d3.format("~r")(d);
						return p+' ms';
					  })
					// .tickFormat(d3.format("~r"));
			vis.yAxisGroup.call(yAxisCall)
			//transition(300)

			const rects = vis.g.selectAll("rect")
				.data(times)
	
			// Exit
			rects.exit()//.transition().duration(500)
				.attr("height", 0)
				.attr("y", HEIGHT)
				.attr("x", this.state.width + 30)
				.remove()

			// Update
			rects
				.attr("x", (d, i) => vis.x(d.index*65536))
				// .transition().duration(300)
				.attr("y", d =>  vis.y(d.latency))
				.attr("width", 3)
				.attr("height", d => HEIGHT - vis.y(d.latency))
				.attr("fill", d => this.chooseColor(d.latency))

			// Enter
			rects.enter().append("rect")
				.attr("x", (d, i) => vis.x(d.index*65536))
				.attr("width", 3)
				.attr("fill", d => this.chooseColor(d.latency))
				// .attr("y", HEIGHT)
				.attr("y", d =>  vis.y(d.latency))
				.attr("height", d => HEIGHT - vis.y(d.latency))
				.on("mouseover", function(d) {		
					vis.div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					vis.div.html(`Chunk ${d.index}<br/>${d.latency} ms`)	
						.style("left", (d3.event.pageX) + "px")		
						.style("top", (d3.event.pageY - 40) + "px");	
					})					
				.on("mouseout", function(d) {		
					vis.div.transition()		
						.duration(500)		
						.style("opacity", 0)})
				// .transition().duration(300)
					

		}
	}

	
}



export default LatencyChart