import * as d3 from 'd3'
// import { parseDay } from './DataUtils'

const MARGIN = { TOP: 10, BOTTOM: 80, LEFT: 70, RIGHT: 10 }
const WIDTH = window.innerWidth - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 200 - MARGIN.TOP - MARGIN.BOTTOM;

// const mindate = new Date(2019,4,6);
// const maxdate = Date.now(); 

class D3Chart {

	constructor(element) {
		window.vis = this
		const vis = this
		vis.g = d3.select(element)
			.append("svg")
				.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
				.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
			.append("g")
				.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

		vis.x = d3.scaleLinear()
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
			.text("Data Chunk");

		vis.g.append("text")
			.attr("x", -HEIGHT / 2)
			.attr("y", -50)
			.attr("transform", "rotate(-90)")
			.attr("font-size", 20)
			.attr("text-anchor", "middle")
			.text("Load Time (ms)");

		// vis.update(data)		
	}



	// setData(dataAll) {
	// 	window.vis.dataAll = dataAll
	// 	this.update()
	// }

	// setCurrentDay(currentDay) {
	// 	window.vis.currentDay = currentDay
	// 	this.update()
	// }

	update(data) {
		// const vis = window.vis
		// const dataAll = vis.dataAll
		const times = data.state.fetchTimes
		const vis = window.vis
		if (times !== null && 
			times !== undefined)  {
		
			vis.x.domain([-2, (data.getRowCount()/65536)+5])
			vis.y.domain([
				d3.min(times, t => t) - 10, 
				d3.max(times, t => t) + 10
			])

			const xAxisCall = d3.axisBottom(vis.x);
			vis.xAxisGroup.transition(1000).call(xAxisCall)
			const yAxisCall = d3.axisLeft(vis.y);
			vis.yAxisGroup.transition(1000).call(yAxisCall)

			const rects = vis.g.selectAll("rect")
				.data(times)
	
			// Exit
			rects.exit().transition().duration(500)
				.attr("height", 0)
				.attr("y", HEIGHT)
				.attr("x", WIDTH + 30)
				.remove()

			// Update
			rects.transition().duration(500)
				.attr("x", (d, i) => vis.x(i))
				.attr("y", d =>  vis.y(d))
				.attr("width", 5)
				.attr("height", d => HEIGHT - vis.y(d))
				.attr("fill", "gray")

			// Enter
			rects.enter().append("rect")
				.attr("x", (d, i) => vis.x(i))
				.attr("width", 5)
				.attr("fill", "black")
				.attr("y", HEIGHT)
				.transition().duration(500)
					.attr("y", d =>  vis.y(d))
					.attr("height", d => HEIGHT - vis.y(d))

		}
	}
}

export default D3Chart