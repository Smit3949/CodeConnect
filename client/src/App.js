import IDE from './components/IDE.jsx';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Redirect to = {`/${uuidV4()}`} />
        </Route>
     
        <Route path="/:id" component={IDE} />
      </Switch>
    </Router>
  );
}

export default App;
