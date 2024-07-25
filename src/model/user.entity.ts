import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: false })
  mobileNumber: string;

  @Column()
  language: string;
  @Column()
  botID: string;
  
  @Column({ nullable: true })
  difficulty: string;
  
  @Column({ nullable: true })
  selectedSet: string;
  
  @Column({ default: 0 }) 
  questionsAnswered: number;

  @Column({ default: 0 }) 
  score: number;
  
  @Column({ default: 0 })
  currentQuestionIndex: number;
 
}
