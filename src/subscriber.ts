import { broker } from "./broker";
import { Message } from "./message";
import { Mongo } from "./mongo";
import { Topic } from "./topic";
import { config, id } from "./utils";

export class Subscriber {

    id: id;
    name: string;
    type: string;
    config: config;
    memory: any;
    topics = new Map<id, Topic>();

    init() {}

    receiveMessage(message: Message) {
        try {
            this.processMessage(message);
        } catch (error) {
            this.log(error.message, "error");
        }
    }

    processMessage(message: Message) {}

    subscribe(topic: Topic) {
        this.topics.set(topic.id, topic);
        topic.subscribe(this);
    }

    unsubscribe(topic: Topic) {
        this.topics.delete(topic.id);
        topic.unsubscribe(this);
    }

    log(message: string, severity: "info" | "warn" | "error" = "info") {
        Mongo.log(`${this.type}:${this.name} [${this.id}]`, message, severity);
    }

    remove() {
        for (const [_, topic] of this.topics) {
            topic.unsubscribe(this);
        }
    }

    static factoryLookup: { [key: string]: typeof Subscriber } = {};

    static fromData(data: unknown): Subscriber {
        if (isSubscriberData(data)) {
            const subscriber = new this.factoryLookup[data.type]();
            subscriber.id = data.id;
            subscriber.name = data.name;
            subscriber.type = data.type;
            subscriber.config = data.config;
            subscriber.memory = data.memory;

            for (const topicId of data.topics) {
                const topic = broker.topics.get(topicId);
                if (!topic) continue;
                subscriber.subscribe(topic);
            }

            return subscriber;
        }
        throw new Error("Invalid subscriber data");
    }

    getData() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            config: this.config,
            memory: this.memory,
            topics: Array.from(this.topics.keys()),
        };
    }

    store() {
        Mongo.updateSubscriber(this.getData());
    }
}

export function isSubscriberData(data: unknown): data is SubscriberData {
    return typeof data === "object" && data !== null && "id" in data && "name" in data;
}

export class SubscriberData {
    id: id;
    name: string;
    type: string;
    config: config;
    memory: any;
    topics: id[];
}
