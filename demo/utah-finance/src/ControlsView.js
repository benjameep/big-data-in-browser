import React, { Component } from 'react';

export default class ControlsView extends Component {
	componentDidMount() {
		this.setState({
			
		})
	}

	componentWillReceiveProps(nextProps) {
		
		
	}

	render() {
        if (this.props.data != null && this.props.data.hasMetadata()) {
			return <div>
				</div>
		}
	}
}