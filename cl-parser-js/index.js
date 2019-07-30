const fs = require('fs');


// var cylindersUnique = ["8", "4", "6", "3", "5"];

var horsepowerUniqueValues = [ "130", "165", "150", "140", "198", "220", "215", "225",
    "190", "170", "160", "95", "97", "85", "88", "46", "87", "90", "113", "200", "210",
    "193", "100", "105", "175", "153", "180", "110", "72", "86", "70", "76", "65", "69",
    "60", "80", "54",  "208", "155", "112", "92", "145", "137", "158", "167", "94", "107",
    "230", "49", "75", "91", "122", "67", "83", "78", "52", "61", "93", "148", "129", "96",
    "71", "98", "115", "53", "81", "79", "120", "152", "102", "108", "68", "58", "149", "89",
    "63", "48", "66", "139", "103", "125", "133", "138", "135", "142", "77", "62", "132", "84",
    "64", "74",  "116", "82" ];

// console.log("Cylnders")
// printFirstValues(0, 1, cylindersUnique, 50, "../data/auto-mpg/index_0.dat");
console.log("\nHorsepwer")
printFirstValues(784, 1, horsepowerUniqueValues, 50, "../data/auto-mpg/index_0.dat");

function printFirstValuesString(start, numBytesPerRpw, uniqueValues, numValues, file) {
    var arrayBuffer
    if (numBytesPerRpw == 1) {
        arrayBuffer = new Uint8Array(fs.readFileSync(file));
    } else if (numBytesPerRpw == 2){
        arrayBuffer = new Uint16Array(fs.readFileSync(file));
    } 

    for (let i = 0; i < numValues ; i++){
        console.log(uniqueValues[arrayBuffer[start+i]]);
    }
}

