import { broker } from "../broker";
import { Message } from "../message";
import { Publisher } from "../publisher";

export class WebhookPublisher extends Publisher {
    type = "WebhookPublisher";
    config = {
        url: "",
        port: "",
        defaultMessage: "",
    };

    init() {
        try {
            broker.app.get("/w/" + this.config.url, (req, res) => {
                this.publish(
                    Message.create({
                        content: req.query.message?.toString() ?? this.config.defaultMessage,
                    })
                );
                res.send("OK");
            });
        } catch (error) {
            this.log(error.message, "error");
        }
    }
}
