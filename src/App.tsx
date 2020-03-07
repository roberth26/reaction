import React, { useState, useRef, useEffect, forwardRef, createContext, useContext } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ReactionNode, ReactionNodeInput, ReactionNodeOutput } from './nodes/types';
import { createNode } from './nodes/utils';
import { SumNode } from './nodes/specs/sum';

const Input = forwardRef<HTMLDivElement, { input: ReactionNodeInput }>(({ input }, ref) => {
    const [{ canDrop, isOver }, dropRef] = useDrop({
        accept: input.type,
        collect: monitor => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
        // drop: () => node, TODO:
    });

    const { storeElement } = useContext(viewportContext);

    return (
        <div
            ref={element => {
                storeElement(input.id, element);
                dropRef(element);
            }}
        >
            {[...input.nodeIds, ...(input.variadic ? [''] : [])].map((nodeId, index) => (
                <div
                    key={nodeId}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ width: 20, height: 20, backgroundColor: 'green' }} />
                    {`${input.name}${input.variadic ? ` [${index}]` : ''}`}
                </div>
            ))}
        </div>
    );
});

function Output({ node }: { node: ReactionNode }) {
    const [, dragRef] = useDrag<
        { type: ReactionNode['output']['type']; node: ReactionNode },
        ReactionNode,
        { opacity: number }
    >({
        item: {
            type: node.output.type,
            node,
        },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();

            if (item && dropResult) {
                console.log({ dropResult, item });
            }
        },
    });

    const { storeElement } = useContext(viewportContext);

    return (
        <div
            ref={element => {
                storeElement(node.id, element);
                dragRef(element);
            }}
            style={{
                width: 20,
                height: 20,
                backgroundColor: 'yellow',
            }}
        />
    );
}

