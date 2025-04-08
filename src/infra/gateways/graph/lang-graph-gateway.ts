import {
  CompileLlmInput,
  IGraphGateway,
  InvokeGraphOptions,
} from '@/application/gateways/i-graph-gateway';
import {
  Annotation,
  CompiledStateGraph,
  StateGraph,
} from '@langchain/langgraph';

type AnnotationDefinition = {
  [key: string]: unknown;
};

class LangGraphGateway implements IGraphGateway {
  private chain: StateGraph<Record<string, unknown>>;
  private chainCompiled!: CompiledStateGraph<
    Record<string, unknown>,
    Record<string, unknown>
  >;

  constructor(annotations: AnnotationDefinition[]) {
    let annotationsObject = {};

    annotations.forEach(annotation => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [key, value] = Object.entries(annotation)[0];
      annotationsObject = {
        ...annotationsObject,
        [key]: Annotation<typeof value>,
      };
    });

    const stateAnnotation = Annotation.Root(annotationsObject);
    this.chain = new StateGraph(stateAnnotation);
  }

  public defineNodes(
    nodes: Record<string, (state: any) => Promise<any>>[],
  ): void {
    for (const node of nodes) {
      const [name, fn] = Object.entries(node)[0];
      this.chain.addNode(name, fn);
    }
  }

  public defineEdges(edges: Record<string, string>[]): void {
    for (const edge of edges) {
      const [actual, next] = Object.entries(edge)[0];
      this.chain.addEdge(
        actual as keyof typeof this.chain.nodes,
        next as keyof typeof this.chain.nodes,
      );
    }
  }

  public defineConditionalEdges(
    conditionalEdges: Record<string, (state: any) => Promise<any>>[],
  ): void {
    for (const conditionalEdge of conditionalEdges) {
      const [name, fn] = Object.entries(conditionalEdge)[0];
      this.chain.addNode(name, fn);
    }
  }

  public compile(data: CompileLlmInput): void {
    this.chainCompiled = this.chain.compile({ checkpointer: data.memory });
  }

  public async invoke(
    input: Record<string, any>,
    options: InvokeGraphOptions,
  ): Promise<void> {
    await this.chainCompiled.invoke(input, {
      configurable: {
        thread_id: options.threadId,
      },
    });
  }
}

export default LangGraphGateway;
