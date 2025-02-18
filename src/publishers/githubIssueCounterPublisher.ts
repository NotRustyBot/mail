import { Message } from "../message";
import { Mongo } from "../mongo";
import { Publisher } from "../publisher";
import cron from "node-cron";

export class GithubIssueCounterPublisher extends Publisher {
    type = "GithubIssueCounterPublisher";
    config = {
        repo: "",
        filter: "",
        interval: "",
    };

    init() {
        if (this.memory == undefined) this.memory = { lastCount: 0 };
        cron.schedule(this.config.interval, () => this.cycle());
    }

    async cycle() {
        try {
            const count = await countIssues(this.config.repo, this.config.filter);
            if (count != this.memory.lastCount) {
                this.memory.lastCount = count;
                this.publish(Message.create({ content: count.toString() }));
                Mongo.updatePublisher(this.getData());
            }
        } catch (error) {
            this.log(error.message, "error");
        }
    }
}

async function countIssues(repo: string, filters: string) {
    const query = `repo:${repo} ${filters}`;
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Node.js GitHub Issue Counter",
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.total_count;
}
