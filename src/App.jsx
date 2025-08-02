
// import React, { useEffect, useRef } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Rnd } from 'react-rnd';
// import io from 'socket.io-client';
// import Chart from 'chart.js/auto';
// import { setWidgets, updateWidget, deleteWidget } from './store';
// import './index.css';

// const socket = io('http://localhost:3001', {
//   transports: ['websocket', 'polling'],
// });

// const ThemeContext = React.createContext();

// const App = () => {
//   const dispatch = useDispatch();
//   const widgets = useSelector((state) => state.dashboard.widgets);
//   const currentTheme = useSelector((state) => state.dashboard.theme);
//   const chartRefs = useRef({}); // Store Chart.js instances
//   const [theme, setTheme] = React.useState(currentTheme);

//   useEffect(() => {
//     console.log('Widgets:', JSON.stringify(widgets, null, 2));
//     console.log('Widget types:', widgets.map(w => w.type));
//     console.log('Current theme:', theme);

//     socket.on('connect', () => {
//       console.log('Connected to WebSocket server');
//     });

//     socket.on('connect_error', (error) => {
//       console.error('Socket.IO connection error:', error);
//     });

//     socket.on('widget-update', (updatedWidgets) => {
//       console.log('Received widget-update:', JSON.stringify(updatedWidgets, null, 2));
//       dispatch(setWidgets(updatedWidgets.filter(w => w.id && w.type && ['text', 'chart'].includes(w.type))));
//     });

//     return () => {
//       socket.off('connect');
//       socket.off('connect_error');
//       socket.off('widget-update');
//     };
//   }, [dispatch]);

//   useEffect(() => {
//     // Initialize Chart.js for chart widgets
//     widgets.forEach((widget) => {
//       if (widget.type === 'chart' && !chartRefs.current[widget.id]) {
//         const canvas = document.getElementById(`chart-${widget.id}`);
//         if (canvas) {
//           chartRefs.current[widget.id] = new Chart(canvas, {
//             type: 'bar',
//             data: widget.data || {
//               labels: ['Jan', 'Feb', 'Mar', 'Apr'],
//               datasets: [{ label: 'Sample Data', data: [10, 20, 30, 40], backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }],
//             },
//             options: { scales: { y: { beginAtZero: true } }, maintainAspectRatio: false },
//           });
//         }
//       }
//     });

//     // Clean up Chart.js instances
//     return () => {
//       Object.values(chartRefs.current).forEach(chart => chart.destroy());
//       chartRefs.current = {};
//     };
//   }, [widgets]);

//   const handleWidgetChange = (id, x, y, width, height) => {
//     const widget = widgets.find(w => w.id === id);
//     if (!widget) {
//       console.warn('Widget not found:', id);
//       return;
//     }
//     const updatedWidget = { ...widget, x, y, width, height };
//     dispatch(updateWidget(updatedWidget));
//     socket.emit('widget-update', [...widgets.filter(w => w.id !== id), updatedWidget]);
//   };

//   const addChartWidget = () => {
//     const newWidget = {
//       id: `${Date.now()}`,
//       type: 'chart',
//       x: 50,
//       y: 50,
//       width: 300,
//       height: 200,
//       data: {
//         labels: ['Jan', 'Feb', 'Mar', 'Apr'],
//         datasets: [{ label: 'Sample Data', data: [10, 20, 30, 40], backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }],
//       },
//     };
//     const updatedWidgets = [...widgets, newWidget];
//     dispatch(setWidgets(updatedWidgets));
//     socket.emit('widget-update', updatedWidgets);
//   };

//   const addTextWidget = () => {
//     const newWidget = {
//       id: `${Date.now()}`,
//       type: 'text',
//       x: 50,
//       y: 50,
//       width: 200,
//       height: 100,
//       content: 'New Text Widget',
//     };
//     const updatedWidgets = [...widgets, newWidget];
//     dispatch(setWidgets(updatedWidgets));
//     socket.emit('widget-update', updatedWidgets);
//   };

