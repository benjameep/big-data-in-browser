import React, { Component } from 'react';
import D3Chart from './D3Chart';

export default class ChartWrapper extends Component {
	componentDidMount() {
		this.setState({
			chart: new D3Chart(this.refs.chart)
		})
	}

	shouldComponentUpdate() {
		return false
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.data !== null && nextProps.data !== undefined && 
			this.state !== null && this.state !== undefined ) {
			this.state.chart.update(nextProps.data)
		} 
		
	}

	render() {
		return <div className="chart-area" ref="chart"></div>
	}
}