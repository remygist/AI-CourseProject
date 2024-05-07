const simpleGit = require("simple-git");
const git = simpleGit.default();



async function getDiff(){
    const diff = await git.diff();
    console.log(diff);
}

getDiff();