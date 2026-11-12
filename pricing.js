/* NP's Electrical Services - shared price list & computation.
   EDIT THE RATES HERE ONLY: every page (quotation, services, mini estimators) reads from this file.
   price = rate per unit, min = minimum charge for the line (0 = none). Sample rates - replace with NP's actual rates. */
window.NP = (function () {
  const CATALOG = [
    { id:'m-ac',   cat:'motor',  name:'AC-DC Motor Rewinding',            unit:'HP',            price:900,   min:3500 },
    { id:'m-hv',   cat:'motor',  name:'LV & HV Rewinding',                unit:'kW',            price:1800,  min:25000 },
    { id:'m-comm', cat:'motor',  name:'Commutator Repair',                unit:'unit',          price:6500,  min:0 },
    { id:'m-slip', cat:'motor',  name:'Slip-Ring Repair',                 unit:'unit',          price:7500,  min:0 },
    { id:'m-gen',  cat:'motor',  name:'Generator Stator / Rotor Rewind',  unit:'kVA',           price:750,   min:15000 },
    { id:'m-term', cat:'motor',  name:'LV & HV Termination',              unit:'termination',   price:3500,  min:0 },
    { id:'m-conv', cat:'motor',  name:'Conversion Services',              unit:'unit',          price:5000,  min:0 },
    { id:'m-ctrl', cat:'motor',  name:'Motor Control Panel (DOL / Star-Delta)', unit:'panel',    price:18000, min:0 },
    { id:'d-pee',  cat:'design', name:'Electrical Design & PEE Sign/Seal',unit:'sq.m floor area',price:120,  min:15000 },
    { id:'d-plmb', cat:'design', name:'Plumbing Design',                  unit:'sq.m floor area',price:90,   min:12000 },
    { id:'f-fdas', cat:'fire',   name:'FDAS (Fire Alarm) Installation',   unit:'device point',  price:3200,  min:25000 },
    { id:'f-pro',  cat:'fire',   name:'FirePro Aerosol Installation',     unit:'unit',          price:28000, min:0 },
    { id:'f-cctv', cat:'fire',   name:'CCTV Installation',                unit:'camera',        price:6500,  min:0 },
    { id:'g-inst', cat:'general',name:'Electrical Installation',          unit:'outlet / point',price:1200,  min:5000 },
    { id:'g-acin', cat:'general',name:'Aircon Installation (Split-type)', unit:'unit',          price:6500,  min:0 },
    { id:'g-accl', cat:'general',name:'Aircon Cleaning / Maintenance',    unit:'unit',          price:1200,  min:0 },
    { id:'t-ts',   cat:'general',name:'Troubleshooting',                  unit:'site visit',    price:2500,  min:0 },
    { id:'t-pms',  cat:'general',name:'PMS (Preventive Maintenance)',     unit:'site visit',    price:6000,  min:0 }
  ];
  const ZONES = [ // mobilization / travel
    { id:'z0', label:'Within the city / workshop area', fee:0 },
    { id:'z1', label:'Within the province',             fee:1500 },
    { id:'z2', label:'Outside the province',            fee:3500 }
  ];
  const RUSH = 0.25;      // 24/7 emergency / rush surcharge on services subtotal
  const VALID_DAYS = 15;  // quotation validity
  const peso = n => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits:2, maximumFractionDigits:2 });
  const get = id => CATALOG.find(c => c.id === id);
  function line(id, qty) { const c = get(id); const raw = c.price * qty; return { c, qty, raw, amount: qty > 0 ? Math.max(raw, c.min) : 0 }; }
  function compute(items, zoneId, rush) {
    const lines = items.filter(i => i.qty > 0).map(i => line(i.id, i.qty));
    const subtotal = lines.reduce((s, l) => s + l.amount, 0);
    const mob = lines.length ? (ZONES.find(z => z.id === zoneId) || ZONES[0]).fee : 0;
    const rushAmt = rush ? subtotal * RUSH : 0;
    return { lines, subtotal, mob, rushAmt, total: subtotal + mob + rushAmt };
  }
  // small estimator used on the service pages
  function mountMini(el) {
    const cats = el.dataset.cat.split(',');
    const list = CATALOG.filter(c => cats.includes(c.cat));
    el.innerHTML = `
      <div class="space-y-4">
        <div><label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Service</label>
          <select id="me-s" class="w-full bg-brand-darker border border-brand-border rounded-lg px-4 py-3 text-sm text-white">
            ${list.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
        <div><label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Quantity (<span id="me-u"></span>)</label>
          <input id="me-q" type="number" min="1" value="1" class="w-full bg-brand-darker border border-brand-border rounded-lg px-4 py-3 text-sm text-white"></div>
        <div class="bg-brand-darker border border-brand-border rounded-xl p-4 text-sm">
          <div class="flex justify-between text-gray-400"><span id="me-calc"></span><span id="me-raw"></span></div>
          <div id="me-min" class="text-[11px] text-gray-500 mt-1"></div>
          <div class="flex justify-between mt-3 pt-3 border-t border-brand-border font-black text-white text-lg"><span>Estimated Total</span><span id="me-t" class="text-brand-yellow"></span></div>
        </div>
        <a id="me-go" href="quotation.html" class="block w-full py-4 rounded-xl yellow-gradient text-black font-extrabold text-sm uppercase tracking-wider text-center">Add to Full Quotation →</a>
        <p class="text-[11px] text-gray-500 text-center">Estimate only. Final price is confirmed after site inspection. Non-VAT.</p>
      </div>`;
    const $ = s => el.querySelector(s);
    function upd() {
      const c = get($('#me-s').value), q = Math.max(1, parseFloat($('#me-q').value) || 1), l = line(c.id, q);
      $('#me-u').textContent = c.unit;
      $('#me-calc').textContent = `${q} ${c.unit} × ${peso(c.price)}`;
      $('#me-raw').textContent = peso(l.raw);
      $('#me-min').textContent = c.min ? `Minimum charge: ${peso(c.min)}` : '';
      $('#me-t').textContent = peso(l.amount);
      $('#me-go').href = `quotation.html?items=${c.id}:${q}`;
    }
    el.addEventListener('input', upd); upd();
  }
  return { CATALOG, ZONES, RUSH, VALID_DAYS, peso, get, compute, mountMini };
})();
