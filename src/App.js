import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom' 
import GlobalStyles from './globalStyles'
import { Navbar, Footer } from './components';
import Home from './pages/HomePage/Home';
import Products from './pages/Products/Products';
import SignUp from './pages/SignUp/SignUp';
import AITuongSo from './pages/AITuongSo/AITuongSo';
import AIBabyCry from './pages/AIBabyCry/AIBabyCry';
import AIAcne from './pages/AIAcne/AIAcne';
import ScrollToTop from './components/ScrollToTop';

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
