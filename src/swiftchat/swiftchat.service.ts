import { Body, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import questionData from '../chat/questions.json';
import { response } from 'express';
import { repl } from '@nestjs/core';
import { localised } from 'src/i18n/quiz/localised-string';

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
    let questions = [];

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

    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];

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

        buttons: question.options.map((option: string) => ({
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

    return response;
  }

  async checkAnswer(from: string, selectedOption: string) {
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
      const requestData = this.prepareRequestData(from, localised.correct);

      const response = await this.sendMessage(
        this.baseUrl,
        requestData,
        this.apiKey,
      );
      return 'correct';
    } else {
      const requestData = this.prepareRequestData(from, localised.wrong);

      const response = await this.sendMessage(
        this.baseUrl,
        requestData,
        this.apiKey,
      );
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
