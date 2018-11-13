const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const urlMongo = 'mongodb://157.253.205.96:27017/performance_collector_unacloud';
//const urlMongo = 'mongodb://localhost:27017/performance_collector_unacloud';

let clientDB = null;

MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    clientDB = client;
    var collectionP = client.db('performance_collector_unacloud').collection('MetricsCollection');
    for (let i = 7; i < 23; i++) {
        const year = 2018;
        let minute = i;
        let minute2 = i + 1;
        //months 10 y 11
        for (let m = 10; m < 12; m++) {
            //days 10 y 11
            for (let d = 0; d < 31; d++) {
                if (checkValidDay(d, m, year)) {
                    collectionP.find({ "timestamp": { $gte: year + "-" + m + "-" + (d < 9 ? '0' + d : d) + "T" + (minute < 10 ? "0" + minute : minute) + ":00:00", $lt: year + "-" + m + "-" + (d < 9 ? '0' + d : d) + "T" + (minute2 < 10 ? "0" + minute2 : minute2) + ":00:00" } }).toArray(function (err, docs) {
                        if (err) console.log(err);
                        if (docs.length > 0) {
                            //Promedio del minuto "minute" para el dia d month m
                            let avg = 0;
                            for (let j = 0; j < docs.length; j++) {
                                avg += docs[j].cpu;
                            }
                            avg /= docs.length;
                            console.log("m: " + m + " d: " + d + " min: " + minute + " avg: " + avg);
                            save(minute, avg.toFixed(4));
                        }
                        else {
                            //console.log("no docs for month: "+m+" day: "+d+" minute:"+minute);
                        }
                    });
                }
            }
        }
    }
});

let hash = {};
let date = new Date().getTime;
function save(minute, avg) {
    if (!hash[minute]) {
        hash[minute] = "";
    }
    hash[minute] += "," + avg;
    checkLast();
    date = new Date().getTime();
}
function checkLast() {
    setTimeout(() => {
        //console.log("check "+ (new Date().getTime() - date) +" "+date);
        if (new Date().getTime() - date > 998 * 5) {
            print();
            clientDB.close();
        }
    }, 5000);

}
function print() {
    console.log(hash);
    let lines = "";
    let min = "min";
    let q1 = "Q1";
    let median = "median";
    let q3 = "Q3";
    let max = "max";
    let diff_min = "Diff min";
    let diff_q1 = "Diff Q1";
    let diff_median = "Diff median";
    let diff_q3 = "Diff Q3";
    let diff_max = "Diff max";
    let avg = "avg";
    let range = "range";
    Object.keys(hash).forEach(function (key) {
        lines += key + hash[key] + "\n";

        const fields = hash[key].split(',');
        let minimum = 100;
        let maximum = 0;
        let average = 0;
        for (let i = 1; i < fields.length; i++) {
            minimum = Math.min(minimum, fields[i]);
            maximum = Math.max(maximum, fields[i]);
            average += parseFloat(fields[i]); 
        }
        min += "," + minimum.toFixed(4);
        const quartile_25 = Quartile(fields, 0.25);
        q1 += ","+ quartile_25;
        const quartile_50 = Quartile(fields, 0.5);
        median += ","+ quartile_50;
        const quartile_75 = Quartile(fields, 0.75);
        q3 += ","+ quartile_75;
        max += ","+ maximum.toFixed(4);
        avg += "," + (average/(fields.length-1));
        range += "," + (maximum-minimum).toFixed(4);
        diff_min += "," + minimum.toFixed(4);
        diff_q1 += "," + (quartile_25 - minimum).toFixed(4);
        diff_median += "," + (quartile_50 - quartile_25).toFixed(4);
        diff_q3 += "," + (quartile_75 - quartile_50).toFixed(4);
        diff_max += "," + (maximum - quartile_75).toFixed(4);
    });
    lines += "\n";
    lines += "\n";
    
    lines += "statistic,7,8,9,10,11,12,13,14,15,16,17,18,19\n";
    lines += min + "\n";
    lines += q1 + "\n";
    lines += median + "\n";
    lines += q3 + "\n";
    lines += max + "\n";
    lines += avg + "\n";
    lines += range + "\n";

    lines += "\n";
    lines += "\n";

    lines += diff_min + "\n";
    lines += diff_q1 + "\n";
    lines += diff_median + "\n";
    lines += diff_q3 + "\n";
    lines += diff_max + "\n";

    fs.writeFile('resultCpu.csv', lines, function (err) {
        if (err) throw err;
    });
    fs.writeFile('resultRawCpu.txt', lines, function (err) {
        if (err) throw err;
    });
}

function checkValidDay(day, month, year) {
    if (
        //october
        (day === 15 && month === 10 && year === 2018)
        ||
        //november
        ((day === 5 || day === 12) && month === 11 && year === 2018)
    ) {
        return false;
    }
    let myDate = new Date(year, month - 1, day);
    if (myDate.getDay() === 6 || myDate.getDay() === 0) {
        // weekend
        return false;
    }
    return true;
}


function Quartile(data, q) {
    data = Array_Sort_Numbers(data);
    var pos = ((data.length) - 1) * q;
    var base = Math.floor(pos);
    var rest = pos - base;
    if ((data[base + 1] !== undefined)) {
        const res = data[base] + rest * (data[base + 1] - data[base]);
        return parseFloat(parseFloat(res).toFixed(4));
    } else {
        return parseFloat(parseFloat(data[base]).toFixed(4));
    }
}

function Array_Sort_Numbers(inputarray) {
    return inputarray.sort(function (a, b) {
        return a - b;
    });
}
