export type ReactionNodeType = 'string' | 'number' | 'number[]' | 'unknown';

export type ReactionType<NodeType extends ReactionNodeType = ReactionNodeType> = {
    string: string;
    number: number;
    'number[]': number[];
    unknown: unknown;
}[NodeType];

export type ReactionNodeInput<NodeType extends ReactionNodeType = ReactionNodeType> = {
    type: NodeType;
    variadic: boolean;
    nodeIds: ReactionNode['id'][];
};

export type ReactionNodeInputs = {
    [input: string]: ReactionNodeInput;
};

export type ReactionNodeOutput<NodeType extends ReactionNodeType = ReactionNodeType> = {
    type: NodeType;
    nodeIds: ReactionNode['id'][];
    value: ReactionType<NodeType> | null;
};

export type ReactionNode<
    Type extends string = string,
    NodeType extends ReactionNodeType = ReactionNodeType,
    Inputs extends ReactionNodeInputs = ReactionNodeInputs,
    State extends object = {}
> = {
    type: Type;
    inputs: Inputs;
    output: ReactionNodeOutput<NodeType>;
    state: State;
    id: string;
    name: string;
};

export type ReactionNodeCreator<
    Type extends string = string,
    NodeType extends ReactionNodeType = ReactionNodeType,
    Inputs extends ReactionNodeInputs = ReactionNodeInputs,
    State extends object = {}
> = (
    id: ReactionNode['id'],
    name: ReactionNode['name']
) => ReactionNode<Type, NodeType, Inputs, State>;

export type ReactionNodeEvaluator<
    NodeType extends ReactionNodeType = ReactionNodeType,
    Inputs extends ReactionNodeInputs = ReactionNodeInputs,
    State extends object = {}
> = (
    args: {
        [key in keyof Inputs]: ReactionType<Inputs[key]['type']>[];
    },
    state: State
) => ReactionType<NodeType>;

export type ReactionNodeSpec<
    Type extends string = string,
    NodeType extends ReactionNodeType = ReactionNodeType,
    Inputs extends ReactionNodeInputs = ReactionNodeInputs,
    State extends object = {}
> = {
    create: ReactionNodeCreator<Type, NodeType, Inputs, State>;
    evaluate: ReactionNodeEvaluator<NodeType, Inputs, State>;
};
