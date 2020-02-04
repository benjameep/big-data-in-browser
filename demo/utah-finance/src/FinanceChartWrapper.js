import React, { Component } from 'react';
import FinanceChart from './FinanceChart';

export default class FinanceChartWrapper extends Component {

	componentDidMount() {
		this.setState({
			chart: new FinanceChart(this.refs.chart)
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
		return <div className="expense-chart-area" ref="chart"/>
	}
}