import { Message } from "../message";
import { Subscriber } from "../subscriber";
import nodemailer from "nodemailer";

export class EmailSubscriber extends Subscriber {
    type = "EmailSubscriber";
    config: { email: string } = { email: "" };
    processMessage(message: Message): void {
        const from = process.env.email;
        const pass = process.env.password;
        const transporter = nodemailer.createTransport({
            host: "smtp.seznam.cz",
            port: 465,
            secure: true,
            auth: {
                user: from,
                pass: pass,
            },
        });

        transporter.sendMail({
            from: from,
            to: this.config.email,
            subject: message.title ?? `${this.name}`,
            text: `${message.content}`,
        });
    }
}
