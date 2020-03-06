import { ReactionNodeSpec, ReactionNodeInput, ReactionNode } from '../types';

export type SumNode = ReactionNode<'sum', 'number', { operands: ReactionNodeInput<'number'> }>;

export const spec: ReactionNodeSpec<SumNode> = {
    create: attrs => ({
        ...attrs,
        kind: 'sum',
        state: {},
        inputs: {
            operands: {
                name: 'operands',
                type: 'number',
                variadic: true,
                nodeIds: [],
            },
        },
        output: {
            type: 'number',
            nodeIds: [],
            value: null,
        },
        x: 0,
        y: 0,
    }),
    evaluate: ({ operands }) => operands.reduce((a, b) => a + b, 0),
};
