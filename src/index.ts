import 'dotenv/config'
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import path from 'path';
import runProcess from './process.js';
import { PushEvent } from '@octokit/webhooks-types';
import validateWebHook from './middleware/validateWebHook.js';
import { fileURLToPath } from "url";

const app = express();
const PORT = 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
const BRANCH = process.env.BRANCH
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!WEBHOOK_SECRET) {
    console.error("SECRET_KEY is required");
    process.exit(1);
}

app.use(bodyParser.json());

app.use(validateWebHook);

// Middleware to parse JSON request bodies


// Deploy route
app.post("/webhooks", async (req: Request, res: Response) => {
    try {

        res.status(202).send('Accepted')

        const event = req.headers['x-github-event'];

        if (event === "ping") {
            console.log("Ping event received");
            return
        }

        if (event !== "push") {
            console.log(`Event ${event} is not a push event`);
            return;
        }

        const payload = req.body as PushEvent;

        const branch = payload.ref.split("/")[2];

        if (branch !== process.env.BRANCH) {
            console.log(`Branch ${branch} is not ${BRANCH}`);
            return;
        }

        // Run deploy.sh script
        const scriptPath = path.join(__dirname, "../scripts/deploy.sh");

        await runProcess("sh", [scriptPath]);

    } catch (error) {
        console.log(error)
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
