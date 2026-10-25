"use strict";
const form=document.getElementById('scenario-form');
const panels=[...document.querySelectorAll('.step-panel')];
const results=document.getElementById('results');
const resultSection=document.getElementById('result-section');
const inputError=document.getElementById('input-error');
const download=document.getElementById('download-scenario');
const copyButton=document.getElementById('copy-scenario');
const next=document.getElementById('next-step'),previous=document.getElementById('previous-step'),calculateButton=document.getElementById('calculate-button');
const dollars=(n,decimals=0)=>n===null?'—':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(Math.abs(n)<.000001?0:n);
const number=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(Math.abs(n)<.000001?0:n);
const signed=n=>(n>0?'+':'')+number(n);
const set=(id,value)=>document.getElementById(id).textContent=value;
const scrollToElement=el=>el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
let currentStep=0,scenario=null,hasResult=false;
function showStep(index,scroll=false){
 currentStep=Math.max(0,Math.min(2,index));panels.forEach((p,i)=>p.hidden=i!==currentStep);
 previous.hidden=currentStep===0;next.hidden=currentStep===2;calculateButton.hidden=currentStep!==2;
 next.innerHTML=(currentStep===0?'Next: my sales':'Next: my costs')+' <span aria-hidden="true">→</span>';
 set('step-counter',`STEP ${currentStep+1} OF 3`);
 set('step-announcement',`Step ${currentStep+1} of 3: ${panels[currentStep].querySelector('legend').textContent}`);
 document.querySelectorAll('.step-progress i').forEach((el,i)=>el.classList.toggle('active',i<=currentStep));
 if(scroll)scrollToElement(document.querySelector('.wizard-shell'));
}
function validStep(){const bad=[...panels[currentStep].querySelectorAll('input')].find(i=>!i.checkValidity());if(bad){bad.reportValidity();bad.focus();return false;}return true;}
next.addEventListener('click',()=>{if(validStep())showStep(currentStep+1,true);});
previous.addEventListener('click',()=>showStep(currentStep-1,true));
function update(){
 set('download-status','');
 try{
  if(!form.checkValidity())throw new Error('Complete each field with a number in the allowed range.');
  scenario=window.DreamSetterModel.calculate(Object.fromEntries(new FormData(form).entries()));
  inputError.hidden=true;results.classList.remove('invalid-results');download.disabled=false;copyButton.disabled=false;
  const s=scenario;
  set('monthly-result',dollars(s.monthly));set('annual-result',dollars(s.annual));set('result-caption',s.monthly<0?'modeled monthly decrease':s.monthly===0?'modeled monthly change':'potential monthly improvement');
  set('marketing-gain',dollars(s.marketingGain));set('profit-gain',dollars(s.profitGain));set('staff-gain',dollars(s.staffGain));set('extra-cost-result',dollars(-s.input.extraCosts));
  set('extra-bookings',signed(s.extraBookings));set('extra-sales',signed(s.extraSales));set('old-cps',dollars(s.beforeCps));set('new-cps',dollars(s.afterCps,2));
  set('before-bookings',number(s.beforeBookings));set('after-bookings',number(s.afterBookings));set('before-sales',number(s.beforeSales));set('after-sales',number(s.afterSales));
  set('monthly-spend-note',`Marketing spend stays at ${dollars(s.marketingSpend)} per month. AI fees on all ${number(s.afterBookings)} scenario appointments: ${dollars(s.aiCost)}.`);
  set('scenario-assumptions',`Your assumptions: booking rate ${number(s.input.currentRate)}% → ${number(s.input.targetRate)}%; ${number(s.input.netRate)}% of appointments become retained sales; ${dollars(s.input.staffRemoved)} in staffing costs removed. Fractional sales are monthly averages.`);
  return true;
 }catch(error){scenario=null;inputError.hidden=false;inputError.textContent=error.message;results.classList.add('invalid-results');download.disabled=true;copyButton.disabled=true;return false;}
}
form.addEventListener('submit',e=>{
 e.preventDefault();
 if(currentStep<2){if(validStep())showStep(currentStep+1,true);return;}
 const bad=[...form.querySelectorAll('input')].find(i=>!i.checkValidity());
 if(bad){showStep(Number(bad.closest('.step-panel').dataset.step),true);bad.reportValidity();bad.focus();return;}
 if(!update()){scrollToElement(inputError);return;}
 hasResult=true;resultSection.hidden=false;
 const dock=document.getElementById('dock-link');dock.href='#result-section';dock.innerHTML='See my scenario <span aria-hidden="true">↗</span>';
 document.activeElement.blur();document.body.classList.remove('keyboard-open');
 scrollToElement(resultSection);results.focus({preventScroll:true});
});
form.addEventListener('input',()=>{if(hasResult)update();else inputError.hidden=true;});
form.addEventListener('reset',()=>setTimeout(()=>{hasResult=false;scenario=null;resultSection.hidden=true;inputError.hidden=true;set('download-status','');const dock=document.getElementById('dock-link');dock.href='#calculator';dock.innerHTML='Build my own scenario <span aria-hidden="true">↗</span>';showStep(0,true);},0));
// Smoothly bring the first step back into view without discarding entered values.
function editStep(index){showStep(index);scrollToElement(document.querySelector('.wizard-shell'));}
document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>editStep(Number(b.dataset.edit))));
document.getElementById('keep-staff').addEventListener('click',()=>{form.elements.staffRemoved.value='0';if(hasResult)update();});
document.querySelector('[data-explain]').addEventListener('click',()=>{const el=document.getElementById('math-details');el.open=true;scrollToElement(el);el.querySelector('summary').focus({preventScroll:true});});
function scenarioText(){if(!scenario)return '';const s=scenario,x=s.input;
  return [
    'DREAM SETTER | YOUR APPOINTMENT-SETTING SCENARIO',
    'THICK SKIN ◆ SMART CALLS','',
    'Illustrative model. Not a quote, forecast, or guarantee.','',
    'YOUR INPUTS',
    `Monthly leads: ${number(x.leads)}`,`Cost per lead: ${dollars(x.cpl,2)}`,
    `Current booking rate: ${number(x.currentRate)}%`,`Modeled booking rate: ${number(x.targetRate)}%`,
    `Booked-to-net-sale rate: ${number(x.netRate)}%`,`Average sale value: ${dollars(x.saleValue)}`,
    `Baseline profit allowance (after original marketing CPS): ${number(x.profitRate)}%`,
    `Example AI fee per booked appointment: ${dollars(x.aiFee,2)}`,
    `Monthly staffing costs actually removed: ${dollars(x.staffRemoved)}`,
    `Other added monthly costs: ${dollars(x.extraCosts)}`,'',
    'MONTHLY COMPARISON',`Marketing spend held fixed: ${dollars(s.marketingSpend)}`,
    `Appointments: ${number(s.beforeBookings)} → ${number(s.afterBookings)}`,
    `Expected net sales: ${number(s.beforeSales)} → ${number(s.afterSales)}`,
    `Marketing cost per net sale: ${dollars(s.beforeCps,2)} → ${dollars(s.afterCps,2)}`,
    `Added revenue: ${dollars(s.addedRevenue)}`,'',
    'MODELED MONTHLY IMPACT',`Marketing cost improvement: ${dollars(s.marketingGain)}`,
    `Added baseline profit allowance: ${dollars(s.profitGain)}`,
    `Staffing costs removed: ${dollars(x.staffRemoved)}`,
    `AI fees on ALL modeled appointments: ${dollars(-s.aiCost)}`,
    `Other added costs: ${dollars(-x.extraCosts)}`,
    `Total monthly change: ${dollars(s.monthly)}`,`Annualized if sustained: ${dollars(s.annual)}`,'',
    'HOW THIS WORKS',
    'The baseline profit allowance already deducts the original marketing cost per sale. With marketing spend fixed, its lower cost per sale is counted once alongside the baseline allowance on additional revenue. Staffing changes are separate.',
    `Cross-check: added revenue × ${number(s.preMarketingMargin*100)}% before-marketing allowance + staffing removed - AI fees - other added costs = ${dollars(s.monthly)}. Do not add both calculation methods together.`,
    'Net sales are retained after fallout. Fractional sales are monthly averages. No marketing-budget reduction is assumed.',
    'Results depend on your assumptions. The 13% default rate is a target, not a measured result. Final service pricing and billable-appointment terms require confirmation. Include all incremental costs; taxes are excluded.','',
    'Prepared with the Dream Setter website scenario calculator.'
  ].join('\n');
}
download.addEventListener('click',()=>{
 if(!scenario)return;
 const url=URL.createObjectURL(new Blob([scenarioText()],{type:'text/plain;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='Dream-Setter-My-Scenario.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 set('download-status','Your scenario is ready. If this browser blocks downloads, use “Copy my numbers.”');
});
copyButton.addEventListener('click',async()=>{
 if(!scenario)return;const text=scenarioText();
 try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);set('download-status','Copied! Paste your scenario into a message or your notes.');}
 catch{const dialog=document.getElementById('summary-dialog'),area=document.getElementById('summary-text');area.value=text;dialog.showModal();area.focus();area.select();}
});
form.addEventListener('focusin',e=>{if(e.target.matches('input'))document.body.classList.add('keyboard-open');});
form.addEventListener('focusout',()=>setTimeout(()=>{if(!document.activeElement.matches('input'))document.body.classList.remove('keyboard-open');},100));
showStep(0);
