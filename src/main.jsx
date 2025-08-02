import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { Provider } from 'react-redux'
// import { store } from './store'
import { store } from './emailStore';
import EmailCampaign from './EmailCampaign'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={store}>
   {/* <App /> */}
   <EmailCampaign />
   </Provider>
  </StrictMode>,
)
