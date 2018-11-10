const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const urlMongo = 'mongodb://157.253.205.96:27017/performance_collector_unacloud';
//const urlMongo = 'mongodb://localhost:27017/performance_collector_unacloud';

MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, client) {
    if (err) throw err;
    var collectionP = client.db('performance_collector_unacloud').collection('MetricsCollection');
    for(let i= 8; i< 19; i++){
        const year = 2018;
        let minute = i;
        let minute2 = i+1;
        //months 10 y 11
        for(let m=10;m<12;m++){
            //days 10 y 11
            for(let d=0;d<31;d++){
                collectionP.find({"timestamp":{$gte: year+"-"+m+"-"+(d<9? '0'+d: d)+"T"+(minute<10?"0"+minute:minute)+":00:00", $lt:  year+"-"+m+"-"+(d<9? '0'+d: d)+"T"+(minute2<10?"0"+minute2:minute2)+":00:00"}}).toArray(function (err, docs) {
                    if (err) console.log(err);
                    if(docs.length > 0){
                        //Promedio del minuto "minute" para el dia d month m
                        let avg = 0;
                        for(let j=0;j< docs.length; j++){
                            avg += docs[j].cpu;
                        }
                        avg /= docs.length;
                        console.log("m: "+m+" d: "+d+" min: "+minute+" avg: "+avg);
                        save(minute, avg);
                    }
                    else{
                        //console.log("no docs for month: "+m+" day: "+d+" minute:"+minute);
                    }
                });
            }
        }
    }
});

let hash = {};
let date = new Date().getTime;
function save (minute, avg){
    if(!hash[minute]){
        hash[minute] = minute;
    } 
    hash[minute] += ","+avg;
    checkLast();
    date = new Date().getTime();
}
function checkLast(){
    setTimeout(()=>{
        //console.log("check "+ (new Date().getTime() - date) +" "+date);
        if(new Date().getTime() - date > 1000*4){
            print();
        }
    }, 5000);
    
}
function print (){
    //console.log("print");
    console.log(hash);
}

/*
fs.appendFileSync('resultRaw.txt', JSON.stringify(docs), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
*/