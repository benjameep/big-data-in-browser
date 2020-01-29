import React, { Component } from 'react';
import VirtualDataTable from './VirtualDataTable'
import LatencyChartWrapper from './LatencyChartWrapper';
import Data from './Data';

class App extends Component {

  state = {
    data:null
  }

  refreshData = (data) => {
    this.setState({
      data: data,
      lastUpdated: new Date()
    })
  }

  componentWillMount() {
    console.time('fetchMetadata');

    const data = new Data()
    try {
      data.fetchMetadata(this.refreshData).then(()=> {
        this.refreshData(data)
        console.timeEnd('fetchMetadata');
      })
    } catch (error) {
      console.log("Error: " +error)
    }
  }

  
  renderChart() {
    if (this.state.length === 0) {
      return "No Data Yet";
    }

    // this.updateDay(this.state.data[this.state.data.length]);
    return <LatencyChartWrapper data={this.state.data} />
  }
  
  render() {
    return (
      <div>
        
          <div>{this.renderChart()}</div>
          <div>
            <VirtualDataTable data={this.state.data}/>
        </div>
      </div>
    );
  }

}

export default App;
