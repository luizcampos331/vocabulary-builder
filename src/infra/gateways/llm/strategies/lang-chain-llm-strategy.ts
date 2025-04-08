import { ChatOpenAI } from '@langchain/openai';

type modelOutput = {
  invoke: (content: string) => Promise<{ content: string }>;
};

class LangChainLlmStrategy {
  public openai(model: string): modelOutput {
    return new ChatOpenAI({ model }) as unknown as modelOutput;
  }
}

export default LangChainLlmStrategy;
