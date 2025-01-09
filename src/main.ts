import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import fs from "fs";

const main = async () => {
    const client = new ImapFlow({
        auth: {
            user: process.env.email,
            pass: process.env.password,
        },
        host: "imap.seznam.cz",
        port: 993,
        logger: false,
        logRaw: false,
    });

    await client.connect();

    await processBox("INBOX", client);
    await processBox("newsletters", client);

    await client.logout();
};

async function processBox(boxName: string, client: ImapFlow) {
    let lock = await client.getMailboxLock(boxName);
    try {
        for await (let message of client.fetch({ seen: false }, { source: true })) {
            let mail = await simpleParser(message.source);
            let toSend = mail.text;
            if (mail.from.value.find((e) => e.address == "info@munipolis.cz")) toSend = cleanMunipolis(toSend);

            fetch(process.env.webhook, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: `**${mail.subject}**\n---\n${toSend}`.substring(0, 2000),
                }),
            });
        }
        await client.messageFlagsSet({ seen: false }, ["\\Seen"]);
    } catch (err) {
        console.log(err);
    }

    lock.release();
}

setInterval(() => {
    main().catch((err) => console.error(err));
}, 1000 * 60);
main().catch((err) => console.error(err));

export function cleanMunipolis(text: string) {
    text = text.split("Nastavení upozornění na zprávy z webu můžete")[0];
    return text;
}
