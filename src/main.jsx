import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import { store } from './emailStore';
import EmailCampaign from './EmailCampaign'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={store}>
   <EmailCampaign />
   </Provider>
  </StrictMode>,
)
