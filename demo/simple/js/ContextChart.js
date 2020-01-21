export default function ContextChart(){
  var margin = {top: 40, right: 25, bottom: 25, left: 40},
      width = 940 - margin.left - margin.right, // default width
      height = 300 - margin.top - margin.bottom // default height
  
  var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]);
  

  var yAxis = d3.axisLeft(y)
    .tickFormat(d => d+'°F')
  var xAxis = d3.axisTop(x)
    .tickSize(height+15)
  
  var xfn
  
  function self(selection){
    selection.each(function(data){

      x.domain(d3.extent(data, xfn))

      var svg = d3.select(this).selectAll("svg").data([null])
      svg = svg.enter()
        .append('svg')
      .merge(svg)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      
      var g = svg.selectAll('g').data([null])
      g = g.enter().append('g')
      .merge(g)
        .attr('transform',`translate(${[margin.left,margin.top]})`)
      
      var xAxisLabel = g.selectAll('axis--x').data([null])
      xAxisLabel.enter().append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(${[0,height]})`)
      .merge(xAxisLabel)
        .call(xAxis)
        .selectAll(".tick text")
          .attr('alignment-baseline', 'hanging')
          .attr('text-anchor', 'start')
          .attr('dx','.5em')
          .attr('dy','.5em')
        
      
      var yAxisLabel = g.selectAll('axis--y').data([{}])
      yAxisLabel.enter().append('g')
        .attr('class', 'axis axis--y')
      .merge(yAxisLabel)
        .call(yAxis)
      

      var records = g.selectAll('.record_range').data(data)
      records.enter()
        .append('rect')
        .attr('class','record_range')
      .merge(records)
        .attr('x',d => x(xfn(d)))
        .attr('y',d => y(rmaxfn(d)))
        .attr('width',width/data.length)
        .attr('height',d => y(rminfn(d)) - y(rmaxfn(d)))


      var norms = g.selectAll('.norm_range').data(data)
      norms.enter()
        .append('rect')
        .attr('class','norm_range')
      .merge(norms)
        .attr('x',d => x(xfn(d)))
        .attr('y',d => y(nmaxfn(d)))
        .attr('width',width/data.length)
        .attr('height',d => y(nminfn(d)) - y(nmaxfn(d)))
      

      var actual = g.selectAll('.actual_range').data(data)
      actual.enter()
        .append('rect')
        .attr('class','actual_range')
      .merge(actual)
        .attr('x',d => x(xfn(d)))
        .attr('y',d => y(maxfn(d)))
        .attr('width',width/data.length)
        .attr('height',d => y(minfn(d)) - y(maxfn(d)))
    })
  }

  self.width = function(value){
    if (!arguments.length) return width + margin.left + margin.right
    width = value - margin.left - margin.right
    return self
  }
  self.height = function(value){
    if (!arguments.length) return height + margin.top + margin.bottom
    width = value - margin.top - margin.bottom
    return self
  }

  self.x = v => (xfn=v,self)

  return self
}