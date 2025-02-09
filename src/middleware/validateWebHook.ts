import { Webhooks } from "@octokit/webhooks";
import { Request, Response, NextFunction } from "express";

const webhooks = new Webhooks({
    secret: process.env.WEBHOOK_SECRET || "supersecret",
});

const validateWebHook = async (req: Request, res: Response, next: NextFunction) => {

    const signature = req.headers["x-hub-signature-256"] as string;

    if (!signature) {
        res.status(401).send("Unauthorized");
        return;
    }

    const body = req.body

    const verified = await webhooks.verify(JSON.stringify(body), signature)

    if (!verified) {
        console.log(`Invalid signature from ${req.ip}`);
        res.status(401).send("Unauthorized");
        return;
    }
    else {
        console.log(`Valid signature from ${req.ip}`);
        next();
    }
};

export default validateWebHook;
