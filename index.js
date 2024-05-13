const fs = require("fs");
const simpleGit = require("simple-git");
const git = simpleGit.default();
const OpenAI = require("openai");
const readline = require('readline');

const openaiClient = new OpenAI({
    apiKey: "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",
});

const bestPractices = fs.readFileSync("best-practices.txt", "utf-8");

const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getDiff() {
    const diff = await git.diff(['--cached']);
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
    
    This is what you have to resume: ${diff}`;

    const completion = await openaiClient.chat.completions.create({
        messages: [{ role: "system", content: content }],
        model: "gpt-3.5-turbo",
    });

    console.log(completion.choices);

    const summary = JSON.parse(completion.choices[0].message.content);
    validateMessage(summary);
}

async function validateMessage(summary){
    const { message, description } = summary;

    userInterface.question(`
    Generated commit message:
    ${message}
    
    Generated commit description:
    ${description}
    
    Do you want to modify the message, the description, or both? (message/description/both/no): `, (answer) => {
        const userInput = answer.trim().toLowerCase();
        console.log(userInput);
        if (userInput === 'message' || userInput === 'both') {
            modifyMessage('message');
        }
        if (userInput === 'description' || userInput === 'both') {
            modifyMessage('description');
        }
        if (userInput === 'no') {
            commitMessage(message, description)
        }
        else {
            console.log('Invalid input. Please enter "message", "description", "both", or "no".');
            validateMessage(summary);
        }
    })
}

let modifiedMessage = "";
let modifiedDescription = "";

async function modifyMessage(content){
    userInterface.question(`Please enter your modified commit ${content}: `, async (modifiedText) => {
        if (content === 'message') {
            modifiedMessage = modifiedText;
        } else if (content === 'description'){
            modifiedDescription = modifiedText;
        }

        commitMessage(modifiedMessage, modifiedDescription);
    })
}

async function commitMessage(message, description) {
    await git.add(".");

    const commitContents = [message];
    if (description) {
        commitContents.push("-m", description);
    }

    console.log(commitContents);
    userInterface.close();
   // const commit = await git.commit(commitContents);
}

getDiff();
