export type Severity = 'High' | 'Moderate' | 'Low'
export type Diagnosis = { id:string; crop:string; disease:string; scientific:string; severity:Severity; confidence:number; image?:string; symptoms:string[]; actions:string[]; prevention:string; recovery:number; date:string }
export type Crop = { id:string; name:string; variety:string; stage:string; health:number; nextTask:string; color:string }
export type Hotspot = { id:string; district:string; state:string; disease:string; severity:Severity; reports:number; trend:number; position:[number,number] }
