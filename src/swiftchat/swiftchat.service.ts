import { Body, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import questionData from '../chat/questions.json';
import { response } from 'express';
import { repl } from '@nestjs/core';
import { localised } from 'src/i18n/quiz/localised-string';
import * as _ from 'lodash';



dotenv.config();

@Injectable()
export class SwiftchatMessageService extends MessageService {
  private botId = process.env.BOT_ID;
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;
  private userService: UserService;

  private prepareRequestData(from: string, requestBody: string): any {
    return {
      to: from,
      type: 'text',
      text: {
        body: requestBody,
      },
    };
  }

  async sendWelcomeMessage(from: string, language: string) {
    const requestData = this.prepareRequestData(from, localised.welcomeMessage);

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    await this.difficultyButtons(from);
    return response;
  }

  async sendScore(from: string, score: string) {
    const requestData = this.prepareRequestData(from, score);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    await this.difficultyButtons(from);
  }

  async difficultyButtons(from: string) {
    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localised.difficulty,
          },
        },
        buttons: [
          {
            type: 'solid',
            body: 'Easy',
            reply: 'Easy',
          },
          {
            type: 'solid',
            body: 'Medium',
            reply: 'Medium',
          },
          {
            type: 'solid',
            body: 'Hard',
            reply: 'Hard',
          },
        ],
        allow_custom_response: false,
      },
    };
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  async getQuestionByDifficulty(from: string, selectedOption: string) {
    let sets = [];

    if (selectedOption === 'Easy') {
      sets = questionData.easy.sets;
    } else if (selectedOption === 'Medium') {
      sets = questionData.medium.sets;
    } else if (selectedOption === 'Hard') {
      sets = questionData.hard.sets;
    } else {
      console.log('Difficulty Not found');
      return;
    }

    // Select a random set
    const randomSetIndex = Math.floor(Math.random() * sets.length);
    const selectedSet = sets[randomSetIndex];

    // Initialize current question index to 0
    const currentQuestionIndex = 0;
    const question = selectedSet.questions[currentQuestionIndex];
    const shuffledOptions = _.shuffle(question.options);

    const chooseAnswer = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localised.spelling,
          },
        },

        buttons: shuffledOptions.map((option: string) => ({
          type: 'solid',
          body: option,
          reply: option,
        })),
        allow_custom_response: false,
      },
    };

    const response = await this.sendMessage(
      this.baseUrl,
      chooseAnswer,
      this.apiKey,
    );

    return { response, selectedSet };
  }

  async getQuestionBySet(
    from: string,
    difficulty: string,
    setNumber: string,
    currentQuestionIndex: number,
  ) {
    let sets = [];

    if (difficulty === 'Easy') {
      sets = questionData.easy.sets;
    } else if (difficulty === 'Medium') {
      sets = questionData.medium.sets;
    } else if (difficulty === 'Hard') {
      sets = questionData.hard.sets;
    } else {
      console.log('Difficulty Not found');
      return;
    }

    const setNumberAsNumber = Number(setNumber);
    //Find the set by setNumber
    const selectedSet = sets.find((set) => set.setNumber === setNumberAsNumber);
    if (!selectedSet) {
      console.log('Set not found');
      return;
    }

    if (currentQuestionIndex >= selectedSet.questions.length) {
      console.log('No more questions in the set');
      return;
    }
    const question = selectedSet.questions[currentQuestionIndex];
    const shuffledOptions = _.shuffle(question.options);

    const chooseAnswer = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localised.spelling,
          },
        },
        buttons: shuffledOptions.map((option: string) => ({
          type: 'solid',
          body: option,
          reply: option,
        })),
        allow_custom_response: false,
      },
    };

    const response = await this.sendMessage(
      this.baseUrl,
      chooseAnswer,
      this.apiKey,
    );

    return { response, selectedSet };
  }
 
  async checkAnswer(
    from: string,
    language: string,
    selectedOption: string,
    difficulty: string,
    selectedSet: string,
    currentQuestionIndex: number,
  ) {
    const difficultyData = questionData[difficulty.toLowerCase()];
    if (!difficultyData) {
      console.log('Difficulty level  not found.');
    }

    const setData = difficultyData.sets.find(
      (set) => set.setNumber === selectedSet,
    );
    if (!setData) {
      console.log('SetNumber not found.');
    }
    const questionIndex = currentQuestionIndex - 1;

    // Get the current question
    const question = setData.questions[questionIndex];
    if (!question) {
      console.log('Question index out of range.');
    }
    const correctAnswer = question.correctAnswer;
    const explanation =  question.explanation
    if (selectedOption === correctAnswer) {
      const requestData = this.prepareRequestData(from, `${localised.correct}. 
      ${correctAnswer} : ${explanation}`);

      const response = await this.sendMessage(
        this.baseUrl,
        requestData,
        this.apiKey,
      );
      this.mixpanel.track('Taking_Quiz', {
        distinct_id: from,
        language: language,
        question: question.question,
        user_answer: selectedOption,
        answer_is: 'correct',
      });
      return 'correct';
    } else {
      const requestData = this.prepareRequestData(
        from,
        `${localised.wrong} The correct answer is ${correctAnswer}. Don't worry, keep going! You're doing great!.
         ${correctAnswer} : ${explanation}`,
      );

      const response = await this.sendMessage(
        this.baseUrl,
        requestData,
        this.apiKey,
      );
      this.mixpanel.track('Taking_Quiz', {
        distinct_id: from,
        language: language,
        question: question.question,
        user_answer: selectedOption,
        answer_is: 'incorrect',
      });
      return 'incorrect';
    }
  }

  async afterAnswerButtons(from: string) {
    const buttons = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localised.nextquestion,
          },
        },
        buttons: [
          {
            type: 'solid',
            body: 'Next Question',
            reply: 'Next Question',
          },
          {
            type: 'solid',
            body: 'Main Menu',
            reply: 'Main Menu',
          },
        ],
        allow_custom_response: false,
      },
    };
    const response = await this.sendMessage(this.baseUrl, buttons, this.apiKey);
    return response;
  }

  async sendLanguageChangedMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.select_language,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
}
