# CodeAndClear

CodeAndClear is a Node.js application that helps the process of creating git commit messages and descriptions. It utilizes OpenAI's GPT-3.5 model to generate commit messages based on the changes made in the code.

## Features

* Automatically summarizes changes made in the code using `git diff`.
* User may add a file with best practices for the application to follow.
* Allows users to modify generated commit messages and descriptions interactively.

## Prerequisites

- Node.js
- NPM (Node Package Manager)
- Git
- OpenAI API key

## Installation

1. Clone the repository.
2. Use the `cd` command to access the folders.
3. Type: `npm install` to install all dependencies.
4. Create a '.env' file in the project directory.
5. ADD your OpenAI API key to the '.env' file.
   `API_KEY=your_openai_api_key`

## Usage

1. Run the application:
   `node index.js`
2. Follow the prompts to review the generated commit message and description.
3. Choose to modify the message, description, or both as needed.
4. If no modifications are required, confirm to commit the changes.
