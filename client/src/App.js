import IDE from './components/IDE.jsx';

import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';
import { 
  ClerkProvider, 
  RedirectToSignIn, 
  SignedIn, 
  SignedOut, 
  UserButton, 
  useUser 
} from '@clerk/clerk-react';

// Retrieve Clerk settings from the environment
const clerkFrontendApi = process.env.REACT_APP_CLERK_FRONTEND_API;

function App() {
  return (
    <Router>
      <ClerkProvider frontendApi={clerkFrontendApi}>
        <Switch>
          <Route>
            <SignedIn>
              <UserButton />
              <Navigation />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </Route>
        </Switch>
      </ClerkProvider>
    </Router>
  );
}

function PrivateRoute(props) {
  // If the route matches but the user is not signed in, redirect to /sign-in
  return (
    <>
      <SignedIn>
        <Route {...props} />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

function Navigation() {
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
