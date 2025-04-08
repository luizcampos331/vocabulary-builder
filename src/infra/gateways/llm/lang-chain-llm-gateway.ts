import {
  GetLlmResponseByTextInput,
  GetLlmResponseOutput,
  ILlmGateway,
} from '@/application/gateways/i-llm-gateway';
import LangChainLlmStrategy from './strategies/lang-chain-llm-strategy';

class LangChainLlmGateway implements ILlmGateway {
  private langChainLlmStrategy: LangChainLlmStrategy;

  constructor() {
    this.langChainLlmStrategy = new LangChainLlmStrategy();
  }

  public async getResponseByText({
    llm,
    model,
    content,
  }: GetLlmResponseByTextInput): Promise<GetLlmResponseOutput> {
    const llmModel = this.langChainLlmStrategy[llm](model);

    const response = await llmModel.invoke(content);

    return { response: response.content.toString() };
  }
}

export default LangChainLlmGateway;
