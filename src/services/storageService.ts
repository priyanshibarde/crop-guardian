import { defaultDiagnosis, initialCrops } from '../data/mockData'
import type { Crop, Diagnosis } from '../types'
export type Profile = { name:string; location:string; role:'farmer'|'home-grower' }
const get=<T,>(key:string,fallback:T):T=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}}
const set=(key:string,value:unknown)=>localStorage.setItem(key,JSON.stringify(value))
export const storage={ diagnoses:()=>get<Diagnosis[]>('cg-diagnoses',[defaultDiagnosis]), saveDiagnosis:(d:Diagnosis)=>set('cg-diagnoses',[d,...storage.diagnoses()]), crops:()=>get<Crop[]>('cg-crops',initialCrops), saveCrops:(c:Crop[])=>set('cg-crops',c), language:()=>localStorage.getItem('cg-lang')||'en', saveLanguage:(l:string)=>localStorage.setItem('cg-lang',l), profile:()=>get<Profile | null>('cg-profile',null), saveProfile:(p:Profile)=>set('cg-profile',p), onboardingComplete:()=>localStorage.getItem('cg-onboarding-complete')==='true', completeOnboarding:()=>localStorage.setItem('cg-onboarding-complete','true'), resetOnboarding:()=>{localStorage.removeItem('cg-onboarding-complete');localStorage.removeItem('cg-profile');localStorage.removeItem('cg-lang')} }
