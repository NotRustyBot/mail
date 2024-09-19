"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanMunipolis = void 0;
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
const main = async () => {
    const client = new imapflow_1.ImapFlow({
        auth: {
            user: "jacekmunipolis@email.cz",
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
async function processBox(boxName, client) {
    let lock = await client.getMailboxLock(boxName);
    try {
        for await (let message of client.fetch({ seen: false }, { source: true })) {
            let mail = await (0, mailparser_1.simpleParser)(message.source);
            let toSend = mail.text;
            if (mail.from.value.find((e) => e.address == "info@munipolis.cz"))
                toSend = cleanMunipolis(toSend);
            fetch("https://discord.com/api/webhooks/1205190222539919360/y76JGOjk72DFuv1CSzmEtyWdbyprlY-sNNGsE7wSa6FtLhLGGF8QWrPn6g5UkhDOUYX7", {
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
    }
    catch (err) {
        console.log(err);
    }
    lock.release();
}
setInterval(() => {
    main().catch((err) => console.error(err));
}, 1000 * 60);
main().catch((err) => console.error(err));
function cleanMunipolis(text) {
    text = text.split("-\n\nNastavení upozornění")[0];
    text = text.split("Nezobrazuje se Vám E-mail správně?")[1];
    return text;
}
exports.cleanMunipolis = cleanMunipolis;
