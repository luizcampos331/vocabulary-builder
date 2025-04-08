type Quiz = {
  word: string;
  quiz: string;
  answer: string;
  correct: boolean;
};

export type LearnNewWordsState = {
  quizzes: Quiz[];
};
