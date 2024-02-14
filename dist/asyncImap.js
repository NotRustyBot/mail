"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openBox = void 0;
function openBox(imap, box) {
    return new Promise((resolve, reject) => {
        imap.openBox(box, false, (err, box) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(box);
            }
        });
    });
}
exports.openBox = openBox;
