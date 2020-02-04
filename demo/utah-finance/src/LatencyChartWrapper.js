import React, { Component } from 'react';
import LatencyChart from './LatencyChart';

export default class LatencyChartWrapper extends Component {
	constructor(props) {
		super(props)
		this.containerRef = React.createRef();
    	this.getRectsInterval = undefined;
		// window.chartWidth = offsetWidth - MARGIN.LEFT - MARGIN.RIGHT -10;

		this.state = {
			containerRect: { left: 0, width: 1500 }
		};
	}

	componentDidMount() {
		this.setState({
			chart: new LatencyChart(this.refs.chart)
		})
		this.getRectsInterval = setInterval(() => {
				this.setState(state => {
					if (this.containerRef.current != null) {
						const containerRect = this.containerRef.current.getBoundingClientRect();
						this.state.chart.update(containerRect.width)
						return JSON.stringify(containerRect) !== JSON.stringify(state.containerRect) ? null : { containerRect };
					}
			});
		}, 10);
	}
	
	componentWillUnmount() {
		clearInterval(this.getRectsInterval);
	}

	shouldComponentUpdate() {
		return false
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.data !== null && nextProps.data !== undefined && 
			this.state !== null && this.state !== undefined ) {
			this.state.chart.updateWidth(15)
			this.state.chart.update(nextProps.data)
		} 
		
	}

	render() {
		return <div className="latency-chart-area" ref="chart"/>
	}
}