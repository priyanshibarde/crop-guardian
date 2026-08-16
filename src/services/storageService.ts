import { defaultDiagnosis, initialCrops } from '../data/mockData'
import type { Crop, Diagnosis, UserProfile } from '../types'
export type Profile = UserProfile
const get=<T,>(key:string,fallback:T):T=>{try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback}catch{return fallback}}
const set=(key:string,value:unknown)=>localStorage.setItem(key,JSON.stringify(value))
export const storage={
 diagnoses:()=>get<Diagnosis[]>('cg-diagnoses',[defaultDiagnosis]),
 saveDiagnosis:(d:Diagnosis)=>set('cg-diagnoses',[d,...storage.diagnoses()]),
 crops:()=>{const saved=get<Crop[]>('cg-crops',initialCrops);const p=get<Profile|null>('cg-profile',null);return p?.selectedCrops?.length?p.selectedCrops.map((name,i)=>({...saved[i%saved.length],id:`selected-${i}`,name})):saved}, saveCrops:(c:Crop[])=>set('cg-crops',c),
 language:()=>localStorage.getItem('cg-lang')||'en', saveLanguage:(l:string)=>localStorage.setItem('cg-lang',l),
 profile:()=>get<Profile | null>('cg-profile',null), saveProfile:(p:Profile)=>{set('cg-profile',p);storage.saveLanguage(p.language)},
 onboardingComplete:()=>storage.profile()?.onboardingCompleted===true || localStorage.getItem('cg-onboarding-complete')==='true',
 completeOnboarding:()=>localStorage.setItem('cg-onboarding-complete','true'),
 resetOnboarding:()=>{localStorage.removeItem('cg-onboarding-complete');localStorage.removeItem('cg-profile')}
}
