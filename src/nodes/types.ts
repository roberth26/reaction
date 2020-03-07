export type ReactionNodeType = 'string' | 'number' | 'number[]' | 'unknown';

export type ReactionType<NodeType extends ReactionNodeType = ReactionNodeType> = {
    string: string;
    number: number;
    'number[]': number[];
    unknown: unknown;
}[NodeType];

export type ReactionNodeInput<NodeType extends ReactionNodeType = ReactionNodeType> = {
    type: NodeType;
    name: string;
    variadic: boolean;
    nodeIds: ReactionNode['id'][];
    id: string;
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
    Kind extends string = string,
    Type extends ReactionNodeType = ReactionNodeType,
    Inputs extends ReactionNodeInputs = ReactionNodeInputs,
    State extends object = {}
> = {
    kind: Kind;
    inputs: Inputs;
    output: ReactionNodeOutput<Type>;
    state: State;
    id: string;
    name: string;
    x: number;
    y: number;
};

export type ReactionNodeSpec<Node extends ReactionNode = ReactionNode> = {
    create: () => Node;
    evaluate: (
        args: {
            [key in keyof Node['inputs']]: ReactionType<Node['inputs'][key]['type']>[];
        },
        state: Node['state']
    ) => ReactionType<Node['output']['type']>;
};
