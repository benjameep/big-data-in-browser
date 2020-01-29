import React, { Component } from 'react';
import LatencyChart from './LatencyChart';

export default class LatencyChartWrapper extends Component {
	componentDidMount() {
		this.setState({
			chart: new LatencyChart(this.refs.chart)
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