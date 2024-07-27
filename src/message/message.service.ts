import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CustomException } from 'src/common/exception/custom.exception';
import { localisedStrings } from 'src/i18n/en/localised-strings';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';

@Injectable()
export abstract class MessageService {
  constructor(
    public readonly mixpanel: MixpanelService
  ) {}
  async prepareWelcomeMessage() {
    return localisedStrings.welcomeMessage;
  }
  getSeeMoreButtonLabel() {
    return localisedStrings.seeMoreMessage;
  }

  async sendMessage(baseUrl: string, requestData: any, token: string) {
    try {
      const response = await axios.post(baseUrl, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.log('error', error.data);
      throw new CustomException(error);
    }
  }
  abstract sendScore(from: string, score: string);
  abstract sendWelcomeMessage(from: string, language: string);
  abstract difficultyButtons(from: string);
  abstract getQuestionByDifficulty(from: string, selectedDifficulty: string);
  abstract checkAnswer(from: string, language:string,selectedOption: string,  difficulty:string, selectedSet:string, currentQuestionIndex: number);
  abstract afterAnswerButtons(from: string);
  abstract sendLanguageChangedMessage(from: string, language: string);
  abstract getQuestionBySet(from: string, difficulty: string, setNumber: string, currentQuestionIndex: number);
}
