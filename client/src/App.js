import IDE from './components/IDE';
import CPP from './components/CPP';
import JAVA from './components/JAVA';
import Python from './components/Python';
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
     
        <Route path="/:id" component={Python} />
      </Switch>
    </Router>
  );
}

export default App;
