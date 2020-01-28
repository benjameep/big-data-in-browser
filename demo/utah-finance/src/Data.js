const axios = require('axios').default;

const UTAH_EXPENDITURES_WOID_ROUNDED = "/UtahExpendituresWOIDRounded-CL"
const UTAH_EXPENDITURES_WOID = "/UtahExpendituresWOID-CL"
const AUTO_DATA = "/auto"
const ignoreColumns = ["contract_name", "contract_number", "type", "Fiscal Period", "batch_id", "Year Fiscal"]

class Data {
    state = {
        data: [],
        fetchIndex: [], 
        fetchTimes:[]
    }
    
    fetchMetadata = async (refreshData) => {
        var columnNames = null
        this.state.refreshData = refreshData;
        return axios.get(`${UTAH_EXPENDITURES_WOID_ROUNDED}/metadata.json`).then((response) => {
            var columnMetadata=response.data.columnMetadata;
            this.state.rowCount = response.data.numRows
            this.state.bufferCount = response.data.bufferCount
            this.state.columnMetadata = columnMetadata.filter( (column, index) => {
                return !ignoreColumns.includes(column.name);
            })
            columnNames = ["row"]
            this.state.columnMetadata.map((column) => {
                columnNames.push(column.name)      
                return null
            })
            this.state.columnCount = columnNames.length
            this.state.columnNames = columnNames
            // console.log(response.data);
            refreshData(this)
            this.fetchData(0, refreshData)
        })
    }
    
    fetchData = async (datIndex, refreshData) => {
        let fetchDataBegin = new Date();
        
        return axios.get(`${UTAH_EXPENDITURES_WOID_ROUNDED}/index_${datIndex}.dat`, 
                {responseType: 'arraybuffer'}).then((response) => {
            var datColumns = []
            this.state.data[datIndex]=datColumns;
            var columnMetadata = this.state.columnMetadata
            for (let col=0; col < columnMetadata.length; col++) {
                var numBitsPerRow = columnMetadata[col].bufferMetadata[0].numBitsPerRow; 
                var start = columnMetadata[col].bufferMetadata[0].start;
                var numRows = columnMetadata[col].bufferMetadata[0].numRows;
                var buffer = null;

                if (numBitsPerRow === 8) {
                    buffer = new Uint8Array(response.data.slice(start, start+numRows));
                } else if (numBitsPerRow === 16){
                    buffer = new Uint16Array(response.data.slice(start, 2*(start+numRows)));
                } 
                datColumns[col] = buffer;
            }
            //TODO call setState in apps
            let fetchDataEnd = new Date()
            let timeToFetch = fetchDataEnd - fetchDataBegin
            this.state.fetchTimes[datIndex] = timeToFetch
            console.log(`Fetched dat index_${datIndex}.dat in ${timeToFetch} ms`);
            refreshData(this)
        })
    }

    getData = (params) => {
        var rowIndex = params.index
        var row = {row: (rowIndex+1).toLocaleString()}
        var columnMetadata = this.state.columnMetadata
        var datIndex = Math.floor(rowIndex/65536)
        var columnBuffers = this.state.data[datIndex]
        
        
        for (let i=0; i < columnMetadata.length; i++) {
            var colName = columnMetadata[i].name
            if (columnBuffers == null) {
                row[colName] = "Loading ..."
                if (!this.state.fetchIndex.includes(datIndex)) {
                    this.state.fetchIndex.push(datIndex)
                    this.fetchData(datIndex, this.state.refreshData);
                }
            } else {
                var buffer = columnBuffers[i]
                var numBitsPerRow = columnMetadata[i].bufferMetadata[0].numBitsPerRow; 
                var uniqueValues = columnMetadata[i].uniqueValues;
                
                if (numBitsPerRow === 0) {
                    // This means there is only one possible value so we don't need to read the dat file
                    row[colName] = uniqueValues[0];
                } else {
                    row[colName] = uniqueValues[buffer[rowIndex%65536]];
                }
            } 
        }
        return row;
    }

    getMetadata = () => {
        return this.state.columnMetadata;
    }

    hasMetadata = () => {
        return this.state.columnMetadata != null;
    }

    getRowCount = ()  => { 
        return 10000000
        // return 65536*100
        // return this.state.rowCount;
    }

    getColumnCount = () => {
        return this.state.columnCount
    }

    getColumnNames = () => {
        return this.state.columnNames
    }
}

export default Data;