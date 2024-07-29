# Spelling Quiz Game

1. Welcome Message:
The game starts with a greeting: "Hi"
You will then receive a welcome message along with buttons to select the difficulty level: Easy, Medium, or Hard.

2.Select Difficulty Level:
Choose your desired difficulty level by clicking on the appropriate button.

3.Answer Questions:
Based on your selected difficulty level, you will receive a series of 10 spelling questions.
Click on "Next Question" after answering each question to proceed to the next one.

4.Change Difficulty (Optional):
During the quiz, if you want to change the difficulty level, click on the "Main Menu" button.
Select a new difficulty level from the menu.
You will then receive a new set of 10 questions according to the newly selected difficulty level.

5.View Score:
After completing 10 questions, your score will be displayed out of 10.

# Prerequisites
Before you begin, ensure you have met the following requirements:

* Node.js and npm installed
* Nest.js CLI installed (npm install -g @nestjs/cli)
* DynamoDB database 

## Getting Started
### Installation
* Fork the repository
Click the "Fork" button in the upper right corner of the repository page. This will create a copy of the repository under your GitHub account.


* Clone this repository:
```
https://github.com/MadgicalSwift/spelling-quiz-bot
```
* Navigate to the Project Directory:
```
cd spelling-quiz-bot
```
* Install Project Dependencies:
```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Add the following environment variables:

```bash
API_URL = API_URL
BOT_ID = BOT_ID
API_KEY = API_KEY
REGION=region
USER_TABLE=xyz_table
ACCESS_KEY_ID=your_access_key_id_
SECRET_ACCESS_KEY=your_secret_access_key
```
# API Endpoints
```
POST api/message: Endpoint for handling user requests. 
Get/api/status: Endpoint for checking the status of  api
```
# folder structure

```bash
src/
├── app.controller.ts
├── app.module.ts
├── main.ts
├── chat/
│   ├── chat.service.ts
│   └── chatbot.model.ts
|   └── questions.json
├── common/
│   ├── exceptions/
│   │   ├── custom.exception.ts
│   │   └── http-exception.filter.ts
│   ├── middleware/
│   │   ├── log.helper.ts
│   │   └── log.middleware.ts
│   └── utils/
│       └── date.service.ts
├── config/
│   └── database.config.ts
├── i18n/
|      ├── en/
|      │   └── localised-strings.ts
|      ├── hi/
|      │   └── localised-strings.ts
|      └── quiz/
|           └── localised-strings.ts
├── localization/
│   ├── localization.service.ts
│   └── localization.module.ts
│
├── message/
│   ├── message.service.ts
│   └── message.service.ts
└── model/
│   ├── user.entity.ts
│   ├──user.module.ts
│   └──query.ts
└── swiftchat/
    ├── swiftchat.module.ts
    └── swiftchat.service.ts

```



