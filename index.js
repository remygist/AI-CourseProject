const fs = require("fs");
const simpleGit = require("simple-git");
const git = simpleGit.default();
const OpenAI = require("openai");
const readline = require('readline');
require('dotenv').config();

const myApiKey = process.env.API_KEY;

const openaiClient = new OpenAI({
    apiKey: myApiKey,
});

const bestPractices = fs.readFileSync("best-practices.txt", "utf-8");

const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getDiff() {
    const diff = await git.diff();
    await connectAssistant(diff);
}

async function connectAssistant(diff) {
    const content = `You are an assistant made to resume changes in code. You will have the results of a git diff command and you will have to summarize the changes that have been made to the code. 
    If there are no changes, you have to tell it. You can not make up changes that haven't been made. 

    You have to follow these best practices for creating git commit messages: 
    ${bestPractices}
    
    You can't say anything else than what the commit message should be, and if needed the description. 

    You only output JSON, in the following format:
            
    {
        "message": __MESSAGE__,
        "description": __DESCRIPTION__
    }

    If there are no changes return in JSON format:

    {
        "message": null,
        "description": null
    }

    This is what you have to resume: ${diff}`;

    const completion = await openaiClient.chat.completions.create({
        messages: [{ role: "system", content: content }],
        model: "gpt-3.5-turbo",
    });

    console.log(completion.choices[0].message.content);

    const summary = JSON.parse(completion.choices[0].message.content);
    validateMessage(summary);
}

async function validateMessage(summary){
    let { message, description } = summary;

    userInterface.question(`
    Generated commit message:
    ${message}
    
    Generated commit description:
    ${description}
    
    Do you want to modify the message, the description, or both? (message/description/both/no): `,
        (answer) => {
            const userInput = answer.trim().toLowerCase();
            if (userInput === "message") {
                userInterface.question(
                    `Please enter your modified message: `,
                    async (modifiedMessage) => {
                        message = modifiedMessage;
                        commitMessage(message, description);
                    }
                );
            }
            else if (userInput === "description") {
                userInterface.question(
                    `Please enter your modified description: `,
                    async (modifiedDescription) => {
                        description = modifiedDescription;
                        commitMessage(message, description);
                    }
                );
            }
            else if (userInput === "both") {
                userInterface.question(
                    `Please enter your modified message: `,
                    async (modifiedMessage) => {
                        message = modifiedMessage;
                    }
                );
                userInterface.question(
                    `Please enter your modified description: `,
                    async (modifiedDescription) => {
                        description = modifiedDescription;
                    }
                );
                commitMessage(message, description);
            }
            else if (userInput === "no") {
                commitMessage(message, description);
            } else {
                console.log(
                    'Invalid input. Please enter "message", "description", "both", or "no".'
                );
                validateMessage(summary);
            }
        }
    );
}

let modifiedMessage = "";
let modifiedDescription = "";


async function commitMessage(message, description) {
    await git.add(".");

    const commitContents = [message];
    if (description) {
        commitContents.push(description);
    }

    console.log(commitContents);
    userInterface.close();
    const commit = await git.commit(commitContents);
}

getDiff();
