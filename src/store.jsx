
import { createStore } from 'redux';

const initialState = {
  dashboard: {
    widgets: [
      { id: '1', type: 'text', x: 10, y: 10, width: 200, height: 100, content: 'Sample Text' },
      { id: '2', type: 'chart', x: 220, y: 10, width: 300, height: 200, data: { labels: ['Jan', 'Feb', 'Mar', 'Apr'], datasets: [{ label: 'Sample Data', data: [10, 20, 30, 40], backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }] } },
    ],
    theme: 'light',
  },
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_WIDGETS':
      return { ...state, dashboard: { ...state.dashboard, widgets: action.payload } };
    case 'UPDATE_WIDGET':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          widgets: state.dashboard.widgets.map((widget) =>
            widget.id === action.payload.id ? { ...widget, ...action.payload } : widget
          ),
        },
      };
    case 'DELETE_WIDGET':
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          widgets: state.dashboard.widgets.filter((widget) => widget.id !== action.payload),
        },
      };
    default:
      return state;
  }
};

export const setWidgets = (widgets) => ({
  type: 'SET_WIDGETS',
  payload: widgets,
});

export const updateWidget = (widget) => ({
  type: 'UPDATE_WIDGET',
  payload: widget,
});

export const deleteWidget = (id) => ({
  type: 'DELETE_WIDGET',
  payload: id,
});

export const store = createStore(dashboardReducer);
