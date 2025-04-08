import { IGraphGateway } from '@/application/gateways/i-graph-gateway';
import { IMemoryRepository } from '@/application/repositories/i-memory-repository';
import CreateQuizzesUseCase from '../tools/create-quizzes-use-case';
import DiscoverWordsUseCase from '../tools/discover-words-use-case';
import AnswerQuizUseCase from '../tools/answer-quiz-use-case';
import ReviewQuizzesUseCase from '../tools/review-quizzes-use-case';
import ShouldContinueUseCase from '../tools/should-continue-use-case';

type LearnNewWordsUseCaseInput = {
  threadId: string;
};

class LearnNewWordsUseCase {
  constructor(
    private readonly graphGateway: IGraphGateway,
    private readonly memoryRepository: IMemoryRepository,
    private readonly discoverWordsUseCase: DiscoverWordsUseCase,
    private readonly createQuizzesUseCase: CreateQuizzesUseCase,
    private readonly answerQuizUseCase: AnswerQuizUseCase,
    private readonly reviewQuizzesUseCase: ReviewQuizzesUseCase,
    private readonly shouldContinueUseCase: ShouldContinueUseCase,
  ) {}

  public async execute({ threadId }: LearnNewWordsUseCaseInput): Promise<void> {
    this.graphGateway.defineNodes([
      { discoverWords: this.discoverWordsUseCase.execute },
      { createQuizzes: this.createQuizzesUseCase.execute },
      { answerQuiz: this.answerQuizUseCase.execute },
      { reviewQuizzes: this.reviewQuizzesUseCase.execute },
    ]);

    this.graphGateway.defineEdges([
      { __start__: 'discoverWords' },
      { discoverWords: 'createQuizzes' },
      { createQuizzes: 'answerQuiz' },
      { answerQuiz: 'reviewQuizzes' },
    ]);

    this.graphGateway.defineConditionalEdges([
      { reviewQuizzes: this.shouldContinueUseCase.execute },
    ]);

    this.graphGateway.compile({
      memory: this.memoryRepository.getMemory(),
    });

    await this.graphGateway.invoke({ quizzes: [] }, { threadId });
  }
}

export default LearnNewWordsUseCase;
