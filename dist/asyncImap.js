"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openBox = void 0;
function openBox(imap, box) {
    return new Promise((resolve, reject) => {
        imap.openBox(box, false, (err, box) => {
            if (err) {
                reject(err); // If there's an error, reject the promise with the error
            }
            else {
                resolve(box); // If successful, resolve the promise with the mailbox information
            }
        });
    });
}
exports.openBox = openBox;
