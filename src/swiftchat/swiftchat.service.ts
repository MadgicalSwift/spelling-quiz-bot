import { Body, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import axios from 'axios';
import questionData from '../chat/questions.json';
import { response } from 'express';
import { repl } from '@nestjs/core';

dotenv.config();

@Injectable()
export class SwiftchatMessageService extends MessageService {
  private botId = process.env.BOT_ID;
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

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
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.welcomeMessage,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    await this.difficultyButtons(from);
    return response;
  }

  async difficultyButtons(from: string) {
    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: 'Choose difficulty level.',
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
    console.log('User selected difficulty ====', selectedOption);
    let questions = [];
    console.log('questionssssss=====11111', questions);
    if (selectedOption === 'Easy') {
      questions = questionData.easy.questions;  
  } else if (selectedOption === 'Medium') {
      questions = questionData.medium.questions;
  } else if (selectedOption === 'Hard') {
      questions = questionData.hard.questions;
  } else {
      console.log('Difficulty Not found');
      return;
  }
  console.log('Questions for selected difficulty:', questions);
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];
    console.log('question==', question);
    
    const chooseAnswer = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: 'Choose the correct Spelling.',
          },
        },

        buttons: question.options.map((option: string) => ({
          type: 'solid',
          body: option,
          reply: option,
        })),
        allow_custom_response: false,
      },
    };
    console.log('Sending question to user:', chooseAnswer);
    const response = await this.sendMessage(
      this.baseUrl,
      chooseAnswer,
      this.apiKey,
    );

    console.log('Response from sending question:', response);
    return response;
  }

  async checkAnswer(from: string, selectedOption: string) {
    console.log('selectedOption Answer====', selectedOption);

    const difficultyLevels = ['easy', 'medium', 'hard'];
    let correctAnswer = '';

    for (const level of difficultyLevels) {
      const question = questionData[level].questions.find(
        (currentQuestion) => currentQuestion.correctAnswer === selectedOption,
      );
      if (question) {
        correctAnswer = question.correctAnswer;
        break;
      }
    }

    if (selectedOption === correctAnswer) {
      console.log('Correct');
      const requestData = this.prepareRequestData(
        from,
        'Congratulations!Your answer is correct!',
      );

      const response = await this.sendMessage(
        this.baseUrl,
        requestData,
        this.apiKey,
      );
      await this.afterAnswerButtons(from);
      return response;
    } else {
      console.log('Incorrect');
      const requestData = this.prepareRequestData(
        from,
        `That's incorrect. Try again!`,
      );

      const response = await this.sendMessage(
        this.baseUrl,
        requestData,
        this.apiKey,
      );
      await this.afterAnswerButtons(from);
      return response;
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
            body: 'Next Question, Back to Main Menu.',
          },
        },
        buttons: [
          {
            type: 'solid',
            body: 'Next Question',
            reply: 'Next Question.',
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
