import * as hdr from "hdr-histogram-js"
const axios = require('axios').default;
const pLimit = require('p-limit');


const UTAH_EXPENDITURES_WOID_ROUNDED = "/UtahExpendituresWOIDRounded-CL"
// const UTAH_EXPENDITURES_WOID = "/UtahExpendituresWOID-CL"
// const AUTO_DATA = "/auto"
const ignoreColumns = ["contract_name", "contract_number", "type", 
    "FISCAL_PERIOD", "batch_id", "fiscal_year", "FISCAL_PERIOD_DATE"]

class Data {
    state = {
        data: [],
        fetchIndex: [], 
        fetchTimes:[],
        uncompressedSize:0,
        compressedSize:0,
        histogram: hdr.build()
    }
    
    resetSizes() {
        this.state.compressedSize=6700000
        this.state.uncompressedSize=0
    }
    fetchMetadata = async (refreshData) => {
        var columnNames = null
        return axios.get(`${UTAH_EXPENDITURES_WOID_ROUNDED}/metadata.json`).then((response) => {
            var columnMetadata=response.data.columnMetadata;
            this.state.rowCount = response.data.numRows
            this.state.bufferCount = response.data.bufferCount
            this.state.columnMetadata = columnMetadata.filter( (column, index) => {
                return !ignoreColumns.includes(column.name);
            })
            columnNames = ["row"]
            // let totalBytes = 0
            this.state.columnMetadata.map((column) => {
                columnNames.push(column.name)   
                // totalBytes = totalBytes + column.originalSizeInBytes 
                return null
            })
            this.state.columnCount = columnNames.length
            this.state.columnNames = columnNames
            
            // Size of orginal csv file
            this.state.totalUncompressed = 13.9*1000000000; 
            this.resetSizes()
            this.state.fetchIndex.push(0)
            this.state.refreshData = refreshData
            this.fetchData(0, refreshData)
            refreshData(this)
        })
    }
    
    
    fetchData = async (datIndex, refreshData) => {
        let fetchDataBegin = new Date();
        return axios.get(`${UTAH_EXPENDITURES_WOID_ROUNDED}/index_${datIndex}.dat`, 
                {responseType: 'arraybuffer'}).then((response) => {
            var datColumns = []
            this.state.data[datIndex]=datColumns;
            var columnMetadata = this.state.columnMetadata

            this.state.compressedSize = this.state.compressedSize + response.data.byteLength
            this.state.uncompressedSize = this.state.uncompressedSize + 
                        (this.state.totalUncompressed/this.state.bufferCount)

            for (let col=0; col < columnMetadata.length; col++) {
                var bufferMetadata = columnMetadata[col].bufferMetadata[datIndex]
                var numBitsPerRow = bufferMetadata.numBitsPerRow; 
                var start = bufferMetadata.start;
                var numRows = bufferMetadata.numRows;
                var buffer = null;

                if (numBitsPerRow === 8) {
                    buffer = new Uint8Array(response.data.slice(start, start+numRows));
                } else if (numBitsPerRow === 16){
                    buffer = new Uint16Array(response.data.slice(start, start+(numRows*2)));
                } 
                datColumns[col] = buffer;
            }
            
            
            let fetchDataEnd = new Date()
            let timeToFetch = fetchDataEnd - fetchDataBegin
            this.state.histogram.recordValue(timeToFetch)
            this.state.fetchTimes.push({"index": datIndex, "latency":timeToFetch})
            
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

    loadTable = async(numThreads, refreshData) => {
        this.state.fetchTimes = []
        this.resetSizes()
        let begin = new Date()
        var limit = pLimit(numThreads)
        var downloadFiles = []
        for (let i=0; i < 228; i++) {
            downloadFiles.push(limit(() => this.fetchData(i, refreshData)))
        }

       await (async () => {
            const result = await Promise.all(downloadFiles);
            console.log(result);
        })();
        let end = new Date();
        let time = end - begin
        console.log(`Loaded in ${time/1000} seconds`)
        console.log(hdr.encodeIntoBase64String(this.state.histogram));
    }

    getCompressedBytes = () => {
        return `${(Math.round(this.state.compressedSize/1000000)).toLocaleString()} MB`
    }

    getUncompressedBytes = () => {
        return `${Math.round(this.state.uncompressedSize/1000000).toLocaleString()} MB`
    }

    getMetadata = () => {
        return this.state.columnMetadata;
    }

    hasMetadata = () => {
        return this.state.columnMetadata != null;
    }

    getRowCount = ()  => { 
        return 15000000
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