//   const deleteWidgetById = (id) => {
//     const updatedWidgets = widgets.filter(w => w.id !== id);
//     dispatch(deleteWidget(id));
//     socket.emit('widget-update', updatedWidgets);
//     if (chartRefs.current[id]) {
//       chartRefs.current[id].destroy();
//       delete chartRefs.current[id];
//     }
//   };

//   const setLightTheme = () => setTheme('light');
//   const setDarkTheme = () => setTheme('dark');

//   const renderWidget = (widget) => {
//     if (!widget || !widget.type) {
//       console.warn('Invalid widget:', JSON.stringify(widget, null, 2));
//       return <div className="p-4 bg-gray-500 text-white">Invalid Widget</div>;
//     }
//     switch (widget.type.toLowerCase()) {
//       case 'text':
//         return (
//           <div className="p-4 bg-blue-500 text-white relative">
//             Text Widget: {widget.content || 'No content'}
//             <button
//               onClick={() => deleteWidgetById(widget.id)}
//               className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
//             >
//               X
//             </button>
//           </div>
//         );
//       case 'chart':
//         return (
//           <div className="p-4 bg-white dark:bg-gray-800 relative">
//             <canvas id={`chart-${widget.id}`} width={widget.width - 32} height={widget.height - 32}></canvas>
//             <button
//               onClick={() => deleteWidgetById(widget.id)}
//               className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
//             >
//               X
//             </button>
//           </div>
//         );
//       default:
//         console.warn('Unknown widget type:', widget.type);
//         return <div className="p-4 bg-gray-500 text-white">Unknown Widget: {widget.type}</div>;
//     }
//   };

//   return (
//     <ThemeContext.Provider value={theme}>
//       <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'} transition-colors duration-300`}>
//         <div className="p-4">
//           <div className="flex space-x-4 mb-4" style={{ zIndex: 20, position: 'relative' }}>
//             <button
//               onClick={setLightTheme}
//               className={`px-4 py-2 rounded text-white ${theme === 'light' ? 'bg-blue-800' : 'bg-blue-600'} hover:bg-blue-700`}
//               style={{ minWidth: '120px' }}
//             >
//               Light Theme
//             </button>
//             <button
//               onClick={setDarkTheme}
//               className={`px-4 py-2 rounded text-white ${theme === 'dark' ? 'bg-blue-800' : 'bg-blue-600'} hover:bg-blue-700`}
//               style={{ minWidth: '120px' }}
//             >
//               Dark Theme
//             </button>
//             <button
//               onClick={addChartWidget}
//               className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//               style={{ minWidth: '120px' }}
//             >
//               Add Chart Widget
//             </button>
//             <button
//               onClick={addTextWidget}
//               className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
//               style={{ minWidth: '120px' }}
//             >
//               Add Text Widget
//             </button>
//           </div>
//           <div className="relative h-[600px] border border-gray-300 bg-white" style={{ zIndex: 10 }}>
//             {widgets.length === 0 ? (
//               <div className="p-4 text-gray-500">No widgets available. Add a widget!</div>
//             ) : (
//               widgets.map((widget) => (
//                 <Rnd
//                   key={widget.id}
//                   size={{ width: widget.width, height: widget.height }}
//                   position={{ x: widget.x, y: widget.y }}
//                   onDragStop={(e, d) => handleWidgetChange(widget.id, d.x, d.y, widget.width, widget.height)}
//                   onResizeStop={(e, direction, ref, delta, position) =>
//                     handleWidgetChange(widget.id, position.x, position.y, ref.offsetWidth, ref.offsetHeight)
//                   }
//                   bounds="parent"
//                   style={{ zIndex: 15 }}
//                 >
//                   <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-800'} shadow-md rounded overflow-visible`}>
//                     {renderWidget(widget)}
//                   </div>
//                 </Rnd>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </ThemeContext.Provider>
//   );
// };

// export default App;

import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Rnd } from 'react-rnd';
import io from 'socket.io-client';
import Chart from 'chart.js/auto';
import { setWidgets, updateWidget, deleteWidget } from './store';
import './index.css';

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
});

const ThemeContext = React.createContext();

