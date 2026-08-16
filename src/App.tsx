import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LanguageProvider } from './i18n'
import { AlertsPage, AuthPage, CalculatorPage, CropsPage, DiagnosisPage, HomePage, HotspotsPage, LanguageSelectionPage, ProfilePage, ProfileSetupPage, ScanPage, WelcomePage } from './pages'
import { storage } from './services/storageService'
import { AuthProvider, useAuth } from './context/AuthContext'

function RequireAuth({children}:{children:ReactNode}) { const {status}=useAuth(); if(status==='loading') return <div className="grid min-h-screen place-items-center text-sm font-bold text-forest">Loading Crop Guardian…</div>; return status==='authenticated'?<>{children}</>:<Navigate to="/onboarding/auth" replace /> }
function RequireOnboarding({children}:{children:ReactNode}) { return storage.onboardingComplete() ? <>{children}</> : <Navigate to="/onboarding/language" replace /> }
function OnboardingRoute() { return storage.onboardingComplete() ? <Navigate to="/" replace /> : <Outlet /> }
export default function App() { return <LanguageProvider><AuthProvider><BrowserRouter><Routes>
  <Route element={<OnboardingRoute/>}><Route path="/onboarding/language" element={<LanguageSelectionPage/>}/><Route path="/onboarding/auth" element={<AuthPage/>}/><Route path="/onboarding/welcome" element={<WelcomePage/>}/><Route path="/onboarding/setup" element={<ProfileSetupPage/>}/><Route path="/onboarding/profile" element={<ProfileSetupPage/>}/></Route>
  <Route element={<RequireAuth><RequireOnboarding><AppLayout/></RequireOnboarding></RequireAuth>}><Route path="/" element={<HomePage/>}/><Route path="/scan" element={<ScanPage/>}/><Route path="/diagnosis/:id" element={<DiagnosisPage/>}/><Route path="/hotspots" element={<HotspotsPage/>}/><Route path="/crops" element={<CropsPage/>}/><Route path="/alerts" element={<AlertsPage/>}/><Route path="/calculator" element={<CalculatorPage/>}/><Route path="/profile" element={<ProfilePage/>}/></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></BrowserRouter></AuthProvider></LanguageProvider> }
