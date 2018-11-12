const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
//const urlMongo = 'mongodb://157.253.205.96:27017/performance_collector_unacloud';
const urlMongo = 'mongodb://localhost:27017/performance_collector_unacloud';

let clientDB = null;

MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    clientDB = client;
    var collectionP = client.db('performance_collector_unacloud').collection('MetricsCollection');
    for (let i = 8; i < 19; i++) {
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
    hash[minute] += avg + ",";
    checkLast();
    date = new Date().getTime();
}
function checkLast() {
    setTimeout(() => {
        //console.log("check "+ (new Date().getTime() - date) +" "+date);
        if (new Date().getTime() - date > 1000 * 5) {
            print();
            clientDB.close();
        }
    }, 5000);

}
function print() {
    //console.log("print");
    console.log(hash);
}

/*
fs.appendFileSync('resultRaw.txt', JSON.stringify(docs), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
*/

function checkValidDay(day, month, year) {
    if (
        //october
        (day === 15 && month === 10 && year === 2018)
        ||
        //november
        (( day === 5 || day === 12 ) && month === 11 && year === 2018)
    ) {
        return false;
    }
    let myDate = new Date(year, month-1, day);
    if(myDate.getDay() === 6 || myDate.getDay() === 0) {
        // weekend
        return false;
    }
    return true;
}