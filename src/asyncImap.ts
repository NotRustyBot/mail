import Imap from "imap";

export function openBox(imap: Imap, box: string) {
    return new Promise((resolve, reject) => {
        imap.openBox(box, false, (err, box) => {
            if (err) {
                reject(err); 
            } else {
                resolve(box);
            }
        });
    });
}