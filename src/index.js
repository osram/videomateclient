import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Route} from 'react-router';
import { BrowserRouter } from 'react-router-dom'

import Manager from './components/Manager'
import Search from './components/Search'
import registerServiceWorker from './registerServiceWorker';


ReactDOM.render(
    <BrowserRouter>
    <div>
      <Route path='/' exact component={Search} />
      <Route path='/manager' component={Manager} />
    </div>
  </BrowserRouter>,
  document.getElementById('root')
);
registerServiceWorker();
