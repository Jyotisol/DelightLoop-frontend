import { createStore } from 'redux';

const initialState = {
  campaign: {
    nodes: [
      {
        id: '1',
        type: 'email',
        data: { label: 'Welcome Email', content: 'Hello!' },
        position: { x: 50, y: 50 },
      },
      {
        id: '2',
        type: 'delay',
        data: { label: 'Wait 3 Days', days: 3 },
        position: { x: 50, y: 150 },
      },
    ],
    edges: [{ id: 'e1-2', source: '1', target: '2' }],
  },
};

const campaignReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_NODES':
      return { ...state, campaign: { ...state.campaign, nodes: action.payload } };
    case 'SET_EDGES':
      return { ...state, campaign: { ...state.campaign, edges: action.payload } };
    case 'UPDATE_NODE':
      return {
        ...state,
        campaign: {
          ...state.campaign,
          nodes: state.campaign.nodes.map((node) =>
            node.id === action.payload.id ? { ...node, ...action.payload } : node
          ),
        },
      };
    default:
      return state;
  }
};

export const setNodes = (nodes) => ({
  type: 'SET_NODES',
  payload: nodes,
});

export const setEdges = (edges) => ({
  type: 'SET_EDGES',
  payload: edges,
});

export const updateNode = (node) => ({
  type: 'UPDATE_NODE',
  payload: node,
});

export const store = createStore(campaignReducer);