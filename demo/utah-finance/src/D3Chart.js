import * as d3 from 'd3'
import { parseDay } from './DataUtils'

const MARGIN = { TOP: 10, BOTTOM: 80, LEFT: 70, RIGHT: 10 }
const WIDTH = 1000 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 200 - MARGIN.TOP - MARGIN.BOTTOM;

// const mindate = new Date(2019,4,6);
// const maxdate = Date.now(); 

class D3Chart {

	

	constructor(element, updateDay) {
		window.vis = this
		// vis.currentDay = parseDay(data[data.length-1].TS.substring(0,10));
		// updateDay(parseDay(data[data.length-1].TS.substring(0,10)));
		const vis = this
		vis.updateDay = updateDay
		vis.g = d3.select(element)
			.append("svg")
				.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
				.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
			.append("g")
				.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
		vis.slider = vis.g.append("slider")

		vis.x = d3.scaleTime()
			.range([0, WIDTH])
			
	
		vis.y = d3.scaleLinear()
			.range([HEIGHT, 0])

		vis.xAxisGroup = vis.g.append("g")
			.attr("transform", `translate(0, ${HEIGHT})`);
		vis.yAxisGroup = vis.g.append("g");

		vis.g.append("text")
			.attr("x", WIDTH / 2)
			.attr("y", HEIGHT + 40)
			.attr("font-size", 20)
			.attr("text-anchor", "middle")
			.text("Time");

		vis.g.append("text")
			.attr("x", -HEIGHT / 2)
			.attr("y", -50)
			.attr("transform", "rotate(-90)")
			.attr("font-size", 20)
			.attr("text-anchor", "middle")
			.text("Daily Total");

		// vis.update(data)		
	}



	dragstarted(d, vis) {
		console.log("Drag Started")
		// d3.select(this).raise().attr("stroke", "black");
	  }
	
	dragged(d, vis) {
		var currentDay = window.vis.x.invert(d3.event.x)
		window.vis.updateDay(currentDay)
		console.log(`Dragged ${d3.event.x }, ${d3.event.y}`)
		console.log(`X: ${currentDay} Y: ${window.vis.y.invert(d3.event.y)}`)
		
		// vis.currentDay
		// d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
	}
	
	dragended(d, vis) {
		console.log("Drag Ended")
		// d3.select(this).attr("stroke", null);
	}

	tapped() {
		console.log("Tapped")
	}

	vistouched() {
		console.log("VisTouched")
	}

	visreleased() {
		console.log("released")
	}

	// setData(dataAll) {
	// 	window.vis.dataAll = dataAll
	// 	this.update()
	// }

	// setCurrentDay(currentDay) {
	// 	window.vis.currentDay = currentDay
	// 	this.update()
	// }

	update(dataAll, currentDay) {
		// const vis = window.vis
		// const dataAll = vis.dataAll
		const data = dataAll.dataByDay
		window.vis.data = data
		const vis = window.vis
		if (data !== null && 
			data !== undefined)  {
		
			vis.x.domain([dataAll.firstDay, dataAll.lastDay])
			vis.y.domain([
				d3.min(data, d => Number(d.MinTemp)) - 10, 
				d3.max(data, d => Number(d.MaxTemp)) + 10
			])

			const xAxisCall = d3.axisBottom(vis.x);
			vis.xAxisGroup.transition(1000).call(xAxisCall)
			const yAxisCall = d3.axisLeft(vis.y);
			vis.yAxisGroup.transition(1000).call(yAxisCall)

			var minMaxTemperature = d3.area()
				.curve(d3.curveCatmullRom)
				.x(function(d) { return vis.x(parseDay(d.TS)); })
				.y0(function(d) { return vis.y(Number(d.MaxTemp)) })
				.y1(function(d) { return vis.y(Number(d.MinTemp)) });;


			// Updata the line
			vis.g//.enter()
				.append("path").attr("d", minMaxTemperature(data))
				.attr("class", "line")

			
			// TODO fix this
			const slider = vis.g.selectAll("slider")
			d3.line().x(function(d) { return vis.x(d)})

			// vis.g.remove("line")
			vis.g.append("line")
				.attr("x1", vis.x(currentDay))  //<<== change your code here
				.attr("y1", vis.y(0))
				.attr("x2", vis.x(currentDay))  //<<== and here
				.attr("y2", vis.y(100))//HEIGHT - MARGIN.TOP - MARGIN.BOTTOM)
				.attr("class", "slider")
				.style("stroke-width", 2)
				.style("stroke", "blue")
				.style("fill", "none")
				.call(d3.drag()
					.on("start", this.dragstarted)
					.on("drag", this.dragged)
					.on("end", this.dragended), vis)
				.on("mouseover", function(){
					d3.select(this)
						.style("stroke", "orange");
			
					// Get current event info
					console.log(d3.event);
					
					// Get x & y co-ordinates
					console.log(d3.mouse(this));
				})
				.on("mouseout", function(){
					d3.select(this)
						.style("stroke", "blue")
				});
		}
	}
}

export default D3Chart