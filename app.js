import MinMaxChart from './js/MinMaxChart.js'
import ContextChart from './js/ContextChart.js'
import { load, get } from './js/data.js'

const dateStart = new Date(2015, 0, 1)
const timeMeasure = d3.utcHour
const timeInterval = 5

timeMeasure.offset(dateStart, timeInterval)

var tempuraturePlot = MinMaxChart()
  .x((d,i) => timeMeasure.offset(dateStart, i*timeInterval))
  .min((d,i) =>  +get('HourlyWetBulbTemperature',i))
  .max((d,i) =>  +get('HourlyWetBulbTemperature',i))
  
// // var ctxPlot = ContextChart()
// //   .x(d => parseDateTime(d.date))

load('./data/airport-data').then(() => {
  // Log the data
  console.log(window.data)

  d3.select('#tempurature')
    .datum(Array(metadata.numRows))    
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