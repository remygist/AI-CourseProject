const simpleGit = require("simple-git");
const git = simpleGit.default();
const OpenAI = require("openai");

const openaiClient = new OpenAI({
    apiKey: "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",
});


async function getDiff(){
    const diff = await git.diff();
    console.log(diff);
}

getDiff();