function Node({
    node,
    isSelected,
    onSelect,
}: {
    node: ReactionNode;
    isSelected?: boolean;
    onSelect: (node: ReactionNode) => void;
}) {
    const [{ isDragging }, drag] = useDrag({
        item: {
            type: 'NODE',
            node,
        },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const handleClick: React.MouseEventHandler<HTMLDivElement> = mouseEvent => {
        onSelect(node);
    };

    if (isDragging) {
        return <div ref={drag} />;
    }

    return (
        <div
            ref={drag}
            onClick={handleClick}
            style={{
                width: 240,
                height: 120,
                backgroundColor: '#82a0af',
                left: node.x,
                top: node.y,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: isSelected ? '0 1px 8px #00d0ff' : '0 1px 8px rgba(0,0,0,.7)',
                border: isSelected ? '2px solid #00d0ff' : 0,
            }}
        >
            {Object.values(node.inputs).map(input => (
                <Input key={input.name} input={input} />
            ))}
            {node.kind}
            <Output node={node} />
        </div>
    );
}

const numberNodeBase = createNode('number')!;

const numberNode1: ReactionNode = {
    ...numberNodeBase,
    id: 'a',
    x: 100,
    y: 200,
    output: {
        ...numberNodeBase.output,
        nodeIds: ['c'],
    },
};

const numberNodeBase2 = createNode('number')!;

const numberNode2: ReactionNode = {
    ...numberNodeBase2,
    id: 'b',
    x: 100,
    y: 400,
    output: {
        ...numberNodeBase2.output,
        nodeIds: ['c'],
    },
};

const sumNode = createNode('sum')! as SumNode;

const sumNode1: SumNode = {
    ...sumNode,
    id: 'c',
    x: 600,
    y: 300,
    inputs: {
        ...sumNode.inputs,
        operands: {
            ...sumNode.inputs.operands,
            nodeIds: ['a', 'b'],
        },
    },
};

const initialState: {
    nodesById: Partial<Record<ReactionNode['id'], ReactionNode>>;
    allNodeIds: ReactionNode['id'][];
    selectedNodeId: ReactionNode['id'] | null;
} = {
    nodesById: {
        [numberNode1.id]: numberNode1,
        [numberNode2.id]: numberNode2,
        [sumNode1.id]: sumNode1,
    },
    allNodeIds: [numberNode1.id, numberNode2.id, sumNode1.id],
    selectedNodeId: null,
};

type ViewportContext = {
    storeElement: (
        ioId: ReactionNodeInput['id'] | ReactionNode['id'],
        element: HTMLElement | null
    ) => void;
};

const viewportContext = createContext<ViewportContext>({
    storeElement: () => {},
});

function Viewport({
    width,
    height,
    nodesById,
    children,
}: {
    width: number;
    height: number;
    nodesById: Partial<Record<ReactionNode['id'], ReactionNode>>;
    children: React.ReactNode;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [elements, setElements] = useState<
        Record<ReactionNodeInput['id'] | ReactionNode['id'], HTMLElement | null>
    >({});

    const { current: vpContext } = useRef<ViewportContext>({
        storeElement: (id, element) => {
            setElements(elements => ({
                ...elements,
                [id]: element,
            }));
        },
    });

    useEffect(() => {
        const { current: canvasElement } = canvasRef;

        if (canvasElement == null) {
            return;
        }

        const context = canvasElement.getContext('2d');

        if (context == null) {
            return;
        }

        context.clearRect(0, 0, width, height);

        Object.values(nodesById)
            .filter((node): node is ReactionNode => node != null)
            .forEach(node => {
                Object.values(node.inputs).forEach(nodeInput => {
                    const inputElement = elements[nodeInput.id];

                    if (inputElement == null) {
                        return;
                    }

                    const inputRect = inputElement.getBoundingClientRect();
                    const inputPos: Pick<DOMRect, 'x' | 'y'> = {
                        x: inputRect.x, // TODO: + inputRect.width / 2,
                        y: inputRect.y + inputRect.height / 2,
                    };

                    nodeInput.nodeIds.forEach(nodeId => {
                        const upstreamNode = nodesById[nodeId];

                        if (upstreamNode == null) {
                            return;
                        }

                        const outputElement = elements[nodeId];

                        if (outputElement == null) {
                            return;
                        }

                        const outputRect = outputElement.getBoundingClientRect();

                        const outputPos: Pick<DOMRect, 'x' | 'y'> = {
                            x: outputRect.x + outputRect.width, // TODO: fix + outputRect.width / 2,
                            y: outputRect.y + outputRect.height / 2,
                        };

                        const xDelta = Math.abs(inputPos.x - outputPos.x);
                        const yDelta = Math.abs(inputPos.y - outputPos.y);

                        const bezierLength = Math.max(xDelta, yDelta) / 4;

                        context.strokeStyle = '#73acde';
                        context.lineWidth = 2;
                        context.beginPath();
                        context.moveTo(outputPos.x, outputPos.y);
                        context.bezierCurveTo(
                            outputPos.x + bezierLength,
                            outputPos.y,
                            inputPos.x - bezierLength,
                            inputPos.y,
                            inputPos.x,
                            inputPos.y
                        );
                        context.stroke();
                    });
                });
            });
    }, [nodesById, elements]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width, height }}>
            <viewportContext.Provider value={vpContext}>{children}</viewportContext.Provider>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width,
                    height,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

export function App() {
    const [{ nodesById, allNodeIds, selectedNodeId }, setNodes] = useState(initialState);

    const [, drop] = useDrop({
        accept: 'NODE',
        drop({ node }: { node: ReactionNode; type: string }, monitor) {
            const delta = monitor.getDifferenceFromInitialOffset();

            if (delta == null) {
                return;
            }

            const left = Math.round(node.x + delta.x);
            const top = Math.round(node.y + delta.y);

            handleNodeMove(node, { x: left, y: top });
        },
    });

    const handleNodeMove = (node: ReactionNode, position: { x: number; y: number }) => {
        setNodes(state => {
            const savedNode = state.nodesById[node.id];

            if (savedNode == null) {
                return state;
            }

            return {
                ...state,
                nodesById: {
                    ...nodesById,
                    [node.id]: {
                        ...savedNode,
                        ...position,
                    },
                },
            };
        });
    };

    const handleNodeSelect = (node: ReactionNode) => {
        setNodes(state => ({
            ...state,
            selectedNodeId: node['id'],
        }));
    };

    const nodes = allNodeIds
        .map(nodeId => nodesById[nodeId])
        .filter((node): node is ReactionNode => node != null);

    const width = 2000;
    const height = 2000;

    return (
        <div
            ref={drop}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width,
                height,
                backgroundColor: '#161e27',
            }}
        >
            <Viewport width={width} height={height} nodesById={nodesById}>
                {nodes.map(node => (
                    <Node
                        key={node.id}
                        node={node}
                        isSelected={node.id === selectedNodeId}
                        onSelect={handleNodeSelect}
                    />
                ))}
            </Viewport>
        </div>
    );
}
