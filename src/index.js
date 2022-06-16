import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './store/reducers/rootReducer'
import { Provider } from 'react-redux'
import { toastError } from './utilities/toaster'


if (window.location.pathname.includes("/admin")) {
  axios.defaults.baseURL = process.env.REACT_APP_ADMIN_API_URL
} else {
  axios.defaults.baseURL = process.env.REACT_APP_CLIENT_API_URL
}

axios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if(error.response.status === 403) {
    toastError("Token Expired")
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = "http://localhost:3000/admin"
  }
  return Promise.reject(error)
})
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

if (localStorage.getItem('token') && localStorage.getItem('user')) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${JSON.parse(localStorage.getItem('token'))}`
}

const store = createStore(rootReducer, compose(
  applyMiddleware(thunk)
))

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  // </React.StrictMode>
);
