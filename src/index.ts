import { Broker } from "./broker";
import { Mongo } from "./mongo";
import { registerFactories } from "./registry";

async function start() {
    registerFactories();
    await Mongo.connect();
    let b = new Broker();
    b.load();
    Mongo.log("process", "Started");
}

start();
