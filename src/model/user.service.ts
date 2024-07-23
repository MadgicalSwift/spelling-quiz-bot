import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    mobileNumber: string,
    language: string,
    botID: string,
    difficulty?: string,
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { mobileNumber, botID },
    });

    if (user) {
      user.language = language;
      if (difficulty) {
        user.difficulty = difficulty;
      }
    } else {
      user = this.userRepository.create({
        mobileNumber,
        language,
        botID,
        difficulty,
      });
    }
    return this.userRepository.save(user);
  }

  async findUserByMobileNumber(
    mobileNumber: string,
    botID: string,
  ): Promise<User> {
    return this.userRepository.findOne({ where: { mobileNumber, botID } });
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async updateUserScore(user: User, isCorrect: string): Promise<void> {
    user.questionsAnswered += 1;
    if (isCorrect === 'correct') {
      user.score += 1;
    }
    await this.userRepository.save(user);
  }
}
