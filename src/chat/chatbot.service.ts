import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { localised } from 'src/i18n/quiz/localised-string';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';

@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatMessageService: SwiftchatMessageService;
  private readonly mixpanel: MixpanelService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    swiftchatMessageService: SwiftchatMessageService,
    mixpanel: MixpanelService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
    this.swiftchatMessageService = swiftchatMessageService;
    this.mixpanel = mixpanel;
  }

  public async processMessage(body: any): Promise<any> {
    const { from, text, button_response } = body;

    try {
      // Find user or create if not found
      let userData = await this.userService.findUserByMobileNumber(
        from,
        process.env.BOT_ID,
      );  
      if (!userData) {
        console.log('User not found, creating a new user.');
        userData = await this.userService.createUser(
          from,
          'english',
          process.env.BOT_ID,
        );
      }
      // handle button response
      if (button_response) {
        const difficultyLevels = ['Easy', 'Medium', 'Hard'];
        const selectedOption = button_response.body;

        if (difficultyLevels.includes(selectedOption)) {
          // Update user data with selected difficulty and reset question index
          userData.difficulty = selectedOption;

          const { response, selectedSet } =
            await this.swiftchatMessageService.getQuestionByDifficulty(
              from,
              selectedOption,
            );

          userData.selectedSet = selectedSet.setNumber;
          userData.currentQuestionIndex = 1;

          await this.userService.saveUser(userData);

          this.mixpanel.track('Button_Click', {
            distinct_id: from,
            language: userData.language,
            button_text:body?.button_response?.body,
          });

          return 'done';
        } else {
          // Check the answer
          const answer = await this.swiftchatMessageService.checkAnswer(
            from,
            userData.language,
            selectedOption,
            userData.difficulty,
            userData.selectedSet,
            userData.currentQuestionIndex,
          );

          // Update user score and question index
          await this.userService.updateUserScore(userData, answer);
          await this.swiftchatMessageService.getQuestionBySet(
            from,
            userData.difficulty,
            userData.selectedSet,
            userData.currentQuestionIndex,
          );

          userData.currentQuestionIndex += 1;
          this.mixpanel.track('Button_Click', {
                distinct_id: from,
                language: userData.language,
                button_text: body?.button_response?.body,
              })

          if (userData.questionsAnswered >= 10) {
            await this.swiftchatMessageService.sendScore(
              from,
              `You have answered ${userData.questionsAnswered} questions with a score of ${userData.score}.`,
            );

            userData.questionsAnswered = 0;
            userData.score = 0;
            userData.currentQuestionIndex = 0;
          }

          await this.userService.saveUser(userData);
          return 'done';
        }
      }

      // Handle text message
      if (localised.validText.includes(text.body)) {
        await this.message.sendWelcomeMessage(from, userData.language);
        return 'ok';
      }

      console.log('Please, enter a valid text');
      return 'error';
    } catch (error) {
      console.error('Error processing message:', error);
      return 'error';
    }
  }
}

export default ChatbotService;
