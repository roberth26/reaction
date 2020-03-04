import { ReactionNodeSpec } from '../types';

export const spec: ReactionNodeSpec<'number', 'number', {}, { value: number }> = {
    create: (id, name) => ({
        id,
        name,
        type: 'number',
        state: { value: 1 },
        inputs: {},
        output: {
            type: 'number',
            nodeIds: [],
            value: null,
        },
    }),
    evaluate: (_, { value }) => value,
};
