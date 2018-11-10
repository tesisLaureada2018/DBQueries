const MongoClient = require('mongodb').MongoClient;
const urlMongo = 'mongodb://157.253.205.96:27017/performance_collector_unacloud';
//const urlMongo = 'mongodb://localhost:27017/performance_collector_unacloud';

MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    var collectionP = client.db('performance_collector_unacloud').collection('MetricsCollection');

    const d = "18";
    const m = 10;
    const minute1 = "08";
    const minute2 = "09";
    collectionP.find({ "timestamp": { $gte:"2018-" + m + "-" + d + "T" + minute1 + ":00:00", $lt: "2018-" + m + "-" + d + "T" + minute2 + ":00:00" } }).toArray(function (err, docs) {
        if (err) console.log(err);
        if (docs.length > 0) {
            //Promedio del minuto "minute" para el dia d month m
            let avg = 0;
            for (let j = 0; j < docs.length; j++) {
                avg += docs[j].cpu;
            }
            avg /= docs.length;
            console.log("month:"+m+" day:"+d + " minute:" + minute + " avg:" + avg);

        }
        else{
            console.log("no docs");
        }
        client.close();
    });
})