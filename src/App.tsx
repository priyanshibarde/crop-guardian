import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LanguageProvider, useLanguage, type LanguageCode } from './i18n'
import { AlertsPage, AuthPage, CalculatorPage, CropDetailPage, CropsPage, DiagnosisHistoryPage, DiagnosisPage, HomePage, HotspotsPage, LanguageSelectionPage, ProfilePage, ProfileSetupPage, ScanPage, WelcomePage } from './pages'
import { AuthProvider, useAuth } from './context/AuthContext'

function RequireAuth({children}:{children:ReactNode}) { const {status}=useAuth(); if(status==='loading') return <div className="grid min-h-screen place-items-center text-sm font-bold text-forest">Loading Crop Guardian…</div>; return status==='authenticated'?<>{children}</>:<Navigate to="/onboarding/welcome" replace /> }
function RequireOnboarding({children}:{children:ReactNode}) { const {status,profile}=useAuth(); if(status==='loading') return <div className="grid min-h-screen place-items-center text-sm font-bold text-forest">Loading Crop Guardian…</div>; return status==='authenticated'&&profile?.onboardingCompleted?<>{children}</>:<Navigate to="/onboarding/setup" replace /> }
function OnboardingRoute() { const {status,profile}=useAuth(); const location=useLocation(); if(status==='loading') return <div className="grid min-h-screen place-items-center text-sm font-bold text-forest">Loading Crop Guardian…</div>; if(status==='authenticated'&&profile?.onboardingCompleted&&location.pathname==='/onboarding/setup') return <Navigate to="/" replace />; return <Outlet /> }
function LanguageSync() { const {profile}=useAuth(); const {setLang}=useLanguage(); useEffect(() => { if(profile?.language) setLang(profile.language as LanguageCode) }, [profile?.language]); return null }
export default function App() { return <LanguageProvider><AuthProvider><LanguageSync/><BrowserRouter><Routes>
  <Route element={<OnboardingRoute/>}><Route path="/onboarding/language" element={<LanguageSelectionPage/>}/><Route path="/onboarding/auth" element={<AuthPage/>}/><Route path="/onboarding/welcome" element={<WelcomePage/>}/><Route path="/onboarding/setup" element={<ProfileSetupPage/>}/><Route path="/onboarding/profile" element={<ProfileSetupPage/>}/></Route>
  <Route element={<RequireAuth><RequireOnboarding><AppLayout/></RequireOnboarding></RequireAuth>}><Route path="/" element={<HomePage/>}/><Route path="/scan" element={<ScanPage/>}/><Route path="/diagnoses" element={<DiagnosisHistoryPage/>}/><Route path="/diagnosis/:id" element={<DiagnosisPage/>}/><Route path="/hotspots" element={<HotspotsPage/>}/><Route path="/crops" element={<CropsPage/>}/><Route path="/crops/:id" element={<CropDetailPage/>}/><Route path="/alerts" element={<AlertsPage/>}/><Route path="/calculator" element={<CalculatorPage/>}/><Route path="/profile" element={<ProfilePage/>}/></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
</Routes></BrowserRouter></AuthProvider></LanguageProvider> }
