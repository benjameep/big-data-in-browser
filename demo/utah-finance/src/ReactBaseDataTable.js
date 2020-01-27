import React, { Component } from 'react';
import BaseTable, { Column } from 'react-base-table'
import 'react-base-table/styles.css'
import {generateColumns, generateData} from './DataUtils'


export default class DataTable extends Component {
	componentDidMount() {
		this.setState({
            data: this.props.data,
		})
	}
	
	render() {
		
		const columns = generateColumns(5)
		const data = generateData(columns, 100)
		return  <BaseTable data={data} width={800} height={600}>
				<Column key="col0" dataKey="col0" width={150} />
				<Column key="col1" dataKey="col1" width={150} />
				<Column key="col2" dataKey="col1" width={150} />
				<Column key="col3" dataKey="col1" width={150} />
				<Column key="col4" dataKey="col1" width={150} />
			</BaseTable>
	}
}