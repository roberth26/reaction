import { ReactionNode } from './types';
import { nodeSpecs } from './constants';

export const createNode = (kind: ReactionNode['kind']) => {
    const spec = nodeSpecs[kind];

    if (spec == null) {
        return null;
    }

    return spec.create();
};
