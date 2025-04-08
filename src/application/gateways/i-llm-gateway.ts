export interface ILlmGateway {
  getResponseByText(
    data: GetLlmResponseByTextInput,
  ): Promise<GetLlmResponseOutput>;
}

export type GetLlmResponseByTextInput = {
  llm: 'openai';
  model: 'gpt-4o';
  content: string;
};

export type GetLlmResponseOutput = {
  response: string;
};
