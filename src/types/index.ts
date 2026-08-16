export type Severity = 'High' | 'Moderate' | 'Low'
export type Diagnosis = { id:string; crop:string; disease:string; scientific:string; severity:Severity; confidence:number; image?:string; symptoms:string[]; actions:string[]; prevention:string; recovery:number; date:string }
export type Crop = { id:string; name:string; variety:string; stage:string; health:number; nextTask:string; color:string }
export type Hotspot = { id:string; district:string; state:string; disease:string; severity:Severity; reports:number; trend:number; position:[number,number] }
export type Pet = { id:string; name:string; type:string; breed?:string }
export type CropChoice = 'Rice'|'Wheat'|'Maize'|'Cotton'|'Sugarcane'|'Tomato'|'Potato'|'Onion'|'Soybean'|'Chickpea'|'Groundnut'|'Mustard'|'Chilli'|'Grapes'|'Mango'|'Banana'|'Other'
export type UserProfile = { name:string; location:string; role:'farmer'|'home-grower'; language:string; selectedCrops:CropChoice[]; pets:Pet[]; onboardingCompleted:boolean }
