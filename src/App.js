import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom' 
import GlobalStyles from './globalStyles'
import { Navbar, Footer } from './components';
import Home from './pages/HomePage/Home';
import Products from './pages/Products/Products';
import SignUp from './pages/SignUp/SignUp';
import AITuongSo from './pages/AITuongSo/AITuongSo';
import AIBabyCry from './pages/AIBabyCry/AIBabyCry';
// import AIAcne from './pages/AIAcne/AIAcne';
import ScrollToTop from './components/ScrollToTop';

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * The App component is the top-level component for the application.
 * It contains a Router with routes to each of the pages in the application.
 * The Router also contains a GlobalStyles component which applies global CSS styles to the application.
 * The ScrollToTop component is used to scroll to the top of the page when a route changes.
 * The Navbar component is used to render the navigation bar for the application.
 * The Switch component is used to render the correct page based on the current route.
 * The Footer component is used to render the footer for the application.
 */
/*******  81ec9518-0a71-442b-8b13-ddc11a2d3dfa  *******/
function App() {
  return (
    
      <Router basename="/CalnovaAI">
          <GlobalStyles />
          <ScrollToTop />
          <Navbar />
          <Switch>
            <Route path='/' exact component={Home} />
            <Route path='/products' component={Products} />
            <Route path='/ai-tuong-so' component={AITuongSo} />
            <Route path='/ai-baby-cry' component={AIBabyCry} />
            {/* <Route path='/ai-acne' component={AIAcne} /> */}
            <Route path='/sign-up' component={SignUp} />
          </Switch>
          <Footer />
      </Router>
        
    
  );
}

export default App;
