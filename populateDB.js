var MongoClient = require('mongodb').MongoClient;
const urlMongo = 'mongodb://localhost:27017/performance_collector_unacloud';

const documents = require("./documents.json");
//console.log(documents);

MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    var collectionP = client.db('performance_collector_unacloud').collection('MetricsCollection');
    for(let i=0; i< documents.length; i++){
        collectionP.insertOne(documents[i], function (error, result) {
            if (error) { console.log(error); }
            if (result) { console.log("Saved"); }
            if(i +1 === documents.length){
                client.close();
            }
        });
    }
});
