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
    console.log('body ====', body);
    // Handle button response
    if (button_response) {
      const difficulty = ['Easy', 'Medium', 'Hard'];
      const selectedOption = button_response.body;

      if (difficulty.includes(selectedOption)) {
        console.log("Sleceted diifficulty!@#$%^&",selectedOption);
        await this.swiftchatMessageService.getQuestionByDifficulty(
          from,
          selectedOption,
        );
        return 'done';
      } else  {
        console.log("checking asnwer");
        await this.swiftchatMessageService.checkAnswer(from, selectedOption);
        return 'done';
      }

      
    }
    //Handle text messgae
    let botID = process.env.BOT_ID;
    const userData = await this.userService.findUserByMobileNumber(from);
   
    const { intent, entities } = this.intentClassifier.getIntent(text.body);
    if (userData.language === 'english' || userData.language === 'hindi') {
      await this.userService.saveUser(userData);
    }
    if (intent === 'greeting') {
      this.message.sendWelcomeMessage(from, userData.language);
    } else if (intent === 'select_language') {
      const selectedLanguage = entities[0];
      const userData = await this.userService.findUserByMobileNumber(from);
      userData.language = selectedLanguage;
      await this.userService.saveUser(userData);
      this.message.sendLanguageChangedMessage(from, userData.language);
    }
    return 'ok';
  }
}
export default ChatbotService;
