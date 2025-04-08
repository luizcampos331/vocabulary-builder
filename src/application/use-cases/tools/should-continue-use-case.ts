import { LearnNewWordsState } from '@/shared/types/learn-new-words-state';

class ShouldContinueUseCase {
  public execute(state: LearnNewWordsState): 'createQuizzes' | '__end__' {
    const lastQuiz = state.quizzes[state.quizzes.length - 1];

    if (lastQuiz.correct) {
      console.log('==========END==========');
      return '__end__';
    }

    console.log('A new session of questions will be performed...');

    return 'createQuizzes';
  }
}

export default ShouldContinueUseCase;
