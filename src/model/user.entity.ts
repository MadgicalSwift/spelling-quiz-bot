import { IsString,  IsDate, IsNumber } from 'class-validator';

export class User {
  @IsString()
  mobileNumber: string;

  @IsString()
  language: string;

  @IsString()
  botID: string;

  @IsString()
  difficulty: string | null;

  @IsString()
  selectedSet: string | null;

  @IsNumber()
  questionsAnswered: number = 0;

  @IsNumber()
  score: number= 0;

  @IsNumber()
  currentQuestionIndex: number = 0;
}

