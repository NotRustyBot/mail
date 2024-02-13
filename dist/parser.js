"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanMunipolis = void 0;
function cleanMunipolis(text) {
    text = text.split("-\n\nNastavení upozornění")[0];
    text = text.split("Nezobrazuje se Vám E-mail správně?")[1];
    return text;
}
exports.cleanMunipolis = cleanMunipolis;
