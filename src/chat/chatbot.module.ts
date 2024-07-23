// chatbot.module.ts

import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { SwiftchatModule } from 'src/swiftchat/swiftchat.module'; // Correct the import path as necessary
import IntentClassifier from 'src/intent/intent.classifier';
import { UserModule } from 'src/model/user.module'; // Import UserModule
import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { MessageService } from 'src/message/message.service';

@Module({
  imports: [SwiftchatModule, UserModule], // Import UserModule to access UserService
  providers: [
    ChatbotService,
    IntentClassifier,
    {
      provide: MessageService,
      useClass: SwiftchatMessageService,
    },
  ],
  exports: [ChatbotService, IntentClassifier],
})
export class ChatbotModule {}
