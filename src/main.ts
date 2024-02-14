import Imap from "imap"
import { simpleParser } from "mailparser"
import { openBox } from "./asyncImap"
import { cleanMunipolis } from "./parser"
const imapConfig = {
    user: "jacekmunipolis@email.cz",
    password: process.env.password,
    host: "imap.seznam.cz",
    port: 993,
    tls: true,
};

const imap = new Imap(imapConfig);
console.log("---");

async function processBox() {
    return new Promise<void>((resolve, reject) => {
        let busy = 2;
        const solve = () => {
            busy--;
            if (busy <= 0) resolve();
        }
        imap.search(['UNSEEN'], (err, results) => {
            console.log("new: " + results.length);
            if (results.length == 0) {
                solve();
                return;
            }

            busy += results.length;
            solve();

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
                        solve();
                    });
                });
            });
            f.once('error', ex => {
                return reject(ex);
            });
            f.once('end', () => {
                solve();
            });
        });
    });
}

setInterval(() => {
    imap.once('ready', async () => {
        console.log("checking...");
        await openBox(imap, "INBOX");
        await processBox();
        await openBox(imap, "newsletters");
        await processBox();
        imap.end();
    })

    imap.connect();
}, 60 * 1000);

imap.on("error", (ex: any) => {
    console.log(ex);
});