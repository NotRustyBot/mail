import { Db, MongoClient } from "mongodb";
import { TopicData } from "./topic";
import { SubscriberData } from "./subscriber";
import { PublisherData } from "./publisher";
import { generateId, generateKey } from "./utils";

export class Mongo {

    static db: Db;
    static async connect() {
        const mongourl = process.env.mongo_url ?? "mongodb://10.200.140.14:27017";
        const client = new MongoClient(mongourl);
        await client.connect();
        console.log("Connected successfully to mongo");
        this.db = client.db("grapevine");
    }

    static getTopics() {
        return this.db.collection("topics").find().toArray();
    }

    static getSubscribers() {
        return this.db.collection("subscribers").find().toArray();
    }

    static getPublishers() {
        return this.db.collection("publishers").find().toArray();
    }

    static async isValidKey(key: string) {
        const res = await this.db.collection("keys").findOne({ key });
        return res !== null;
    }

    static async isMasterKey(key: string) {
        const res = await this.db.collection("keys").findOne({ key, master: true });
        return res !== null;
    }

    static addKey(key: string) {
        this.db.collection("keys").insertOne({ key, master: false });
    }

    static removeKey(key: string) {
        this.db.collection("keys").deleteOne({ key });
    }

    static async masterkey() {
        const res = await this.db.collection("keys").findOne({ master: true });
        if (res === null) {
            const key = generateKey();
            this.db.collection("keys").insertOne({ key, master: true });
            return key;
        }
        return false;
    }

    static updateTopic(topic: TopicData) {
        this.db.collection("topics").updateOne({ id: topic.id }, { $set: topic }, { upsert: true });
    }

    static updateSubscriber(subscriber: SubscriberData) {
        this.db.collection("subscribers").updateOne({ id: subscriber.id }, { $set: subscriber }, { upsert: true });
    }

    static updatePublisher(publisher: PublisherData) {
        this.db.collection("publishers").updateOne({ id: publisher.id }, { $set: publisher }, { upsert: true });
    }

    static log(source: string, message: string, severity: "info" | "warn" | "error" = "info") {
        this.db.collection("log").insertOne({ date: new Date(), source, message, severity });
    }

    static deleteSubscriber(id: string) {
        return this.db.collection("subscribers").deleteOne({ id });
    }

    static deletePublisher(id: string) {
        return this.db.collection("publishers").deleteOne({ id });
    }

    static deleteTopic(id: string) {
        return this.db.collection("topics").deleteOne({ id });
    }

    static async getLog() {
        return this.db.collection("log").find().sort({ date: -1 }).toArray();        
    }
}
