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
        amountByDatByDay: [],
        histogram: hdr.build(),
        tableLoadTime: 0,
        graphLoadTime: 0
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
            this.fetchData(0, refreshData, false)
            refreshData(this)
        })
    }
    
    fetchData = async (datIndex, refreshData) => {
        const fetchDataBegin = new Date();
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
            this.state.fetchTimes.push({"index": datIndex, "latency": timeToFetch})
            console.log(`Fetched ${datIndex} in ${timeToFetch} ms`)
            refreshData(this)
        })
        .then(() => {
            // var timeStart = new Date()
            var amountByDatByDay = this.state.amountByDatByDay
            if (amountByDatByDay[datIndex] === null ||  amountByDatByDay[datIndex] === undefined) {
                var totalsByDate = {}
                var numRowsInDat = this.state.columnMetadata[1].bufferMetadata[datIndex].numRows
                var start = datIndex*65536
                var end = start + numRowsInDat
                for (var i=start; i < end ; i++) {
                    var dateAmount = this.getDateAmount(i)
                    var monthYear = `${dateAmount.date.substring(0,2)}-${dateAmount.date.substring(6)}`
                    if (totalsByDate[monthYear] === null ||  totalsByDate[monthYear] === undefined) {
                        totalsByDate[monthYear] = dateAmount.amount
                    } else {
                        totalsByDate[monthYear] = totalsByDate[monthYear] + dateAmount.amount
                    }
                }
                this.state.amountByDatByDay[datIndex] = totalsByDate
                refreshData(this)
            }
            // let fetchDataEnd = new Date()
            // let timeToFetch = fetchDataEnd - timeStart
            // console.log("Time to Summarize " + timeToFetch + " ms")
        })
    }


    getDateAmount = (rowIndex) => {
        // This is specific to the Utah Expenditure Dataset
        var columnMetadata = this.state.columnMetadata
        var datIndex = Math.floor(rowIndex/65536)
        var columnBuffers = this.state.data[datIndex]

        var dateUniqueValues = columnMetadata[0].uniqueValues;
        var amountUniqueValues = columnMetadata[1].uniqueValues;

        return {
            date: dateUniqueValues[columnBuffers[0][rowIndex%65536]],
            amount: parseInt(amountUniqueValues[columnBuffers[1][rowIndex%65536]])
        }
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

    loadTable = async(numThreads, refreshData, datFileCount) => {
        this.state.fetchTimes = []
        this.resetSizes()
        let begin = new Date()
        var limit = pLimit(numThreads)
        var downloadFiles = []
        for (let i=0; i < datFileCount; i++) {
            downloadFiles.push(limit(() => this.fetchData(i, refreshData)))
        }

       await (async () => {
            await Promise.all(downloadFiles);
        })();
        let end = new Date();
        let time = end - begin
        if (datFileCount > 160) {
            this.state.graphLoadTime = time/1000.0
        } else {
            this.state.tableLoadTime = time/1000.0
        }
        refreshData(this)
        console.log(`Loaded in ${time/1000} seconds`)
        console.log(hdr.encodeIntoBase64String(this.state.histogram));
    }

    getNumRowsLoaded = () => {
        return this.state.fetchTimes.length * 65536
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

    getTableRowCount = ()  => { 
        return 10027008
        // return 65536*100
        // return this.state.rowCount;
    }

    getGraphRowCount = ()  => { 
        // return 30000000
        // return 65536*100
        return this.state.rowCount;
    }

    getColumnCount = () => {
        return this.state.columnCount
    }

    getColumnNames = () => {
        return this.state.columnNames
    }
}

export default Data;