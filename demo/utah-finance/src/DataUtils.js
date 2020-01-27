import { timeParse } from 'd3'

export function weatherByDay(data) {
    var result = []
    var current = null;
    
    data.forEach((d, index) => {
        var TS = d.TS.substring(0,10);
        if (current === null || TS !== current.TS.substring(0,10)) {
            current = {
                "TS" : TS,
                "MinTemp" : d.Temperature,
                "MaxTemp" : d.Temperature
            }
            result.push(current);
        } else {
            if (d.Temperature < current.MinTemp) { 
                current["MinTemp"] = d.Temperature
            }

            if (d.Temperature > current.MaxTemp) {
                current["MaxTemp"] = d.Temperature
            }
        }
    });

    return result;
}



export const parseDay = timeParse("%Y-%m-%d"); 
export const parseTime = timeParse("%Y-%m-%d_%H:%m"); 
export const getFirstDate = (data) => parseDay(data[0].TS.substring(0,10))
export const getLastDate = (data) => parseDay(data[data.length-1].TS.substring(0,10))

export const generateColumns = (count = 10, prefix = "col", props) =>
    new Array(count).fill(0).map((column, columnIndex) => ({
    ...props,
    key: `${prefix}${columnIndex}`,
    dataKey: `${prefix}${columnIndex}`,
    title: `Column ${columnIndex}`,
    width: 40
    }));

export const generateData = (columns, count = 20, prefix = "row-") =>
    new Array(count).fill(0).map((row, rowIndex) => {
    return columns.reduce(
        (rowData, column, columnIndex) => {
        rowData[column.dataKey] = `Row ${rowIndex} - Col ${columnIndex}`;
        return rowData;
        },
        {
        id: `${prefix}${rowIndex}`,
        parentId: null
        }
    );
    });
