import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Route} from 'react-router';
import { BrowserRouter } from 'react-router-dom'

import Manager from './Manager'
import registerServiceWorker from './registerServiceWorker';


ReactDOM.render(
    <BrowserRouter>
    <div>
      <Route path='/' exact component={Manager} />
      <Route path='/search' component={Manager} />
    </div>
  </BrowserRouter>,
  document.getElementById('root')
);
registerServiceWorker();
