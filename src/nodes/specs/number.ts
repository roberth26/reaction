import { ReactionNode, ReactionNodeSpec } from '../types';

export type NumberNode = ReactionNode<'number', 'number', {}, { value: number }>;

export const spec: ReactionNodeSpec<NumberNode> = {
    create: attrs => ({
        ...attrs,
        kind: 'number',
        state: { value: 1 },
        inputs: {},
        output: {
            type: 'number',
            nodeIds: [],
            value: null,
        },
        x: 0,
        y: 0,
    }),
    evaluate: (_, { value }) => value,
};
