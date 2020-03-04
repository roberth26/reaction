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

function Node({
    node,
    isSelected,
    onSelect,
}: {
    node: Node;
    isSelected?: boolean;
    onSelect: (node: Node) => void;
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
            {node.payload}
            <Output node={node} />
        </div>
    );
}

export function App() {
    const [{ nodesById, allNodeIds, selectedNodeId }, setNodes] = useState<{
        nodesById: Partial<Record<Node['id'], Node>>;
        allNodeIds: Node['id'][];
        selectedNodeId: Node['id'] | null;
    }>({
        nodesById: {
            a: { id: 'a', type: 'string', payload: 'this is node 1', x: 100, y: 200 },
            b: { id: 'b', type: 'string', payload: 'this is node 2', x: 600, y: 200 },
        },
        allNodeIds: ['a', 'b'],
        selectedNodeId: null,
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

    const handleNodeSelect = (node: Node) => {
        setNodes(state => ({
            ...state,
            selectedNodeId: node['id'],
        }));
    };

    const nodes = allNodeIds
        .map(nodeId => nodesById[nodeId])
        .filter((node): node is Node => node != null);

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
