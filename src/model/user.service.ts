import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { dynamoDBClient } from 'src/config/database-config.service';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
const { USER_TABLE } = process.env;

@Injectable()
export class UserService {
  async createUser(
    mobileNumber: string,
    language: string,
    botID: string,
    difficulty?: string,
  ): Promise<User | any> {
    try {
      let user = await this.findUserByMobileNumber(mobileNumber, botID);

      if (user) {
        user.difficulty = difficulty;
        const updateUser = {
          TableName: USER_TABLE,
          Item: user,
        };
        await dynamoDBClient().put(updateUser).promise();
        return user;
      } else {
        const newUser = {
          TableName: USER_TABLE,
          Item: {
            id: uuidv4(),
            mobileNumber: mobileNumber,
            language: language,
            botID: botID,
            difficulty: difficulty,
          },
        };
        await dynamoDBClient().put(newUser).promise();
        return newUser;
      }
    } catch (error) {
      console.error('Error in createUser:', error);
    }
  }

  async findUserByMobileNumber(
    mobileNumber: string,
    botID?: string,
  ): Promise<any> {
    const params: any = {
      TableName: USER_TABLE,
      KeyConditionExpression: 'mobileNumber = :mobileNumber',
      ExpressionAttributeValues: {
        ':mobileNumber': mobileNumber,
      },
    };
    if (botID) {
      params.FilterExpression = 'botID = :botID';
      params.ExpressionAttributeValues[':botID'] = botID;
    }
    try {
      const result = await dynamoDBClient().query(params).promise();
      return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
      console.error('Error querying user from DynamoDB:', error);
      return null;
    }
  }

  async saveUser(user: User): Promise<User | any> {
    const updateUser = {
      TableName: USER_TABLE,
      Item: user,
    };
    return await dynamoDBClient().put(updateUser).promise();
  }

  async updateUserScore(user: User, isCorrect: string): Promise<void> {
    user.questionsAnswered = user.questionsAnswered
      ? user.questionsAnswered + 1
      : 1;
    if (isCorrect === 'correct') {
      user.score = user.score ? user.score + 1 : 1;
    }
    const updateUser = {
      TableName: USER_TABLE,
      Item: user,
    };
    try {
      // console.log('Updating user score:', user);
      await dynamoDBClient().put(updateUser).promise();
    } catch (error) {
      console.error('Error updating user score in DynamoDB:', error);
    }
  }
}
