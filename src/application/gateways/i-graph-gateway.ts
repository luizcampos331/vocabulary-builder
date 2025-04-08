export interface IGraphGateway {
  defineNodes(nodes: Record<string, (state: any) => Promise<any>>[]): void;
  defineEdges(edges: Record<string, string>[]): void;
  defineConditionalEdges(
    conditionalEdges: Record<string, (state: any) => Promise<any>>[],
  ): void;
  compile(data: CompileLlmInput): void;
  invoke(
    input: Record<string, any>,
    options: InvokeGraphOptions,
  ): Promise<void>;
}

export type CompileLlmInput = {
  memory: any;
};

export type InvokeGraphOptions = {
  threadId: string;
};
