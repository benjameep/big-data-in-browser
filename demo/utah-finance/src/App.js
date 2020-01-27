import React, { Component } from 'react';
import { csv } from 'd3';
import VirtualDataTable from './VirtualDataTable'
import { weatherByDay, getFirstDate, getLastDate } from './DataUtils'

import ChartWrapper from './ChartWrapper';
import Data from './Data';

class App extends Component {

  state = {
    // metadata:{},
    data:null,
    currentDay: null,
    currentDataPoint: null
  }

  refreshData = (data) => {
    this.setState({
      data: data,
      lastUpdated: new Date()
    })
    // this.forceUpdate()
  }

  componentWillMount() {
    console.time('fetchMetadata');

    const data = new Data()
    const apps = this;
    try {
      data.fetchMetadata(this.refreshData).then(()=> {
        this.refreshData(data)
        console.timeEnd('fetchMetadata');
      })
      // data.fetchData(0).then(()=> {
      //   console.log("Fetched Data")
      // });
    } catch (error) {
      console.log("Error: " +error)
    }
    // Promise.all
  }



  // updateData = (data) => this.setState( {data} );

  updateDay = (currentDay) => this.setState( {currentDay} );
  
  renderChart() {
    if (this.state.length === 0) {
      return "No Data Yet";
    }

    // this.updateDay(this.state.data[this.state.data.length]);
    return <ChartWrapper data={this.state.data} 
                          currentDay={this.state.currentDay} 
                          updateDay={this.updateDay}/>
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
