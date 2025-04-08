import { ILlmGateway } from '@/application/gateways/i-llm-gateway';
import { LearnNewWordsState } from '@/shared/types/learn-new-words-state';

class CreateQuizzesUseCase {
  constructor(private readonly llmGateway: ILlmGateway) {}

  public async execute(state: LearnNewWordsState): Promise<LearnNewWordsState> {
    const lastQuiz = state.quizzes[state.quizzes.length - 1];
    const content = await this.llmGateway.getResponseByText({
      llm: 'openai',
      model: 'gpt-4o',
      content: `
        You are a specialist in creating English questions for vocabulary improvement.
        Remember that the goal is to increase the user’s vocabulary in the English language.
        Create 5 multiple-choice questions with up to 5 different options for the user to answer, all related to the word ${lastQuiz.word}.
        Do not give the answers to the questions because the user must answer them.
      `,
    });

    const quizIndex = state.quizzes.findIndex(
      quiz => quiz.word === lastQuiz.word,
    );

    if (quizIndex === -1) {
      throw new Error('Quiz not found');
    }

    const newQuizzes = state.quizzes;
    newQuizzes[quizIndex] = {
      ...newQuizzes[quizIndex],
      quiz: content.toString(),
    };

    return { quizzes: newQuizzes };
  }
}

export default CreateQuizzesUseCase;
