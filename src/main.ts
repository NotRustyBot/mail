import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

const client = new ImapFlow({
    auth: {
        user: "jacekmunipolis@email.cz",
        pass: process.env.password,
    },
    host: "imap.seznam.cz",
    port: 993,
    logger: false,
    logRaw: false,
});

const main = async () => {
    // Wait until client connects and authorizes
    await client.connect();

    await processBox("INBOX");
    await processBox("newsletters");

    await client.logout();
};

async function processBox(boxName: string) {
    let lock = await client.getMailboxLock(boxName);
    try {
        for await (let message of client.fetch({ seen: false }, { source: true })) {
            simpleParser(message.source).then((mail) => {
                let toSend = mail.text;
                if (mail.from.value.find(e => e.address == "info@munipolis.cz")) toSend = cleanMunipolis(toSend);
                console.log(toSend);
                
                fetch("https://discord.com/api/webhooks/1205190222539919360/y76JGOjk72DFuv1CSzmEtyWdbyprlY-sNNGsE7wSa6FtLhLGGF8QWrPn6g5UkhDOUYX7", {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: `**${mail.subject}**\n---\n${toSend}`.substring(0, 2000),
                    }),
                })
            });
        }
    } catch (err) {
        console.log(err);
    }

    lock.release();
}

setInterval(() => {
    main().catch((err) => console.error(err));
}, 1000 * 60);


export function cleanMunipolis(text: string) {
    text = text.split("-\n\nNastavení upozornění")[0];
    text = text.split("Nezobrazuje se Vám E-mail správně?")[1];
    return text;
}
