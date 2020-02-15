import * as d3 from 'd3'

const MARGIN = { TOP: 10, BOTTOM: 80, LEFT: 100, RIGHT: 20 }
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;



class FinanceChart {
	state = {
		width : 1100
	}

	constructor(element) {
		window.expenseVis = this
		const vis = this

		vis.g = d3.select(element)
			.append("svg")
				.attr("width", this.state.width + MARGIN.LEFT + MARGIN.RIGHT)
				.attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
			.append("g")
				.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

		vis.x = d3.scaleTime()
			.range([0, this.state.width])
	
		vis.y = d3.scaleLinear()
			.range([HEIGHT, 0])

		vis.xAxisGroup = vis.g.append("g")
			.attr("transform", `translate(0, ${HEIGHT})`);
		vis.yAxisGroup = vis.g.append("g");

		vis.g.append("text")
			.attr("x", this.state.width / 2)
			.attr("y", HEIGHT + 40)
			.attr("font-size", 20)
			.attr("text-anchor", "middle")
			.text("Date");

		vis.g.append("text")
			.attr("x", -HEIGHT / 2)
			.attr("y", -70)
			.attr("transform", "rotate(-90)")
			.attr("font-size", 20)
			.attr("text-anchor", "middle")
			.text("Utah Expenses Per Month");

		vis.div = d3.select("body").append("div")	
			.attr("class", "tooltip")				
			.style("opacity", 0);
	}

    parseDay(d) {
        return d3.timeParse("%m-%Y")(d); 
    } 
    // parseDay = d3.timeParse("%Y-%m-%d");

	chooseColor(d) {
		return "steelblue"
	}

	updateWidth(width) {
		this.state.width = width;
    }

    calculateByDay(amountByDatByDay) {
        if (amountByDatByDay === null || amountByDatByDay.length === 0) {
            return null;
        }
        var byDay = {}
        for (var i=0 ; i<amountByDatByDay.length ; i++) {
            const datObj = amountByDatByDay[i]
            if (datObj !== null && datObj !== undefined) {
                for (var dateKey of Object.keys(datObj)) {
                    // console.log(key + " -> " + p[key])
                    
                    if (byDay[dateKey] == null) {
                        byDay[dateKey] = datObj[dateKey]
                    } else {
                        byDay[dateKey] += datObj[dateKey]
                    }
                }
            }
        }
        const returnData = []
        Object.keys(byDay).map(i => {
			var val = {
                date: i, 
                amount: byDay[i]
		   	}
			returnData.push(val)
			return val
        })
        return returnData;
    }

	update(data) {
        var dataByDay = this.calculateByDay(data.state.amountByDatByDay)
        // console.log("---> " + JSON.stringify(data.state.amountByDatByDay))
        // console.log("     " + JSON.stringify(dataByDay))
        if (dataByDay === null || dataByDay.length ===0) {
            return
        }
		const vis = window.expenseVis
		if (dataByDay !== null && 
			dataByDay !== undefined)  {
		
            vis.x.domain([
				d3.min(dataByDay, day => this.parseDay(day.date)), 
				d3.max(dataByDay, day => this.parseDay(day.date))])
            // vis.y.domain([
			// 	d3.min(data, d => Number(d.MinTemp)) - 10, 
			// 	d3.max(data, d => Number(d.MaxTemp)) + 10
            // ])
            
            vis.y.domain([
                d3.min(dataByDay, day => day.amount), 
                d3.max(dataByDay, day => day.amount)
            ])
			const xAxisCall = d3.axisBottom(vis.x);
			vis.xAxisGroup.call(xAxisCall) //transition(1000).
			const yAxisCall = d3.axisLeft(vis.y)
			vis.yAxisGroup.call(yAxisCall) // transition(1000)

			const rects = vis.g.selectAll("rect")
				.data(dataByDay)
	
			// Exit
			rects.exit()//.transition().duration(500)
				.attr("height", 0)
				.attr("y", HEIGHT)
				.attr("x", this.state.width + 30)
				.remove()

			// Update
			rects
				.attr("x", (d, i) => vis.x(this.parseDay(d.date)))
				//.transition().duration(500)
				.attr("y", d =>  vis.y(d.amount))
				.attr("width", 5)
				.attr("height", d => HEIGHT - vis.y(d.amount))
				.attr("fill", d => this.chooseColor(d.amount))

			// Enter
			rects.enter().append("rect")
				.attr("x", (d, i) => vis.x(this.parseDay(d.date)))
				.attr("width", 5)
				.attr("fill", d => this.chooseColor(d.amount))
				// .attr("y", HEIGHT)
				.attr("y", d =>  vis.y(d.amount))
				.attr("height", d => HEIGHT - vis.y(d.amount))
				.on("mouseover", function(d) {		
					vis.div.transition()		
						.duration(200)		
						.style("opacity", .9);		
					vis.div.html(`${d.date}<br/>$${d.amount}`)	
						.style("left", (d3.event.pageX) + "px")		
						.style("top", (d3.event.pageY - 40) + "px");	
					})					
				.on("mouseout", function(d) {		
					vis.div.transition()		
						.duration(500)		
						.style("opacity", 0)})
				// .transition().duration(500)
					

		}
	}

	
}



export default FinanceChart