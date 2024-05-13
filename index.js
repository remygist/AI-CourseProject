const simpleGit = require("simple-git");
const git = simpleGit.default();
const OpenAI = require("openai");

const openaiClient = new OpenAI({
    apiKey: "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",
});

async function getDiff() {
    const diff = await git.diff();
    console.log(diff);
    connectAssistant(diff);
}

async function connectAssistant(diff) {
    const content = `You are an assistant made to resume changes in code. You will have the results of a git diff command and you will have to summarize the changes that have been made to the code. 
    If there are no changes, you have to tell it. You can not make up changes that haven't been made. You have to follow the best practices for creating git commit messages. 
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
    console.log(completion.choices[0].message.content);

    const summary = completion.choices[0].message.content
    commitMessage(summary)
}

async function commitMessage(summary) {
    await git.add(".");
    const message = await git.commit(summary);
    console.log(message);
}

getDiff();

