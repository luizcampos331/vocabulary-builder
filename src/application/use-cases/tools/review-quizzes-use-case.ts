import { ILlmGateway } from '@/application/gateways/i-llm-gateway';
import { LearnNewWordsState } from '@/shared/types/learn-new-words-state';

class ReviewQuizzesUseCase {
  constructor(private readonly llmGateway: ILlmGateway) {}

  public async execute(state: LearnNewWordsState): Promise<LearnNewWordsState> {
    const lastQuiz = state.quizzes[state.quizzes.length - 1];
    const content = await this.llmGateway.getResponseByText({
      llm: 'openai',
      model: 'gpt-4o',
      content: `
        You are a specialist in evaluating the answers to questions.
        The questions that will be evaluated are these:\n ${lastQuiz.quiz}\n\n
        The user's answers are these: ${lastQuiz.answer}\n\n
        Your response must follow exactly the format:
        Correct: yes or no
    
        Describe here what the user got right or wrong...
      `,
    });

    const quizIndex = state.quizzes.findIndex(
      quiz => quiz.word === lastQuiz.word,
    );

    if (quizIndex === -1) {
      throw new Error('Quiz not found');
    }

    console.log('==========RESULT==========\n\n', content.toString());

    const newQuizzes = state.quizzes;
    newQuizzes[quizIndex] = {
      ...newQuizzes[quizIndex],
      correct: content.toString().includes('Correct: yes'),
    };

    return { quizzes: newQuizzes };
  }
}

export default ReviewQuizzesUseCase;
