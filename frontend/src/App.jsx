import React from 'react'
import Home from './pages/Home/Home';
import {Routes, Route} from "react-router-dom"
import { RunAuditPage } from './pages/Audit/AuditPage';
import { ResultsPage } from './pages/Results/ResultsPage';
import Header from './components/Header/Header';
import { PricingPage } from './pages/Pricing/PricingPage';
import { ContactPage } from './pages/Contact/Contact';
import { PrivacyPage } from './pages/Privacy/PrivacyPage';
import { TermsPage } from './pages/Terms/TermsPage';
import { FeaturesPage } from './pages/Features/Features';
import { Footer } from './pages/Footer/Footer';
import { SignupPage } from './pages/Signup/Signup';
import { LoginPage } from './pages/Login/Login';

const App = () => {
  return (
    <>
      <Header />
      <Routes>
         <Route path='/' element={<Home />}/>
         <Route path='/scan' element={<RunAuditPage />}/> 
         <Route path='/result' element={<ResultsPage />}/>
         <Route path='/pricing' element={<PricingPage />}/>
         <Route path='/contact' element={<ContactPage />}/>
         <Route path='/privacy' element={<PrivacyPage />}/>
         <Route path='/terms' element={<TermsPage />}/>
         <Route path='/features' element={<FeaturesPage />}/>
         <Route path='/signup' element={<SignupPage />}/>
         <Route path='/signin' element={<LoginPage />}/>
      </Routes>
      <Footer />
    </>
  )
}

export default App
