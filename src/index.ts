import * as dotenv from 'dotenv';
import {
  Annotation,
  END,
  MemorySaver,
  START,
  StateGraph,
} from '@langchain/langgraph';
import * as readline from 'readline';
import { ChatOpenAI } from '@langchain/openai';

dotenv.config();

type Quizzes = {
  word: string;
  quiz: string;
  answer: string;
  correct: boolean;
};

const StateAnnotation = Annotation.Root({
  quizzes: Annotation<Quizzes[]>,
});

const memory = new MemorySaver();

const model = new ChatOpenAI({
  model: 'gpt-4o',
});

async function discoverWords(state: typeof StateAnnotation.State) {
  const result = await model.invoke(`
    You are a specialist in selecting simple and commonly used English words to help improve vocabulary.
    Words that the user has already practiced should not be repeated: ${state.quizzes.map(quiz => quiz.word).join(', ')}.
    Generate a single new word in ENGLISH. Return NOTHING but the word.
  `);

  const newQuizzes = state.quizzes;
  newQuizzes.push({
    word: result.content.toString(),
    quiz: '',
    answer: '',
    correct: false,
  });

  return { quizzes: newQuizzes };
}

async function createQuizzes(state: typeof StateAnnotation.State) {
  const lastQuiz = state.quizzes[state.quizzes.length - 1];
  const result = await model.invoke(`
    You are a specialist in creating English questions for vocabulary improvement.
    Remember that the goal is to increase the user’s vocabulary in the English language.
    Create 5 multiple-choice questions with up to 5 different options for the user to answer, all related to the word ${lastQuiz.word}.
    Do not give the answers to the questions because the user must answer them.
  `);

  const quizIndex = state.quizzes.findIndex(
    quiz => quiz.word === lastQuiz.word,
  );

  if (quizIndex === -1) {
    throw new Error('Quiz not found');
  }

  const newQuizzes = state.quizzes;
  newQuizzes[quizIndex] = {
    ...newQuizzes[quizIndex],
    quiz: result.content.toString(),
  };

  return { quizzes: newQuizzes };
}

async function answerQuiz(state: typeof StateAnnotation.State) {
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

async function reviewQuizzes(state: typeof StateAnnotation.State) {
  const lastQuiz = state.quizzes[state.quizzes.length - 1];
  const result = await model.invoke(`
    You are a specialist in evaluating the answers to questions.
    The questions that will be evaluated are these:\n ${lastQuiz.quiz}\n\n
    The user's answers are these: ${lastQuiz.answer}\n\n
    Your response must follow exactly the format:
    Correct: yes or no

    Describe here what the user got right or wrong...
  `);

  const quizIndex = state.quizzes.findIndex(
    quiz => quiz.word === lastQuiz.word,
  );

  if (quizIndex === -1) {
    throw new Error('Quiz not found');
  }

  console.log('==========RESULT==========\n\n', result.content.toString());

  const newQuizzes = state.quizzes;
  newQuizzes[quizIndex] = {
    ...newQuizzes[quizIndex],
    correct: result.content.toString().includes('Correct: yes'),
  };

  return { quizzes: newQuizzes };
}

function shouldContinue(
  state: typeof StateAnnotation.State,
): 'createQuizzes' | typeof END {
  const lastQuiz = state.quizzes[state.quizzes.length - 1];

  if (lastQuiz.correct) {
    console.log('==========END==========');
    return END;
  }

  console.log('A new session of questions will be performed...');

  return 'createQuizzes';
}

const chain = new StateGraph(StateAnnotation)
  .addNode('discoverWords', discoverWords)
  .addNode('createQuizzes', createQuizzes)
  .addNode('answerQuiz', answerQuiz)
  .addNode('reviewQuizzes', reviewQuizzes)
  .addEdge(START, 'discoverWords')
  .addEdge('discoverWords', 'createQuizzes')
  .addEdge('createQuizzes', 'answerQuiz')
  .addEdge('answerQuiz', 'reviewQuizzes')
  .addConditionalEdges('reviewQuizzes', shouldContinue)
  .compile({ checkpointer: memory });

(async () => {
  await chain.invoke(
    {
      quizzes: [],
    },
    { configurable: { thread_id: 'test' } },
  );
})();
