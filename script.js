/* Preluxe Digitals — full motion ON: menu, reveal, autoplay showreel + previews, prompt auto-cycle, filters, form, motion toggle */
(function(){
  "use strict";
  document.documentElement.classList.add("js");
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  function $(s,c){return (c||document).querySelector(s);}
  function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));}

  /* Motion state: ON by default for Preluxe Digitals. ?motion=off or saved off disables. */
  var params = new URLSearchParams(window.location.search);
  var saved = null;
  try{ saved = window.localStorage.getItem("preluxe-motion"); }catch(e){}
  var motionOn = true;
  if(params.get("motion")==="off") motionOn = false;
  else if(params.get("motion")==="full") motionOn = true;
  else if(saved==="off") motionOn = false;
  else if(saved==="full") motionOn = true;
  function applyMotion(){
    document.documentElement.classList.toggle("motion-full", motionOn);
    $$("#motionToggle").forEach(function(b){
      b.setAttribute("aria-pressed", String(motionOn));
      b.textContent = motionOn ? "Pause motion" : "Play motion";
    });
    try{ window.localStorage.setItem("preluxe-motion", motionOn ? "full" : "off"); }catch(e){}
  }
  applyMotion();
  document.addEventListener("click", function(e){
    var t = e.target.closest && e.target.closest("#motionToggle");
    if(!t) return;
    motionOn = !motionOn;
    applyMotion();
    if(!motionOn){ stopAuto(); } else { startAuto(); }
  });

  $$("[data-year]").forEach(function(el){el.textContent=String(new Date().getFullYear());});

  /* Mobile menu */
  var openBtn=$("#menuOpen"),closeBtn=$("#menuClose"),menu=$("#mobileMenu");
  function setMenu(o){
    if(!menu)return;
    menu.classList.toggle("open",o);
    if(openBtn)openBtn.setAttribute("aria-expanded",o?"true":"false");
    document.body.style.overflow=o?"hidden":"";
    if(o&&closeBtn)closeBtn.focus();
  }
  if(openBtn)openBtn.addEventListener("click",function(){setMenu(true);});
  if(closeBtn)closeBtn.addEventListener("click",function(){setMenu(false);if(openBtn)openBtn.focus();});
  if(menu)menu.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){setMenu(false);document.body.style.overflow="";});});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&menu&&menu.classList.contains("open")){setMenu(false);document.body.style.overflow="";if(openBtn)openBtn.focus();}});

  /* Sticky header shadow */
  var header=$("#siteHeader");
  function onScroll(){if(header)header.classList.toggle("solid",window.scrollY>10);}
  window.addEventListener("scroll",onScroll,{passive:true});onScroll();

  /* Reveal — runs in full-motion mode; static when motion off */
  var rev=$$(".reveal,.reveal-l,.reveal-r");
  function revealAll(){ rev.forEach(function(el){el.classList.add("in");}); }
  var io=null;
  if("IntersectionObserver" in window){
    io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}});},{threshold:.12});
    if(motionOn){ rev.forEach(function(el){io.observe(el);}); }
    else { revealAll(); }
  }else{ revealAll(); }

  /* Prompt-to-picture: tap toggle + keyboard */
  $$(".film-card").forEach(function(card){
    var btn=$(".film-toggle",card);
    if(!btn)return;
    function update(){btn.textContent=card.classList.contains("revealed")?"See note":"See final video";}
    update();
    btn.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();card.classList.toggle("revealed");update();});
    card.addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target===card){card.classList.toggle("revealed");update();}});
  });

  /* Showreel: autoplay cycle + manual buttons. Pauses on hover/focus or motion off. */
  var frames=$$("[data-reel-frame]");
  var reelBtns=$$("[data-reel-btn]");
  var reelImg=$("#reelImage"),reelCap=$("#reelCap"),reelTc=$("#reelTc");
  var reelIdx=0, reelTimer=null;
  function showReel(i){
    if(!frames.length) return;
    reelIdx=(i+frames.length)%frames.length;
    frames.forEach(function(f,k){f.hidden=(k!==reelIdx);});
    reelBtns.forEach(function(b,k){b.setAttribute("aria-pressed",String(k===reelIdx));});
    var f=frames[reelIdx];
    if(f&&reelImg){var im=$("img",f);if(im){reelImg.src=im.src;reelImg.alt=im.alt;}}
    if(f&&reelCap){reelCap.textContent=f.getAttribute("data-cap")||"";}
    if(f&&reelTc){reelTc.textContent=f.getAttribute("data-tc")||"";}
  }
  function startReel(){
    stopReel();
    if(!frames.length || !motionOn) return;
    reelTimer=setInterval(function(){ showReel(reelIdx+1); }, 3500);
  }
  function stopReel(){ if(reelTimer){clearInterval(reelTimer); reelTimer=null;} }
  if(frames.length){
    showReel(0); startReel();
    reelBtns.forEach(function(b){b.addEventListener("click",function(){showReel(Number(b.getAttribute("data-reel-btn"))); startReel();});});
    var reelZone = $(".film-frame");
    if(reelZone){
      reelZone.addEventListener("mouseenter", stopReel);
      reelZone.addEventListener("mouseleave", startReel);
      reelZone.addEventListener("focusin", stopReel);
      reelZone.addEventListener("focusout", startReel);
    }
  }

  /* Running timecode when motion on */
  var tcEl = document.querySelector(".hero-copy .tc");
  var tcTimer=null, tcF=0;
  function pad(n){ return (n<10?"0":"")+n; }
  function startTc(){
    if(tcTimer||!tcEl||!motionOn) return;
    tcTimer=setInterval(function(){
      tcF++;
      var fr=tcF%24, s=Math.floor(tcF/24)%60, m=Math.floor(tcF/1440)%60;
      tcEl.textContent="TC 00:"+pad(m)+":"+pad(s)+":"+pad(fr);
    }, 1000/24);
  }
  function stopTc(){ if(tcTimer){clearInterval(tcTimer); tcTimer=null;} }
  startTc();

  /* Prompt-to-picture auto-cycle in full motion (still tap/keyboard controllable) */
  var filmCards=$$(".film-card");
  var promptTimer=null, promptIdx=0;
  function startPrompts(){
    if(promptTimer||!filmCards.length||!motionOn) return;
    promptTimer=setInterval(function(){
      var c=filmCards[promptIdx%filmCards.length];
      if(c && !c.matches(":hover") && document.activeElement!==c){
        c.classList.toggle("revealed");
        var b=$(".film-toggle",c);
        if(b) b.textContent=c.classList.contains("revealed")?"See note":"See final video";
      }
      promptIdx++;
    }, 4000);
  }
  function stopPrompts(){ if(promptTimer){clearInterval(promptTimer); promptTimer=null;} }
  startPrompts();

  function startAuto(){ if(motionOn){ if(io){rev.forEach(function(el){ if(!el.classList.contains("in")) io.observe(el); });} startReel(); startTc(); startPrompts(); autoVideos(true);} }
  function stopAuto(){ stopReel(); stopTc(); stopPrompts(); autoVideos(false); revealAll(); }

  /* Project motion previews: autoplay muted loop when motion on, click to pause */
  function autoVideos(on){
    $$("video[data-preview]").forEach(function(v){
      try{
        v.muted=true; v.loop=true; v.playsInline=true;
        if(on && motionOn){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
        else { v.pause(); }
      }catch(e){}
    });
  }
  autoVideos(true);

  /* Project motion previews: label reflects autoplay state, click toggles */
  $$("video[data-preview]").forEach(function(v){
    var card=v.closest(".film-cover")||v.parentElement;
    var playBtn=document.createElement("button");
    playBtn.type="button";playBtn.className="film-toggle";playBtn.style.left="auto";playBtn.style.right=".7rem";
    playBtn.textContent= motionOn ? "Pause" : "Play";
    playBtn.setAttribute("aria-label","Play or stop the video (no sound)");
    if(card&&card.classList)card.appendChild(playBtn);
    playBtn.addEventListener("click",function(e){
      e.preventDefault();e.stopPropagation();
      if(v.paused){v.play().catch(function(){});playBtn.textContent="Pause";}
      else{v.pause();playBtn.textContent="Play";}
    });
    v.addEventListener("ended",function(){playBtn.textContent="Play";});
  });

  /* Filters (work page) */
  var fBtns=$$("[data-filter]"),cards=$$("[data-cat]");
  if(fBtns.length){
    fBtns.forEach(function(b){
      b.addEventListener("click",function(){
        fBtns.forEach(function(x){x.setAttribute("aria-pressed","false");});
        b.setAttribute("aria-pressed","true");
        var f=b.getAttribute("data-filter");
        cards.forEach(function(c){
          var showIt=(f==="all"||c.getAttribute("data-cat")===f);
          c.hidden=!showIt;
          if(showIt)c.classList.add("in"); 
        });
      });
    });
  }

  /* Active nav */
  var links=$$("[data-spy]");
  var ids=links.map(function(l){return l.getAttribute("data-spy");}).filter(Boolean);
  var secs=ids.map(function(id){return document.getElementById(id);}).filter(Boolean);
  if("IntersectionObserver" in window&&secs.length){
    var spy=new IntersectionObserver(function(es){
      es.forEach(function(en){if(en.isIntersecting){links.forEach(function(l){l.classList.toggle("active",l.getAttribute("data-spy")===en.target.id);});}});
    },{rootMargin:"-40% 0px -55% 0px"});
    secs.forEach(function(s){spy.observe(s);});
  }

  /* Contact form -> mailto with production fields */
  var form=$("#enquiryForm");
  if(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var g=function(id){var el=document.getElementById(id);return el?el.value.trim():"";};
      var name=g("fName"),email=g("fEmail"),brand=g("fBrand"),del=g("fDeliverable"),time=g("fTimeline"),budget=g("fBudget"),brief=g("fBrief");
      var note=$("#formNote");
      var ok=name&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)&&brief;
      if(!ok){if(note)note.textContent="Please add your name, a good email, and a few words about your idea.";return;}
      var to="[REPLACE: studio email]";
      var addr=form.getAttribute("data-mail")||"";
      if(addr&&addr.indexOf("@")>-1)to=addr;
      var subject=encodeURIComponent("Video request — "+(brand||name)+" / "+(del||"video"));
      var body=encodeURIComponent("Name: "+name+"\nEmail: "+email+"\nBrand: "+brand+"\nVideo: "+del+"\nWhen: "+time+"\nBudget: "+budget+"\n\nIdea:\n"+brief);
      window.location.href="mailto:"+to+"?subject="+subject+"&body="+body;
      if(note)note.textContent="Opening your email app now. You can also use the email, phone and LinkedIn on this page.";
    });
  }
})();
