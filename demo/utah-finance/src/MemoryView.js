import React, { Component } from 'react';

export default class MemoryView extends Component {
	// constructor(props){
	// 	super(props)
	// }

	componentDidMount() {
		this.setState({
			data: this.props.data,
			numThreads: 2
		})
	}

	componentWillReceiveProps(nextProps) {
		
		
	}

	loadTable = () => {
		this.props.data.loadTable(parseInt(this.state.numThreads, 10), 
				this.props.refreshData, this.props.data.getTableRowCount()/65536)
	}

	loadGraph = () => {
		this.props.data.loadTable(parseInt(this.state.numThreads, 10), 
					this.props.refreshData, this.props.data.getGraphRowCount()/65536)
	}

	handleChange = (event) => {
		this.setState({numThreads: event.target.value});
	}
	

	render() {
		
		if (this.props.data != null) {
            
			return <div>
					<div><b>Rows: </b>{this.props.data.getNumRowsLoaded().toLocaleString()}</div>
					<div><b>{"Uncompressed Size:"}</b><br/>
					{this.props.data.getUncompressedBytes()}</div>
					<div><b>{"Compressed Size:"}</b><br/>
					{this.props.data.getCompressedBytes()}</div>
					<br/>
					<button onClick={this.loadTable}>Load Table</button> {this.props.data.state.tableLoadTime} sec<br/>
					<br/>
					<button onClick={this.loadGraph}>Load Graph</button> {this.props.data.state.graphLoadTime} sec<br/>
				</div>

		} else {
			return  <div>
					{"Loading..."}
				</div>
		}
	}
}
// # Concurrent: &nbsp;&nbsp; <input stype="text" size="1" value={this.state.numThreads} onChange={this.handleChange} />