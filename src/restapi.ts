import express from "express";
import { Mongo } from "./mongo";
import { generateKey } from "./utils";

export function restApi(app: express.Application) {
    app.get("/", async (req, res) => {
        if (await auth(req, res)) return;
        res.send("OK");
    });

    app.get("/forgemasterkey", async (req, res) => {
        const masterkey = await Mongo.masterkey();
        if (masterkey) {
            res.send(masterkey);
        } else {
            res.status(404).send("Not found");
        }
    });

    app.get("/forgekey", async (req, res) => {
        if (await masterkey(req, res)) return;
        const key = generateKey();
        Mongo.addKey(key);
        res.send(key);
    });

    app.listen(process.env.api_port ?? 80);
}

async function auth(req: express.Request, res: express.Response) {
    const auth = req.header("X-API-Token");
    if (auth != undefined) {
        if (await Mongo.isValidKey(auth)) return false;
    }
    res.status(401).send("Unauthorized");
    return true;
}


async function masterkey(req: express.Request, res: express.Response) {
    const auth = req.header("X-API-Token");
    if (auth != undefined) {
        if (await Mongo.isMasterKey(auth)) return false;
    }
    res.status(401).send("Unauthorized");
    return true;
}