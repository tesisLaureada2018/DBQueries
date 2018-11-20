const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
//const urlMongo = 'mongodb://157.253.205.96:27017/performance_collector_unacloud';
const urlMongo = 'mongodb://localhost:27017/performance_collector_unacloud';

MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    clientDB = client;
    var collectionP = client.db('performance_collector_unacloud').collection('MetricsCollection');
    //Recuperar el estado de las maquinas 
    // justo antes de que fallen
    collectionP.find({ $or: [ 
        { unacloud_status: 0 }, 
        { virtualbox_status: 0 },
        { "unacloud_disk.percent" : { $gte: 50 } },
        { "ram.percent" : { $gte: 50 } },
        { "swap.percent" : { $gte: 50 } },
        { cpu : { $gte: 50 } }
     ] 
    }).limit(10000).toArray(function (err, docs) {
        if (err) console.log(err);
        if (docs.length > 0) {
            let lines = "";
            for(let i =0;i< docs.length; i++){
                let doc = docs[i];
                lines += doc.ram.percent+","+
                        doc.swap.percent+","+
                        doc.cpu+","+doc.disk.percent+"\n";
            }
            fs.writeFile('matrix.csv', lines, function (err) {
                if (err) throw err;
            });
        }
        else{
            console.log("no docs");
        }
        client.close();
    });
});