const App = () => {
  const dispatch = useDispatch();
  const widgets = useSelector((state) => state.dashboard.widgets);
  const currentTheme = useSelector((state) => state.dashboard.theme);
  const chartRefs = useRef({});
  const [theme, setTheme] = useState(currentTheme);
  const [editingWidget, setEditingWidget] = useState(null);

  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    socket.on('connect', () => {
      console.log('Connected to WebSocket server:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message, error);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log('Reconnection attempt:', attempt);
    });

    socket.on('widget-update', (updatedWidgets) => {
      console.log('Received widget-update:', JSON.stringify(updatedWidgets, null, 2));
      const validWidgets = updatedWidgets.filter(w => w.id && w.type && ['text', 'chart'].includes(w.type));
      dispatch(setWidgets(validWidgets));
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('reconnect_attempt');
      socket.off('widget-update');
    };
  }, [dispatch]);

  useEffect(() => {
    widgets.forEach((widget) => {
      if (widget.type === 'chart' && !chartRefs.current[widget.id]) {
        const canvas = document.getElementById(`chart-${widget.id}`);
        if (canvas) {
          chartRefs.current[widget.id] = new Chart(canvas, {
            type: 'bar',
            data: widget.data || {
              labels: ['Jan', 'Feb', 'Mar', 'Apr'],
              datasets: [{ label: 'Sample Data', data: [10, 20, 30, 40], backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }],
            },
            options: { scales: { y: { beginAtZero: true } }, maintainAspectRatio: false },
          });
        }
      }
    });

    return () => {
      Object.values(chartRefs.current).forEach(chart => chart.destroy());
      chartRefs.current = {};
    };
  }, [widgets]);

  const handleWidgetChange = (id, x, y, width, height) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) {
      console.warn('Widget not found:', id);
      return;
    }
    const updatedWidget = { ...widget, x, y, width, height };
    dispatch(updateWidget(updatedWidget));
    socket.emit('widget-update', [...widgets.filter(w => w.id !== id), updatedWidget]);
  };

  const addChartWidget = () => {
    const newWidget = {
      id: `${Date.now()}`,
      type: 'chart',
      x: 50,
      y: 50,
      width: 300,
      height: 200,
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr'],
        datasets: [{ label: 'Sample Data', data: [10, 20, 30, 40], backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }],
      },
    };
    const updatedWidgets = [...widgets, newWidget];
    dispatch(setWidgets(updatedWidgets));
    socket.emit('widget-update', updatedWidgets);
  };

  const addTextWidget = () => {
    const newWidget = {
      id: `${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      width: 200,
      height: 100,
      content: 'New Text Widget',
    };
    const updatedWidgets = [...widgets, newWidget];
    dispatch(setWidgets(updatedWidgets));
    socket.emit('widget-update', updatedWidgets);
  };

  const deleteWidgetById = (id) => {
    const updatedWidgets = widgets.filter(w => w.id !== id);
    dispatch(deleteWidget(id));
    socket.emit('widget-update', updatedWidgets);
    if (chartRefs.current[id]) {
      chartRefs.current[id].destroy();
      delete chartRefs.current[id];
    }
  };

  const startEditingWidget = (widget) => {
    setEditingWidget({ ...widget });
  };

  const saveWidgetChanges = () => {
    if (!editingWidget) return;
    const updatedWidgets = widgets.map(w => (w.id === editingWidget.id ? editingWidget : w));
    dispatch(setWidgets(updatedWidgets));
    socket.emit('widget-update', updatedWidgets);
    setEditingWidget(null);
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  const renderWidget = (widget) => {
    if (!widget || !widget.type) {
      console.warn('Invalid widget:', JSON.stringify(widget, null, 2));
      return <div className="p-4 bg-gray-500 text-white">Invalid Widget</div>;
    }
    switch (widget.type.toLowerCase()) {
      case 'text':
        return (
          <div className="p-4 bg-blue-500 text-white relative">
            Text Widget: {widget.content || 'No content'}
            <button
              onClick={() => startEditingWidget(widget)}
              className="absolute top-1 right-8 bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ✎
            </button>
            <button
              onClick={() => deleteWidgetById(widget.id)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              X
            </button>
          </div>
        );
      case 'chart':
        return (
          <div className="p-4 bg-white dark:bg-gray-800 relative">
            <canvas id={`chart-${widget.id}`} width={widget.width - 32} height={widget.height - 32}></canvas>
            <button
              onClick={() => startEditingWidget(widget)}
              className="absolute top-1 right-8 bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ✎
            </button>
            <button
              onClick={() => deleteWidgetById(widget.id)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              X
            </button>
          </div>
        );
      default:
        console.warn('Unknown widget type:', widget.type);
        return <div className="p-4 bg-gray-500 text-white">Unknown Widget: {widget.type}</div>;
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div className={`min-h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'} transition-colors duration-300`}>
        <div className="p-4">
          <div className="flex space-x-4 mb-4" style={{ zIndex: 20, position: 'relative' }}>
            <button
              onClick={setLightTheme}
              className={`px-4 py-2 rounded text-white ${theme === 'light' ? 'bg-blue-800' : 'bg-blue-600'} hover:bg-blue-700`}
              style={{ minWidth: '120px' }}
            >
              Light Theme
            </button>
            <button
              onClick={setDarkTheme}
              className={`px-4 py-2 rounded text-white ${theme === 'dark' ? 'bg-blue-800' : 'bg-blue-600'} hover:bg-blue-700`}
              style={{ minWidth: '120px' }}
            >
              Dark Theme
            </button>
            <button
              onClick={addChartWidget}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              style={{ minWidth: '120px' }}
            >
              Add Chart Widget
            </button>
            <button
              onClick={addTextWidget}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              style={{ minWidth: '120px' }}
            >
              Add Text Widget
            </button>
          </div>
          {editingWidget && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-lg font-bold mb-2">Edit Widget</h2>
                {editingWidget.type === 'text' ? (
                  <div>
                    <label className="block mb-1">Content</label>
                    <input
                      type="text"
                      value={editingWidget.content || ''}
                      onChange={(e) => setEditingWidget({ ...editingWidget, content: e.target.value })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block mb-1">Chart Labels (comma-separated)</label>
                    <input
                      type="text"
                      value={editingWidget.data?.labels.join(',') || ''}
                      onChange={(e) => setEditingWidget({
                        ...editingWidget,
                        data: { ...editingWidget.data, labels: e.target.value.split(',').map(l => l.trim()) }
                      })}
                      className="w-full p-2 border rounded"
                    />
                    <label className="block mb-1 mt-2">Chart Data (comma-separated)</label>
                    <input
                      type="text"
                      value={editingWidget.data?.datasets[0].data.join(',') || ''}
                      onChange={(e) => setEditingWidget({
                        ...editingWidget,
                        data: {
                          ...editingWidget.data,
                          datasets: [{ ...editingWidget.data.datasets[0], data: e.target.value.split(',').map(d => parseInt(d.trim()) || 0) }]
                        }
                      })}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={saveWidgetChanges}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingWidget(null)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="relative h-[600px] border border-gray-300 bg-white" style={{ zIndex: 10 }}>
            {widgets.length === 0 ? (
              <div className="p-4 text-gray-500">No widgets available. Add a widget!</div>
            ) : (
              widgets.map((widget) => (
                <Rnd
                  key={widget.id}
                  size={{ width: widget.width, height: widget.height }}
                  position={{ x: widget.x, y: widget.y }}
                  onDragStop={(e, d) => handleWidgetChange(widget.id, d.x, d.y, widget.width, widget.height)}
                  onResizeStop={(e, direction, ref, delta, position) =>
                    handleWidgetChange(widget.id, position.x, position.y, ref.offsetWidth, ref.offsetHeight)
                  }
                  bounds="parent"
                  style={{ zIndex: 15 }}
                >
                  <div className={`${theme === 'light' ? 'bg-white' : 'bg-gray-800'} shadow-md rounded overflow-visible`}>
                    {renderWidget(widget)}
                  </div>
                </Rnd>
              ))
            )}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default App;
