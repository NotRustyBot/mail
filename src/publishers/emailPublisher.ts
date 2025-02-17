import { Publisher } from "../publisher";
import { simpleParser } from "mailparser";
import { ImapFlow } from "imapflow";
import { Message } from "../message";
import cron from "node-cron";

export default class EmailPublisher extends Publisher {
    type = "EmailPublisher";

    config = {
        host: "",
        port: "",
        username: "",
        password: "",
        interval: "",
    };

    init() {
        cron.schedule(this.config.interval, () => this.cycle());
    }

    async cycle() {
        try {
            const client = new ImapFlow({
                auth: {
                    user: this.config.username,
                    pass: this.config.password,
                },
                host: this.config.host,
                port: Number(this.config.port),
                logger: false,
                logRaw: false,
            });
    
            await client.connect();
    
            await this.processBox("INBOX", client);
            await this.processBox("newsletters", client);
    
            await client.logout();
        } catch (error) {
            this.log(error.message, "error");
        }
    }

    async processBox(boxName: string, client: ImapFlow) {
        let lock = await client.getMailboxLock(boxName);
        try {
            for await (let mailMessage of client.fetch({ seen: false }, { source: true })) {
                let mail = await simpleParser(mailMessage.source);
                let toSend = mail.text;
                const message = Message.create({ content: toSend });
                this.publish(message);
            }
            await client.messageFlagsSet({ seen: false }, ["\\Seen"]);
        } catch (err) {
            console.log(err);
        }

        lock.release();
    }
}
