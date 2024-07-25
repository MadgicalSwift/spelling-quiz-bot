import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';

@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatMessageService: SwiftchatMessageService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    swiftchatMessageService: SwiftchatMessageService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
    this.swiftchatMessageService = swiftchatMessageService;
  }

  public async processMessage(body: any): Promise<any> {
    const { from, text, button_response } = body;

    //find user exist
    let userData = await this.userService.findUserByMobileNumber(
      from,
      process.env.BOT_ID,
    );

    //if user not found
    if (!userData) {
      console.log('User not found, creating a new user.');

      userData = await this.userService.createUser(
        from,
        'english',
        process.env.BOT_ID,
      );
    }

    // Handle button response
    if (button_response) {
      const difficulty = ['Easy', 'Medium', 'Hard'];
      const selectedOption = button_response.body;

      // if the selected option is a difficulty level
      if (difficulty.includes(selectedOption)) {
        // save user data along with selected difficulty and set current index
        userData.difficulty = selectedOption;
        userData.currentQuestionIndex = 0;
        await this.userService.saveUser(userData);

        const { response, selectedSet } =
          await this.swiftchatMessageService.getQuestionByDifficulty(
            from,
            selectedOption,
          );

        // Save user data along with the selected set and next question index
        userData.selectedSet = selectedSet.setNumber;
        userData.currentQuestionIndex = 1;

        await this.userService.saveUser(userData);
        return 'done';
      }

      // if the selected option is 'Main Menu'
      else if (selectedOption === 'Main Menu') {
        userData.questionsAnswered = 0;
        userData.score = 0;
        await this.userService.saveUser(userData);
        await this.message.sendWelcomeMessage(from, userData.language);
        return 'ok';
      }

      // if the selected option is 'Next Question'
      else if (selectedOption === 'Next Question') {
        const currentQuestionIndex = userData.currentQuestionIndex || 0;
        await this.swiftchatMessageService.getQuestionBySet(
          from,
          userData.difficulty,
          userData.selectedSet,
          currentQuestionIndex,
        );
        userData.currentQuestionIndex += 1;
        await this.userService.saveUser(userData);

        return 'ok';
      }

      // check the answer
      else {
        const answer = await this.swiftchatMessageService.checkAnswer(
          from,
          selectedOption,
        );

        //update user question and score
        await this.userService.updateUserScore(userData, answer);

        //after 10 questionsAnswered gives score
        if (userData.questionsAnswered >= 10) {
          await this.swiftchatMessageService.sendScore(
            from,
            `You have answered ${userData.questionsAnswered} questions with a score of ${userData.score}.`,
          );
          userData.questionsAnswered = 0;
          userData.score = 0;
          userData.currentQuestionIndex = 0;
          await this.userService.saveUser(userData);
          return 'done';
        }

        //buttons(nextquestion, mainmenu)
        await this.swiftchatMessageService.afterAnswerButtons(from);
        return 'done';
      }
    }

    // Handle text message
    this.message.sendWelcomeMessage(from, userData.language);

    return 'ok';
  }
}

export default ChatbotService;
