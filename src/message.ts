import { generateId } from "./utils";

export class Message {
    id!: string;
    content!: string;
    title?: string;

    static create(data: Partial<Message>): Message {
        const message = Object.assign(new Message(), data);
        message.id = generateId();
        return message;
    }
}