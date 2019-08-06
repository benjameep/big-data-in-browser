


const parseDateTime = d3.timeParse('%Y-%m-%d')
// const parseDateTime = d3.timeParse('%s')

var tempuraturePlot = MinMaxChart()
  .x(d => parseDateTime(d.date))
  .min(d =>  +d.actual_min_temp)
  .max(d =>  +d.actual_max_temp)
  .nmin(d => +d.average_min_temp)
  .nmax(d => +d.average_max_temp)
  .rmin(d => +d.record_min_temp)
  .rmax(d => +d.record_max_temp)
  
var ctxPlot = ContextChart()
  .x(d => parseDateTime(d.date))

d3.csv("data/dev-data.csv").then(data => {
  d3.select('#tempurature')
    .datum(data)
    .call(tempuraturePlot)
  
  // d3.select('#ctx')
  //   .datum(data)
  //   .call(ctxPlot)
})


// pass in location, time range, aggregation level
// give out

// year  6   64
// day   5   32
// month 4   16

// start = new Date(2016,0,0)
// var getDate = (d,i) => d3.timeDay.offset(start,i)

// fetch('dump.npy').then(r => r.arrayBuffer()).then(buffer => console.log(new Int8Array(buffer)))