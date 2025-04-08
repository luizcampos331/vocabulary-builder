import { LearnNewWordsState } from '@/shared/types/learn-new-words-state';
import * as readline from 'readline';

class AnswerQuizUseCase {
  public async execute(state: LearnNewWordsState): Promise<LearnNewWordsState> {
    const newQuizzes = state.quizzes;

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(
      '==========QUESTIONS==========\n\n',
      newQuizzes[state.quizzes.length - 1].quiz,
    );

    return new Promise(resolve => {
      rl.question('\nEnter your answers: ', answer => {
        rl.close();

        newQuizzes[state.quizzes.length - 1] = {
          ...newQuizzes[state.quizzes.length - 1],
          answer,
        };

        resolve({ quizzes: newQuizzes });
      });
    });
  }
}

export default AnswerQuizUseCase;
