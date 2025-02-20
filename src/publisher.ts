import { broker } from "./broker";
import { Message } from "./message";
import { Mongo } from "./mongo";
import { Topic } from "./topic";
import { config, id } from "./utils";

export class Publisher {
    id!: id;
    name!: string;
    type!: string;
    topics = new Map<id, Topic>();
    config: config = {};
    memory: any = {};

    init() {}

    addTopic(topic: Topic) {
        this.topics.set(topic.id, topic);
        topic.addPublisher(this);
    }

    removeTopic(topic: Topic) {
        this.topics.delete(topic.id);
        topic.removePublisher(this);
    }

    publish(message: Message) {
        for (const [id, topic] of this.topics) {
            topic.publish(message);
        }
    }

    log(message: string, severity: "info" | "warn" | "error" = "info") {
        Mongo.log(`${this.type}:${this.name} [${this.id}]`, message, severity);
    }

    remove() {
        for (const [id, topic] of this.topics) {
            topic.removePublisher(this);
        }
    }

    static factoryLookup: { [key: string]: typeof Publisher } = {};

    static fromData(data: unknown): Publisher {
        try {
            if (isPublisherData(data)) {
                const publisher = new this.factoryLookup[data.type]();
                publisher.id = data.id;
                publisher.name = data.name;
                publisher.type = data.type;
                publisher.config = data.config;
                publisher.memory = data.memory;

                for (const topicId of data.topics ?? []) {
                    const topic = broker.topics.get(topicId);
                    if (!topic) continue;
                    publisher.addTopic(topic);
                }

                return publisher;
            } else {
                throw new Error("Invalid publisher data: " + JSON.stringify(data));
            }
        } catch (error) {
            Mongo.log("Publisher", error);
        }
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
        Mongo.updatePublisher(this.getData());
    }
}

export function isPublisherData(data: unknown): data is PublisherData {
    return typeof data === "object" && data !== null && "id" in data && "name" in data;
}

export type PublisherData = {
    id: id;
    name: string;
    type: string;
    config: config;
    memory: any;
    topics: id[];
};
