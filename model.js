(function (root) {
  'use strict';
  const defaults = Object.freeze({leads:500,cpl:50,currentRate:10,targetRate:13,netRate:25,saleValue:10000,profitRate:10,aiFee:50,staffRemoved:6450,extraCosts:0});
  function calculate(input) {
    const x = {};
    for (const key of Object.keys(defaults)) {
      x[key] = Number(input[key]);
      if (!Number.isFinite(x[key]) || x[key] < 0) throw new Error('Enter a valid, nonnegative value in every field.');
    }
    if (!x.leads || !x.currentRate || !x.netRate || !x.saleValue) throw new Error('Leads, current booking rate, net-sale rate, and sale value must be greater than zero.');
    if ([x.currentRate,x.targetRate,x.netRate,x.profitRate].some(n=>n>100)) throw new Error('Percentage inputs must be 100% or less.');
    const marketingSpend=x.leads*x.cpl;
    const beforeBookings=x.leads*x.currentRate/100;
    const afterBookings=x.leads*x.targetRate/100;
    const beforeSales=beforeBookings*x.netRate/100;
    const afterSales=afterBookings*x.netRate/100;
    const extraBookings=afterBookings-beforeBookings;
    const extraSales=afterSales-beforeSales;
    const beforeCps=marketingSpend/beforeSales;
    const afterCps=afterSales>0?marketingSpend/afterSales:null;
    const preMarketingMargin=x.profitRate/100+beforeCps/x.saleValue;
    if (preMarketingMargin>1+1e-9) throw new Error('These inputs imply a profit allowance above 100% before marketing. Review your sale value, rates, cost per lead, and profit allowance.');
    const addedRevenue=extraSales*x.saleValue;
    // Stable equivalent of (old CPS - new CPS) * new sales, including zero new sales.
    const marketingGain=extraSales*beforeCps;
    const profitGain=addedRevenue*x.profitRate/100;
    const aiCost=afterBookings*x.aiFee;
    const staffGain=x.staffRemoved-aiCost;
    const monthly=marketingGain+profitGain+staffGain-x.extraCosts;
    return {input:x,marketingSpend,beforeBookings,afterBookings,beforeSales,afterSales,extraBookings,extraSales,beforeCps,afterCps,preMarketingMargin,addedRevenue,marketingGain,profitGain,aiCost,staffGain,monthly,annual:monthly*12};
  }
  const api={defaults,calculate};
  if (typeof module!=='undefined' && module.exports) module.exports=api;
  if(root) root.DreamSetterModel=api;
})(typeof window==='undefined'?null:window);
