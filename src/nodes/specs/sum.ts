import { ReactionNodeSpec, ReactionNodeInput } from '../types';

export const spec: ReactionNodeSpec<'sum', 'number', { operands: ReactionNodeInput<'number'> }> = {
    create: (id, name) => ({
        id,
        name,
        type: 'sum',
        state: {},
        inputs: {
            operands: {
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
    }),
    evaluate: ({ operands }) => operands.reduce((a, b) => a + b, 0),
};
