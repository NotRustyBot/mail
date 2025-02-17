import { Publisher } from "./publisher";
import EmailPublisher from "./publishers/emailPublisher";
import { Subscriber } from "./subscriber";
import { DiscordWebhook } from "./subscribers/discordWebhook";

export function registerFactories() {
    Publisher.factoryLookup["EmailPublisher"] = EmailPublisher;


    Subscriber.factoryLookup["DiscordWebhook"] = DiscordWebhook;
}
