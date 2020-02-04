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
		this.props.data.loadTable(parseInt(this.state.numThreads, 10), this.props.refreshData)
	}

	handleChange = (event) => {
		this.setState({numThreads: event.target.value});
	}
	

	render() {
		
		if (this.props.data != null) {
            
			return <div>
					<b>{"Uncompressed Size:"}</b>
					<div>{this.props.data.getUncompressedBytes()}</div>
					<b>{"Compressed Size:"}</b>
					<div>{this.props.data.getCompressedBytes()}</div>
					<button onClick={this.loadTable}>Load Table</button><br/>
					
				</div>

		} else {
			return  <div>
					{"Loading..."}
				</div>
		}
	}
}
// # Concurrent: &nbsp;&nbsp; <input stype="text" size="1" value={this.state.numThreads} onChange={this.handleChange} />