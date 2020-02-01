import React, { Component } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import VirtualDataTable from './VirtualDataTable'
import LatencyChartWrapper from './LatencyChartWrapper';
import MemoryView from './MemoryView';
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

    return <LatencyChartWrapper data={this.state.data} />
  }
  
  render() {
    return (

      <Container id="mainContainer">
          <Row>
            <Col md={10}>{this.renderChart()}</Col>
            <Col md={2}><MemoryView data={this.state.data} refreshData={this.refreshData}/> </Col>
            
          </Row>
          <Row>
            <Col md={12}><VirtualDataTable data={this.state.data}/></Col>
          </Row>
        </Container>
    );
  }

}

export default App;
