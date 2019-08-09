function getTypedArray(buffer, {numBitsPerRow, start, numRows}){
  switch(numBitsPerRow){
    case 8:
      return new Uint8Array(buffer, start, numRows)
    case 16:
      return new Uint16Array(buffer, start, numRows)
  }
}

function read(files){ // using window.metadata
  var columns = {}
  for(var b = 0; b < metadata.bufferCount; b++){
    for(var c = 0, col; col = metadata.columnMetadata[c]; c++){
      var data = columns[col.name] = columns[col.name] || {buffers:[]}
      if(col.uniqueValues){
        if(col.uniqueValues.length == 1){
          data.value = col.uniqueValues[0]
        } else {
          data.values = col.uniqueValues
        }
      } else {
        data.type = col.type
      }
      data.buffers[b] = getTypedArray(files[b], col.bufferMetadata[b])
    }
  }
  return columns
}

export function get(colname, index){ // using window.data
  var col = data[colname]
  if(!col) throw new Error(`Column ${colname} is not in data`)
  
  var i,r,k,buffer
  for(i = 0, r = 0, k = 0; r <= index && (buffer = col.buffers[i]); i++)
    k = r, r += buffer.length
  if(!buffer) throw new Error(`Index ${index} is out of range ${r}`)
  
  return buffer[index-k]
}

// var dir = '../../data/airport-data/'
export function load (dir){
  if(!dir.endsWith('/')) dir += '/'
  return fetch(dir+'metadata.json')
    .then(r => r.json())
    .then(md => { // Fetch the dat files
      window.metadata = md
      var dataFileNames = Array.from({length:md.bufferCount},(n,i) => dir+'index_'+i+'.dat')
      return Promise.all(dataFileNames.map(name => fetch(name).then(r => r.arrayBuffer())))
    })
    .then(read)
    .then(data => {
      window.data = data
      return data
    })
}