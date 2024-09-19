"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanMunipolis = void 0;
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
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
const main = async () => {
    // Wait until client connects and authorizes
    await client.connect();
    await processBox("INBOX");
    await processBox("newsletters");
    await client.logout();
};
async function processBox(boxName) {
    let lock = await client.getMailboxLock(boxName);
    try {
        for await (let message of client.fetch({ seen: false }, { source: true })) {
            (0, mailparser_1.simpleParser)(message.source).then((mail) => {
                let toSend = mail.text;
                if (mail.from.value.find(e => e.address == "info@munipolis.cz"))
                    toSend = cleanMunipolis(toSend);
                console.log(toSend);
                fetch("https://discord.com/api/webhooks/1205190222539919360/y76JGOjk72DFuv1CSzmEtyWdbyprlY-sNNGsE7wSa6FtLhLGGF8QWrPn6g5UkhDOUYX7", {
                    method: "post",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        content: `**${mail.subject}**\n---\n${toSend}`.substring(0, 2000),
                    }),
                });
            });
        }
    }
    catch (err) {
        console.log(err);
    }
    lock.release();
}
main().catch((err) => console.error(err));
function cleanMunipolis(text) {
    text = text.split("-\n\nNastavení upozornění")[0];
    text = text.split("Nezobrazuje se Vám E-mail správně?")[1];
    return text;
}
exports.cleanMunipolis = cleanMunipolis;
