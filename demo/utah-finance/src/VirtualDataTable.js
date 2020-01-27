import React, { Component } from 'react';
import {Column, Table, ColumnSizer, Grid} from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once

const columnWidth = 150;

export default class VirtualDataTable extends Component {
  constructor(props) {
    super(props);
  }
  state = { }

  componentDidMount() {
		this.setState({
			data:  this.props.data
		})
	}

  render() {
    console.log()
    if (this.props.data != null && this.props.data.hasMetadata()) {
      return (
        <ColumnSizer
          columnMaxWidth={150}
          columnMinWidth={125}
          columnCount={this.props.data.getColumnNames().length}
          width={this.props.data.getColumnNames().length*125}>
          {({adjustedWidth, getColumnWidth, registerChild}) => (
        <Table
          ref={registerChild}
          width={adjustedWidth}
          columnWidth={getColumnWidth}
          height={window.innerHeight-200}
          headerHeight={20}
          rowHeight={30}
          rowCount={this.props.data.getRowCount()}
          rowGetter={this.props.data.getData}>
          {this.renderColumns()}
        </Table>
        )}
        </ColumnSizer>
      );
    } else {
      return null;
    }
  }
    
  renderColumns() {
    // var columnNames = ["rowNum"]
    if (this.props.data != null && this.props.data.hasMetadata()) {
      var columns = this.props.data.getColumnNames().map((columnName, index) => {
        // columnNames.push(columnNamee)      
        return <Column key={columnName} label={columnName} dataKey={columnName} width={columnWidth} />
      })
      // this.state.columnNames = columnNames
      // console.log(JSON.stringify(columnNames))
      return columns
    }
  }

  getWidth = () => {
    if (this.props.data != null && this.props.data.hasMetadata()) {
      return this.props.data.getColumnCount()*columnWidth
    } else {
      return window.innerWidth - 20
    }
  }
 

}
