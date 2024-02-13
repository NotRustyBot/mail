import Imap from "imap"
import { simpleParser } from "mailparser"
import { openBox } from "./asyncImap"
import { cleanMunipolis } from "./parser"
import { exec, execSync } from "child_process";
import { log } from "console";
const imapConfig = {
    user: "jacekmunipolis@email.cz",
    password: process.env.password,
    host: "imap.seznam.cz",
    port: 993,
    tls: true,
};

const imap = new Imap(imapConfig);
console.log(execSync("git log -1 --abbrev-commit --format=%h", { encoding: "utf-8" }));
setInterval(() => {
    imap.once('ready', async () => {
        await Promise.all([openBox(imap, "INBOX"), openBox(imap, "newsletters")]);
        console.log("checking...");
        imap.search(['UNSEEN'], (err, results) => {
            if (results.length == 0) return;
            console.log("new: " + results.length);

            const f = imap.fetch(results, { bodies: '' });
            f.on('message', msg => {
                msg.on('body', stream => {
                    simpleParser(stream as any, async (err, parsed) => {
                        console.log(parsed.subject);
                        let toSend = parsed.text;
                        if (parsed.from.value.find(e => e.address == "info@munipolis.cz")) toSend = cleanMunipolis(toSend);
                        fetch("https://discord.com/api/webhooks/1205190222539919360/y76JGOjk72DFuv1CSzmEtyWdbyprlY-sNNGsE7wSa6FtLhLGGF8QWrPn6g5UkhDOUYX7", {
                            method: "post",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                content: `**${parsed.subject}**\n---\n${toSend}`
                            }),
                        })
                    });
                });
                msg.once('attributes', attrs => {
                    const { uid } = attrs;
                    imap.addFlags(uid, ['\\Seen'], () => {
                        console.log('Marked as read!');
                    });
                });
            });
            f.once('error', ex => {
                return Promise.reject(ex);
            });
            f.once('end', () => {
                console.log('Done fetching all messages!');
                imap.end();
            });
        });
    })

    imap.connect();
}, 60 * 1000)

imap.on("error", (ex: any) => {
    console.log(ex);
});