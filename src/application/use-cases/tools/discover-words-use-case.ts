import { ILlmGateway } from '@/application/gateways/i-llm-gateway';
import { LearnNewWordsState } from '@/shared/types/learn-new-words-state';

class DiscoverWordsUseCase {
  constructor(private readonly llmGateway: ILlmGateway) {}

  public async execute(state: LearnNewWordsState): Promise<LearnNewWordsState> {
    const content = await this.llmGateway.getResponseByText({
      llm: 'openai',
      model: 'gpt-4o',
      content: `
        You are a specialist in selecting simple and commonly used English words to help improve vocabulary.
        Words that the user has already practiced should not be repeated: ${state.quizzes.map(quiz => quiz.word).join(', ')}.
        Generate a single new word in ENGLISH. Return NOTHING but the word.
      `,
    });

    const newQuizzes = state.quizzes;
    newQuizzes.push({
      word: content.toString(),
      quiz: '',
      answer: '',
      correct: false,
    });

    return { quizzes: newQuizzes };
  }
}

export default DiscoverWordsUseCase;
