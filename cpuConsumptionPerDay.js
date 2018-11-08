var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
//const urlMongo = 'mongodb://157.253.205.96:27017/performance_collector_unacloud';
const urlMongo = 'mongodb://localhost:27017/performance_collector_unacloud';
/*
MongoClient.connect(urlMongo, function (err, db) {
    if (err) throw err;
    var collectionP = db.collection('MetricsCollection');
    collectionP.insertOne(newMetric, function (error, result) {
        if (error) { console.log(error); res.json(error); }
        //if (result) { res.json("Saved"); }
    });
    db.close();
});
*/
fs.writeFile('mynewfile3.txt', 'Hello content!', function (err) {
    if (err) throw err;
    console.log('Saved!');
});
