import { Message } from "./message";
import { Mongo } from "./mongo";
import { Publisher } from "./publisher";
import { Subscriber } from "./subscriber";
import { generateId, id } from "./utils";

export class Topic {
    id: id;
    name: string;
    subscribers = new Map<id, Subscriber>();
    publishers = new Map<id, Publisher>();

    publish(message: Message) {
        for (const [id, subscriber] of this.subscribers) {
            subscriber.receiveMessage(message);
        }
    }

    addPublisher(publisher: Publisher) {
        this.publishers.set(publisher.id, publisher);
    }

    removePublisher(publisher: Publisher) {
        this.publishers.delete(publisher.id);
    }

    subscribe(subscriber: Subscriber) {
        this.subscribers.set(subscriber.id, subscriber);
    }

    unsubscribe(subscriber: Subscriber) {
        this.subscribers.delete(subscriber.id);
    }

    store() {
        Mongo.updateTopic({
            id: this.id,
            name: this.name,
        });
    }

    static fromData(data: unknown): Topic {
        const topic = new Topic();
        if (isTopicData(data)) {
            topic.id = data.id;
            topic.name = data.name;
            return topic;
        }
        throw new Error("Invalid topic data");
    }

    static create(name: string): Topic {
        const topic = new Topic();
        topic.name = name;
        topic.id = generateId();
        return topic;
    }
}

export function isTopicData(data: unknown): data is TopicData {
    return typeof data === "object" && data !== null && "id" in data && "name" in data;
}

export type TopicData = {
    id: id;
    name: string;
};
