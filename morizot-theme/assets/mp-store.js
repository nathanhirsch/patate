/* mp-store.js — reveal, gallery dots, pack + plan selection, sticky bar.
   Guarded against double init (every section references this file). */
(function(){
  if (window.__mpStore) return; window.__mpStore = true;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function reveal(){
    var els = document.querySelectorAll('.mp-reveal:not([data-in])');
    if (!('IntersectionObserver' in window) || reduce){
      els.forEach(function(e){ e.setAttribute('data-in',''); }); return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){ en.target.setAttribute('data-in',''); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    els.forEach(function(e){ io.observe(e); });
  }

  function money(cents, format){
    var v = (cents/100).toFixed(2);
    return (format || '${{amount}}').replace(/\{\{\s*amount[^}]*\}\}/, v);
  }

  function pdp(root){
    var form = root.querySelector('[data-mp-form]');
    if (!form) return;
    var idInput = form.querySelector('[name="id"]');
    var planInput = form.querySelector('[name="selling_plan"]');
    var priceEls = root.querySelectorAll('[data-mp-price]');
    var unitEl = root.querySelector('[data-mp-unit]');
    var submits = root.querySelectorAll('[data-mp-submit]');
    var fmt = root.getAttribute('data-money-format') || '${{amount}}';

    function state(){
      var pack = root.querySelector('.mp-pack[aria-checked="true"]');
      var plan = root.querySelector('.mp-plan[aria-checked="true"]');
      if (!pack) return;
      var price = parseInt(pack.dataset.price || '0', 10);
      var pct = plan && plan.dataset.discount ? parseFloat(plan.dataset.discount) : 0;
      var final = Math.round(price * (1 - pct/100));
      if (idInput) idInput.value = pack.dataset.variantId || '';
      if (planInput) planInput.value = (plan && plan.dataset.planId) || '';
      priceEls.forEach(function(el){ el.textContent = money(final, fmt); });
      // Per-cake price. Count comes from the variant metafield custom.units if
      // set, otherwise the first number in the pack label ("6 cakes" -> 6).
      var count = parseInt(pack.dataset.count, 10);
      if (!count) {
        var nm = pack.querySelector('.mp-pack__n');
        var m = nm && nm.textContent.match(/\d+/);
        count = m ? parseInt(m[0], 10) : 0;
      }
      if (unitEl) {
        unitEl.textContent = count > 1 ? money(Math.round(final / count), fmt) + ' / cake' : '';
      }
      var avail = pack.dataset.available !== 'false';
      submits.forEach(function(b){
        b.disabled = !avail;
        var lab = b.querySelector('[data-mp-label]');
        if (lab && b.dataset.labelSold) lab.textContent = avail ? (b.dataset.label || lab.textContent) : b.dataset.labelSold;
      });
    }

    function group(sel){
      root.querySelectorAll(sel).forEach(function(btn){
        btn.addEventListener('click', function(){
          root.querySelectorAll(sel).forEach(function(o){ o.setAttribute('aria-checked','false'); });
          btn.setAttribute('aria-checked','true');
          state();
        });
      });
    }
    group('.mp-pack'); group('.mp-plan'); state();

    // gallery dots
    var media = root.querySelector('.mp-pdp__media');
    var dots = root.querySelector('.mp-pdp__dots');
    if (media && dots){
      media.addEventListener('scroll', function(){
        var i = Math.round(media.scrollLeft / (media.scrollWidth / media.children.length));
        Array.prototype.forEach.call(dots.children, function(d, n){
          if (n === i) d.setAttribute('data-on',''); else d.removeAttribute('data-on');
        });
      }, { passive: true });
    }

    // sticky bar appears once the inline buy panel scrolls away
    var sticky = root.querySelector('.mp-sticky');
    var anchor = root.querySelector('[data-mp-anchor]');
    if (sticky && anchor && 'IntersectionObserver' in window){
      new IntersectionObserver(function(e){
        if (e[0].isIntersecting) sticky.removeAttribute('data-show');
        else sticky.setAttribute('data-show','');
      }, { threshold: 0 }).observe(anchor);
      sticky.querySelector('[data-mp-sticky-submit]') && sticky.querySelector('[data-mp-sticky-submit]').addEventListener('click', function(){
        form.requestSubmit ? form.requestSubmit() : form.submit();
      });
    }
  }

  function init(){
    reveal();
    document.querySelectorAll('[data-mp-pdp]').forEach(pdp);
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('shopify:section:load', init);
})();
