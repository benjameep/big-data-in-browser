import React, { Component } from 'react';
import ReactDataGrid from "react-data-grid";


const columns = [
    { key: "id", name: "ID", editable: false },
    { key: "name", name: "Name", editable: false },
    { key: "age", name: "Age", editable: false }
  ];

export default class DataTable extends Component {

  render() {
    return (
      <ReactDataGrid
        columns={columns}
        rowGetter={this.getData}
        rowsCount={10000000}
        minHeight={600}
        enableCellSelect={true}
      />
    );
  }
    
    getData = (rowNum) => {
        return {id: rowNum, name: "Test", age: rowNum%45 + 20}
    }
}
