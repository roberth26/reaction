import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

function Input({ node }: { node: Node }) {
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

type Node = {
    id: string;
    type: 'string' | 'number';
    payload: any;
    x: number;
    y: number;
};

function Output({ node }: { node: Node }) {
    const [, dragRef] = useDrag<Node, Node, { opacity: number }>({
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

function Node({ node }: { node: Node }) {
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

    return (
        <div
            ref={drag}
            style={{
                width: 240,
                height: 120,
                backgroundColor: 'grey',
                left: node.x,
                top: node.y,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Input node={node} />
            {node.payload}
            <Output node={node} />
        </div>
    );
}

export function App() {
    const [{ nodesById, allNodeIds }, setNodes] = useState<{
        nodesById: Partial<Record<Node['id'], Node>>;
        allNodeIds: Node['id'][];
    }>({
        nodesById: {
            a: { id: 'a', type: 'string', payload: 'this is node 1', x: 100, y: 200 },
            b: { id: 'b', type: 'string', payload: 'this is node 2', x: 600, y: 200 },
        },
        allNodeIds: ['a', 'b'],
    });

    const [, drop] = useDrop({
        accept: 'NODE',
        drop({ node }: { node: Node; type: string }, monitor) {
            const delta = monitor.getDifferenceFromInitialOffset();

            if (delta == null) {
                return;
            }

            const left = Math.round(node.x + delta.x);
            const top = Math.round(node.y + delta.y);

            handleNodeMove(node, { x: left, y: top });
        },
    });

    const handleNodeMove = (node: Node, position: { x: number; y: number }) => {
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

    const nodes = allNodeIds
        .map(nodeId => nodesById[nodeId])
        .filter((node): node is Node => node != null);

    return (
        <div
            ref={drop}
            style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
        >
            {nodes.map(node => (
                <Node key={node.id} node={node} />
            ))}
        </div>
    );
}
