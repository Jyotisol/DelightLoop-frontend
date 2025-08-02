import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux'
import EmailCampaign from './EmailCampaign'
import { store } from './emailStore'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={store}>
   <EmailCampaign />
   </Provider>
  </StrictMode>,
)
