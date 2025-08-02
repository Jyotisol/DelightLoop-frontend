import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ReactFlow, { addEdge, Background, Controls, Handle, useNodesState, useEdgesState } from 'reactflow';
import io from 'socket.io-client';
import { updateNode } from './emailStore';
import 'reactflow/dist/style.css';
import './index.css';

const EmailNode = ({ data }) => (
  <div className="p-4 bg-blue-100 border border-blue-500 rounded shadow">
    <Handle type="target" position="top" />
    <div className="font-bold">{data.label || 'Unnamed Email'}</div>
    <div>{data.content || 'No content'}</div>
    <button onClick={data.onEdit} className="mt-2 text-blue-600 hover:underline">Edit</button>
    <button onClick={data.onDelete} className="mt-2 ml-2 text-red-600 hover:underline">Delete</button>
    <Handle type="source" position="bottom" />
  </div>
);

const DelayNode = ({ data }) => (
  <div className="p-4 bg-green-100 border border-green-500 rounded shadow">
    <Handle type="target" position="top" />
    <div className="font-bold">{data.label || 'Unnamed Delay'}</div>
    <div>Wait {data.days || 1} days</div>
    <button onClick={data.onEdit} className="mt-2 text-blue-600 hover:underline">Edit</button>
    <button onClick={data.onDelete} className="mt-2 ml-2 text-red-600 hover:underline">Delete</button>
    <Handle type="source" position="bottom" />
  </div>
);

const ConditionNode = ({ data }) => (
  <div className="p-4 bg-yellow-100 border border-yellow-500 rounded shadow">
    <Handle type="target" position="top" />
    <div className="font-bold">{data.label || 'Unnamed Condition'}</div>
    <div>If {data.eventType || 'click'} then next</div>
    <button onClick={data.onEdit} className="mt-2 text-blue-600 hover:underline">Edit</button>
    <button onClick={data.onDelete} className="mt-2 ml-2 text-red-600 hover:underline">Delete</button>
    <Handle type="source" position="bottom" />
  </div>
);

const nodeTypes = {
  email: EmailNode,
  delay: DelayNode,
  condition: ConditionNode,
};

const socket = io('https://delightloop-backend.onrender.com', {
  transports: ['websocket', 'polling'],
});

