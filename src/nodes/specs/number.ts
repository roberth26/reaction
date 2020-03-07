import { ReactionNode, ReactionNodeSpec, ReactionStateEntry } from '../types';

export type NumberNode = ReactionNode<
    'number',
    'number',
    {},
    { value: ReactionStateEntry<'number', 'value'> }
>;

export const spec: ReactionNodeSpec<NumberNode> = {
    create: () => ({
        id: `${Math.random()}`,
        name: 'number',
        kind: 'number',
        state: {
            value: {
                name: 'value',
                value: 1,
                type: 'number',
            },
        },
        inputs: {},
        output: {
            type: 'number',
            nodeIds: [],
            value: null,
        },
        x: 0,
        y: 0,
    }),
    evaluate: (_, { value: { value } }) => value,
};
