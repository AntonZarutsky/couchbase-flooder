const YAML = require('yamljs');
const couchbase = require('couchbase');
const path = require('path');
const uuidv1 = require('uuid/v1');


const config = YAML.load(path.join(__dirname, './config.yaml'));

console.log("Lets flood it....");

let dbConf = config.storage;
let dataConf = config.data;
let logConf = config.logger;

let cluster = new couchbase.Cluster(`couchbase://${dbConf.nodes}/`);
cluster.authenticate({ username: dbConf.username, password: dbConf.password });

let bucket = cluster.openBucket(dbConf.bucket, "", (err, res) => err ? console.log(err) : console.log("Bucket was opened."));

let step = logConf.step * dataConf.entitiesAmount / 100;

let counter = 0;
for (i = 0; i < dataConf.entitiesAmount; i++ ){
  bucket.upsert(`test:${uuidv1()}`, obj(i), dataConf.writeOpts, (q,w) => {
    counter++;

    if (counter % step == 0){
      console.log(`${100 * counter/dataConf.entitiesAmount}% done`)
    }
    if (counter == dataConf.entitiesAmount){
      bucket.disconnect();
    }
  });
}

// TODO
function obj(i) {
  return {
    id: uuidv1(),
    data: `Whatever you want N ${i}`
  }
}