const EmailCampaign = () => {
  const dispatch = useDispatch();
  const nodesFromRedux = useSelector((state) => state.campaign.nodes);
  const edgesFromRedux = useSelector((state) => state.campaign.edges);
  const [nodes, setNodes, onNodesChange] = useNodesState(nodesFromRedux);
  const [edges, setEdges, onEdgesChange] = useEdgesState(edgesFromRedux);
  const [editingNode, setEditingNode] = useState(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('campaign-update', ({ nodes, edges }) => {
      console.log('Received campaign-update:', JSON.stringify({ nodes, edges }, null, 2));
      dispatch(setNodes(nodes));
      dispatch(setEdges(edges));
      setNodes(nodes);
      setEdges(edges);
    });

    return () => {
      socket.off('connect');
      socket.off('campaign-update');
    };
  }, [dispatch, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = { id: `e${params.source}-${params.target}`, source: params.source, target: params.target };
      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
      dispatch(setEdges(newEdges));
      socket.emit('campaign-update', { nodes, edges: newEdges });
    },
    [edges, nodes, setEdges, dispatch]
  );

  const addEmailNode = () => {
    const newNode = {
      id: `${Date.now()}`,
      type: 'email',
      data: { label: 'Email Node', content: 'Sample Email' },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    const newNodes = [...nodes, newNode];
    let newEdges = [...edges];
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      newEdges = [...edges, { id: `e${lastNode.id}-${newNode.id}`, source: lastNode.id, target: newNode.id }];
    }
    setNodes(newNodes);
    setEdges(newEdges);
    dispatch(setNodes(newNodes));
    dispatch(setEdges(newEdges));
    socket.emit('campaign-update', { nodes: newNodes, edges: newEdges });
  };

  const addDelayNode = () => {
    const newNode = {
      id: `${Date.now()}`,
      type: 'delay',
      data: { label: 'Delay Node', days: 3 },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    const newNodes = [...nodes, newNode];
    let newEdges = [...edges];
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      newEdges = [...edges, { id: `e${lastNode.id}-${newNode.id}`, source: lastNode.id, target: newNode.id }];
    }
    setNodes(newNodes);
    setEdges(newEdges);
    dispatch(setNodes(newNodes));
    dispatch(setEdges(newEdges));
    socket.emit('campaign-update', { nodes: newNodes, edges: newEdges });
  };

  const addConditionNode = () => {
    const newNode = {
      id: `${Date.now()}`,
      type: 'condition',
      data: { label: 'Condition Node', eventType: 'click' },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    const newNodes = [...nodes, newNode];
    let newEdges = [...edges];
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      newEdges = [...edges, { id: `e${lastNode.id}-${newNode.id}`, source: lastNode.id, target: newNode.id }];
    }
    setNodes(newNodes);
    setEdges(newEdges);
    dispatch(setNodes(newNodes));
    dispatch(setEdges(newEdges));
    socket.emit('campaign-update', { nodes: newNodes, edges: newEdges });
  };

  const deleteNode = (id) => {
    const newNodes = nodes.filter(n => n.id !== id);
    const newEdges = edges.filter(e => e.source !== id && e.target !== id);
    setNodes(newNodes);
    setEdges(newEdges);
    dispatch(setNodes(newNodes));
    dispatch(setEdges(newEdges));
    socket.emit('campaign-update', { nodes: newNodes, edges: newEdges });
  };

  const startEditingNode = (node) => {
    setEditingNode({ ...node });
  };

  const saveNodeChanges = () => {
    if (!editingNode) return;
    const updatedNodes = nodes.map(n => (n.id === editingNode.id ? editingNode : n));
    setNodes(updatedNodes);
    dispatch(setNodes(updatedNodes));
    socket.emit('campaign-update', { nodes: updatedNodes, edges });
    setEditingNode(null);
  };

  const onNodeDragStop = useCallback(
    (event, node) => {
      const updatedNode = { ...node, position: { x: node.position.x, y: node.position.y } };
      setNodes(nodes => nodes.map(n => (n.id === node.id ? updatedNode : n)));
      dispatch(updateNode(updatedNode));
      socket.emit('campaign-update', { nodes: nodes.map(n => (n.id === node.id ? updatedNode : n)), edges });
    },
    [setNodes, dispatch, nodes, edges]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={addEmailNode}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Email Node
          </button>
          <button
            onClick={addDelayNode}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Add Delay Node
          </button>
          <button
            onClick={addConditionNode}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Add Condition Node
          </button>
        </div>
        {editingNode && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow-lg">
              <h2 className="text-lg font-bold mb-2">Edit Node</h2>
              {editingNode.type === 'email' ? (
                <>
                  <label className="block mb-1">Label</label>
                  <input
                    type="text"
                    value={editingNode.data.label || ''}
                    onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, label: e.target.value } })}
                    className="w-full p-2 border rounded"
                  />
                  <label className="block mb-1 mt-2">Content</label>
                  <input
                    type="text"
                    value={editingNode.data.content || ''}
                    onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, content: e.target.value } })}
                    className="w-full p-2 border rounded"
                  />
                </>
              ) : editingNode.type === 'delay' ? (
                <>
                  <label className="block mb-1">Label</label>
                  <input
                    type="text"
                    value={editingNode.data.label || ''}
                    onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, label: e.target.value } })}
                    className="w-full p-2 border rounded"
                  />
                  <label className="block mb-1 mt-2">Days</label>
                  <input
                    type="number"
                    value={editingNode.data.days || 1}
                    onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, days: parseInt(e.target.value) } })}
                    className="w-full p-2 border rounded"
                  />
                </>
              ) : (
                <>
                  <label className="block mb-1">Label</label>
                  <input
                    type="text"
                    value={editingNode.data.label || ''}
                    onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, label: e.target.value } })}
                    className="w-full p-2 border rounded"
                  />
                  <label className="block mb-1 mt-2">Event Type</label>
                  <select
                    value={editingNode.data.eventType || 'click'}
                    onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, eventType: e.target.value } })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="click">Click</option>
                    <option value="open">Open</option>
                    <option value="purchase">Purchase</option>
                    <option value="idle">Idle</option>
                  </select>
                </>
              )}
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={saveNodeChanges}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingNode(null)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <div style={{ height: '600px', border: '1px solid #ddd' }}>
          <ReactFlow
            nodes={nodes.map(node => ({
              ...node,
              data: {
                ...node.data,
                label: node.data?.label || 'Unnamed Node',
                content: node.data?.content || '',
                days: node.data?.days || 1,
                eventType: node.data?.eventType || 'click',
                onEdit: () => startEditingNode(node),
                onDelete: () => deleteNode(node.id),
              },
              position: node.position || { x: 0, y: 0 },
            }))}
            edges={edges}
            onConnect={onConnect}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default EmailCampaign;