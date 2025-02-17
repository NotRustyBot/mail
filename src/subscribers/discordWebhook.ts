import { Message } from "../message";
import { Subscriber } from "../subscriber";

export class DiscordWebhook extends Subscriber {
    type = "DiscordWebhook";
    config: { url: string } = { url: "" };
    processMessage(message: Message): void {
        fetch(this.config.url, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: `${message.content}`.substring(0, 2000),
            }),
        });
    }
}
