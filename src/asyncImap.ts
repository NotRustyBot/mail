import Imap from "imap";

export function openBox(imap: Imap, box: string) {
    return new Promise((resolve, reject) => {
        imap.openBox(box, false, (err, box) => {
            if (err) {
                reject(err); // If there's an error, reject the promise with the error
            } else {
                resolve(box); // If successful, resolve the promise with the mailbox information
            }
        });
    });
}