import express from "express";
import { Mongo } from "./mongo";
import { generateId, generateKey } from "./utils";
import { broker } from "./broker";
import { Topic } from "./topic";
import { Subscriber } from "./subscriber";
import { Publisher } from "./publisher";

export function restApi(app: express.Application) {
    app.use(express.json());

    app.get("/", async (req, res) => {
        if (await auth(req, res)) return;
        res.send("OK");
    });

    app.get("/forgemasterkey", async (req, res) => {
        const masterkey = await Mongo.masterkey();
        if (masterkey) {
            res.send(masterkey);
        } else {
            res.status(404).send("Not found");
        }
    });

    app.get("/forgekey", async (req, res) => {
        if (await masterkey(req, res)) return;
        const key = generateKey();
        Mongo.addKey(key);
        res.send(key);
    });

    app.post("/topic/create", async (req, res) => {
        if (await auth(req, res)) return;
        const { name } = req.body;
        const topic = Topic.create(name);
        Mongo.updateTopic(topic);
        broker.topics.set(topic.id, topic);
        res.send();
    });

    app.get("/topic/list", async (req, res) => {
        if (await auth(req, res)) return;
        const topics = await Mongo.getTopics();
        res.send(topics);
    });

    app.post("/subscriber/create", async (req, res) => {
        if (await auth(req, res)) return;
        const { config, name, type, memory } = req.body;
        const id = generateId();

        const subscriber = Subscriber.fromData({
            id,
            name,
            type,
            config,
            memory
        });

        Mongo.updateSubscriber(subscriber.getData());
        broker.subscribers.set(id, subscriber);
        res.send(id);
    });


    app.get("/subscriber/list", async (req, res) => {
        if (await auth(req, res)) return;
        const subscribers = await Mongo.getSubscribers();
        res.send(subscribers);
    });

    app.post("/publisher/create", async (req, res) => {
        if (await auth(req, res)) return;
        const { config, name, type, memory } = req.body;
        const id = generateId();

        const publisher = Publisher.fromData({
            id,
            name,
            type,
            config,
            memory
        });

        Mongo.updatePublisher(publisher.getData());
        broker.publishers.set(id, publisher);
        res.send(id);
    });


    app.get("/publisher/list", async (req, res) => {
        if (await auth(req, res)) return;
        const publishers = await Mongo.getPublishers();
        res.send(publishers);
    });


    app.listen(process.env.api_port ?? 80);
}

async function auth(req: express.Request, res: express.Response) {
    const auth = req.header("X-API-Token");
    if (auth != undefined) {
        if (await Mongo.isValidKey(auth)) return false;
    }
    res.status(401).send("Unauthorized");
    return true;
}


async function masterkey(req: express.Request, res: express.Response) {
    const auth = req.header("X-API-Token");
    if (auth != undefined) {
        if (await Mongo.isMasterKey(auth)) return false;
    }
    res.status(401).send("Unauthorized");
    return true;
}