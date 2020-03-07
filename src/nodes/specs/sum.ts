import { ReactionNodeSpec, ReactionNodeInput, ReactionNode } from '../types';

export type SumNode = ReactionNode<'sum', 'number', { operands: ReactionNodeInput<'number'> }>;

export const spec: ReactionNodeSpec<SumNode> = {
    create: () => ({
        id: `${Math.random()}`,
        name: 'sum',
        kind: 'sum',
        state: {},
        inputs: {
            operands: {
                name: 'operands',
                type: 'number',
                variadic: true,
                nodeIds: [],
                id: `${Math.random()}`,
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
