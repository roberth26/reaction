import { ReactionNode, ReactionNodeSpec } from './types';
import { spec as sumSpec } from './specs/sum';
import { spec as numberSpec } from './specs/number';

export const nodeSpecs: Partial<Record<ReactionNode['type'], ReactionNodeSpec>> = {
    sum: (sumSpec as any) as ReactionNodeSpec, // TODO: remove cast
    number: (numberSpec as any) as ReactionNodeSpec,
};
