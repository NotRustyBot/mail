import Imap from "imap"
import { simpleParser } from "mailparser"

const imapConfig = {
    user: 'jacekmunipolis@email.cz',
    password: process.env.password,
    host: 'imap.seznam.cz',
    port: 993,
    tls: true,
};

const imap = new Imap(imapConfig);
imap.once('ready', () => {
    console.log("ready!");
    imap.openBox('INBOX', false, () => {
        setInterval(() => {
            console.log("checking...");
            imap.search(['UNSEEN', ['SINCE', new Date()]], (err, results) => {
                const f = imap.fetch(results, { bodies: '' });
                f.on('message', msg => {
                    msg.on('body', stream => {
                        simpleParser(stream as any, async (err, parsed) => {
                            console.log(parsed.subject);
                            fetch("https://discord.com/api/webhooks/1205190222539919360/y76JGOjk72DFuv1CSzmEtyWdbyprlY-sNNGsE7wSa6FtLhLGGF8QWrPn6g5UkhDOUYX7", {
                                method: "post",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    content: `**${parsed.subject}**\n---\n${parsed.text}`
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
        }, 60 * 1000)
    });
})

imap.on("error", (ex: any) => {
    console.log(ex);
});

imap.connect();