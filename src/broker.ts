import { Mongo } from "./mongo";
import { Publisher } from "./publisher";
import { Subscriber } from "./subscriber";
import { Topic, TopicData } from "./topic";
import { config, generateId, id } from "./utils";
import express from "express";
import { restApi } from "./restapi";

export let broker: Broker = undefined as unknown as Broker;

export class Broker {
    topics = new Map<id, Topic>();
    subscribers = new Map<id, Subscriber>();
    publishers = new Map<id, Publisher>();

    app: express.Application;

    constructor() {
        broker = this;
        this.app = express();
    }

    async load() {
        restApi(this.app);
        const topics = await Mongo.getTopics();
        for (const topic of topics) {
            let newTopic = Topic.fromData(topic);
            this.topics.set(newTopic.id, newTopic);
        }

        const subscribers = await Mongo.getSubscribers();
        for (const subscriber of subscribers) {
            let newSubscriber = Subscriber.fromData(subscriber);
            this.subscribers.set(newSubscriber.id, newSubscriber);
        }

        const publishers = await Mongo.getPublishers();
        for (const publisher of publishers) {
            let newPublisher = Publisher.fromData(publisher);
            this.publishers.set(newPublisher.id, newPublisher);
        }

        for (const [_, subscriber] of this.subscribers) {
            for (const [_, topic] of subscriber.topics) {
                subscriber.subscribe(topic);
            }

            subscriber.init();
        }

        for (const [_, publisher] of this.publishers) {
            for (const [_, topic] of publisher.topics) {
                publisher.addTopic(topic);
            }
            publisher.init();
        }
    }

    refreshPublisher(id: id, config: config) {
        const publisher = this.publishers.get(id);
        if (!publisher) {
            Mongo.log("process", `Publisher ${id} not found`);
            return;
        }

        const data = publisher.getData();
        data.config = config;
        publisher.remove();
        this.publishers.set(id, Publisher.fromData(data));
    }

    refreshSubscriber(id: id, config: config) {
        const subscriber = this.subscribers.get(id);
        if (!subscriber) {
            Mongo.log("process", `Subscriber ${id} not found`);
            return;
        }

        const data = subscriber.getData();
        data.config = config;
        subscriber.remove();
        this.subscribers.set(id, Subscriber.fromData(data));
    }
}
