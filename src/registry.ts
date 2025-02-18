import { Publisher } from "./publisher";
import EmailPublisher from "./publishers/emailPublisher";
import { GithubIssueCounterPublisher } from "./publishers/githubIssueCounterPublisher";
import { WebhookPublisher } from "./publishers/webhookPublisher";
import { Subscriber } from "./subscriber";
import { DiscordWebhook } from "./subscribers/discordWebhook";
import { EmailSubscriber } from "./subscribers/emailSubscriber";

export function registerFactories() {
    Publisher.factoryLookup["EmailPublisher"] = EmailPublisher;
    Publisher.factoryLookup["GithubIssueCounterPublisher"] = GithubIssueCounterPublisher;
    Publisher.factoryLookup["WebhookPublisher"] = WebhookPublisher;

    Subscriber.factoryLookup["DiscordWebhook"] = DiscordWebhook;
    Subscriber.factoryLookup["EmailSubscriber"] = EmailSubscriber;
}
