import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ReactionNode } from './nodes/types';
import { createNode } from './nodes/utils';
import { SumNode } from './nodes/specs/sum';

function Input({ node }: { node: ReactionNode }) {
    const [{ canDrop, isOver }, dropRef] = useDrop({
        accept: node.type,
        collect: monitor => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
        drop: () => node,
    });

    return (
        <div
            ref={dropRef}
            style={{
                width: 20,
                height: 20,
                backgroundColor: isOver && canDrop ? 'green' : 'red',
            }}
        ></div>
    );
}

function Output({ node }: { node: ReactionNode }) {
    const [, dragRef] = useDrag<ReactionNode, ReactionNode, { opacity: number }>({
        item: node,
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();

            if (item && dropResult) {
                console.log({ dropResult, item });
            }
        },
    });

    return (
        <div
            ref={dragRef}
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

    if (isDragging) {
        return <div ref={drag} />;
    }

    const handleClick: React.MouseEventHandler<HTMLDivElement> = mouseEvent => {
        onSelect(node);
    };

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
            <Input node={node} />
            {node.kind}
            <Output node={node} />
        </div>
    );
}

const numberNode = createNode('number')!;

const numberNode1: ReactionNode = {
    ...numberNode!,
    id: 'a',
    x: 100,
    y: 200,
    output: {
        ...numberNode.output,
        nodeIds: ['c'],
    },
};
const numberNode2: ReactionNode = {
    ...numberNode!,
    id: 'b',
    x: 100,
    y: 400,
    output: {
        ...numberNode.output,
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

    return (
        <div
            ref={drop}
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#161e27',
            }}
        >
            {nodes.map(node => (
                <Node
                    key={node.id}
                    node={node}
                    isSelected={node.id === selectedNodeId}
                    onSelect={handleNodeSelect}
                />
            ))}
        </div>
    );
}
