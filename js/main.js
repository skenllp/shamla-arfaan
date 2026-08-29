(function () {

  // -------- viewport height fix (mobile browser chrome) --------
  function setVH(){ document.documentElement.style.setProperty('--vh', (window.innerHeight*0.01)+'px'); }
  setVH();
  window.addEventListener('resize', setVH);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ================= OPENING VIDEO =================
  var opening = document.getElementById('opening');
  var video = document.getElementById('opening-video');
  var tapBtn = document.getElementById('opening-tap');
  var enterPrompt = document.getElementById('enter-prompt');
  var site = document.getElementById('site');
  var revealed = false;

  function revealSite(){
    if(revealed) return;
    revealed = true;
    opening.classList.add('fading');
    site.classList.add('revealed');
    startCountdown();
    if(!reduceMotion){ spawnButterflies(); spawnBokeh(); }
    setTimeout(function(){
      opening.classList.add('hide');
    }, 1650);
  }

  // Video stays paused on the poster (first) frame until the guest taps in.
  // It then plays once, and the invitation reveals right after it finishes.
  video.loop = false;
  var videoStarted = false;

  function playOpeningVideo(){
    if(videoStarted) return;
    videoStarted = true;
    if(tapBtn){ tapBtn.disabled = true; }
    opening.classList.add('playing');

    var revealAfterVideo = function(){ revealSite(); };
    video.addEventListener('ended', revealAfterVideo, { once:true });
    // Fallback in case 'ended' never fires (autoplay block, decode issue, etc.)
    setTimeout(revealAfterVideo, 9000);

    var p = video.play();
    if(p && p.catch){ p.catch(function(){ revealAfterVideo(); }); }
  }

  if(tapBtn){ tapBtn.addEventListener('click', playOpeningVideo); }

  // safety: if video errors, still let user in
  video.addEventListener('error', function(){ if(enterPrompt) enterPrompt.classList.add('show'); });

  // opening screen's own music icon just mirrors the main music toggle
  var openingMusicBtn = document.getElementById('openingMusicBtn');
  if(openingMusicBtn){
    openingMusicBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var mainMusicBtn = document.getElementById('musicToggle');
      if(mainMusicBtn){
        mainMusicBtn.click();
      }
    });
    
    // Sync visual state with main audio
    var syncOpeningBtn = function(){
      var mainAudio = document.getElementById('bgAudio');
      if(mainAudio && !mainAudio.paused){
        openingMusicBtn.classList.remove('is-muted');
      } else {
        openingMusicBtn.classList.add('is-muted');
      }
    };
    var mainAudio = document.getElementById('bgAudio');
    if(mainAudio){
      mainAudio.addEventListener('play', syncOpeningBtn);
      mainAudio.addEventListener('pause', syncOpeningBtn);
    }
  }

  // ================= SCROLL REVEAL =================
  var cards = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in-view'); }
      });
    }, { threshold:0.28 });
    cards.forEach(function(c){ io.observe(c); });
  } else {
    cards.forEach(function(c){ c.classList.add('in-view'); });
  }

  // ================= COUNTDOWN =================
  var target = new Date('2026-12-27T00:00:00+05:30').getTime();
  var cdDays = document.getElementById('cd-days');
  var cdHours = document.getElementById('cd-hours');
  var cdMins = document.getElementById('cd-mins');
  var cdSecs = document.getElementById('cd-secs');
  var cdInterval = null;

  function pad(n){ return String(n).padStart(2,'0'); }

  function tickCountdown(){
    var now = Date.now();
    var diff = target - now;
    if(diff <= 0){
      cdDays.textContent = '00'; cdHours.textContent='00'; cdMins.textContent='00'; cdSecs.textContent='00';
      clearInterval(cdInterval);
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    cdDays.textContent = pad(d);
    cdHours.textContent = pad(h);
    cdMins.textContent = pad(m);
    cdSecs.textContent = pad(s);
  }

  function startCountdown(){
    tickCountdown();
    cdInterval = setInterval(tickCountdown, 1000);
  }

  // ================= BUTTERFLIES =================
  var butterflyImgs = [
    'assets/butterfly-red-gold.png',
    'assets/butterfly-red-gold.png',
    'assets/butterfly-red-gold.png',
    'assets/butterfly-pink-gold.png'
  ];
  var paths = ['flyA','flyB','flyC','flyD'];
  var layer = document.getElementById('butterflyLayer');

  function rand(min,max){ return Math.random()*(max-min)+min; }

  function makeButterfly(delayBase){
    var el = document.createElement('div');
    el.className = 'butterfly';
    var img = document.createElement('img');
    img.src = butterflyImgs[Math.floor(rand(0,butterflyImgs.length))];
    img.alt = '';
    el.appendChild(img);

    var size = rand(34,64);
    var startX = rand(-4, 92);
    var startY = rand(6, 88);
    var dur = rand(16,26);
    var flap = rand(0.5,0.9);
    var path = paths[Math.floor(rand(0,paths.length))];
    var delay = (delayBase===undefined ? rand(0,20) : delayBase);

    el.style.setProperty('--size', size+'px');
    el.style.setProperty('--start-x', startX+'vw');
    el.style.setProperty('--start-y', startY+'vh');
    el.style.setProperty('--dur', dur+'s');
    el.style.setProperty('--flap', flap+'s');
    el.style.setProperty('--path', path);
    el.style.setProperty('--delay', delay+'s');

    layer.appendChild(el);
  }

  function spawnButterflies(){
    var count = window.innerWidth < 700 ? 8 : 12;
    for(var i=0;i<count;i++){ makeButterfly(); }
  }

  // ================= BOKEH PARTICLES =================
  var bokehLayer = document.getElementById('bokehLayer');
  function spawnBokeh(){
    var count = window.innerWidth < 700 ? 10 : 16;
    for(var i=0;i<count;i++){
      var b = document.createElement('div');
      b.className = 'bokeh';
      var size = rand(6,16);
      b.style.width = size+'px';
      b.style.height = size+'px';
      b.style.left = rand(2,98)+'vw';
      b.style.bottom = rand(-20,-2)+'vh';
      b.style.animationDuration = rand(14,26)+'s';
      b.style.animationDelay = rand(0,20)+'s';
      bokehLayer.appendChild(b);
    }
  }

  // ================= RSVP FORM =================
  var attendBtns = document.querySelectorAll('.attend-btn');
  var attendValue = '';
  attendBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      attendBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      attendValue = btn.getAttribute('data-value');
    });
  });

  var guestCountEl = document.getElementById('guestCount');
  var guestMinus = document.getElementById('guestMinus');
  var guestPlus = document.getElementById('guestPlus');
  var guestCount = 1;
  if(guestMinus && guestPlus && guestCountEl){
    guestMinus.addEventListener('click', function(){
      if(guestCount > 1){ guestCount--; guestCountEl.textContent = guestCount; }
    });
    guestPlus.addEventListener('click', function(){
      if(guestCount < 10){ guestCount++; guestCountEl.textContent = guestCount; }
    });
  }

  // TODO: replace with the couple's actual WhatsApp number, digits only, country code first (e.g. 919876543210)
  var RSVP_WHATSAPP_NUMBER = '910000000000';

  var rsvpForm = document.getElementById('rsvpForm');
  if(rsvpForm){
    rsvpForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('rsvpName').value.trim();
      var country = document.getElementById('rsvpCountry').value;
      var phone = document.getElementById('rsvpPhone').value.trim();

      if(!name || !phone){
        alert('Please fill in your name and WhatsApp number.');
        return;
      }
      if(!attendValue){
        alert('Please let us know if you will be attending.');
        return;
      }

      var attendText = attendValue === 'accept' ? 'Joyfully Accept' : 'Regretfully Decline';
      var message = 'RSVP — Fathima & Arfaan\'s Reception\n' +
        'Name: ' + name + '\n' +
        'WhatsApp: ' + country + ' ' + phone + '\n' +
        'Attending: ' + attendText + '\n' +
        'Guests: ' + guestCount;

      var url = 'https://wa.me/' + RSVP_WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
      window.open(url, '_blank');
    });
  }

  // ================= ADD TO CALENDAR =================
  var addToCalendarBtn = document.getElementById('addToCalendarBtn');
  if(addToCalendarBtn){
    addToCalendarBtn.addEventListener('click', function(){
      var start = '20261227T100000';
      var end = '20261227T140000';
      var ics = [
        'BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',
        'SUMMARY:Fathima & Arfaan — Reception',
        'DTSTART;TZID=Asia/Kolkata:' + start,
        'DTEND;TZID=Asia/Kolkata:' + end,
        'LOCATION:Wasava Cliff House, Burnacherry, Kannur, Kerala',
        'DESCRIPTION:Homecoming Reception of Dr. Fathima Shamla & Muhammed Arfaan',
        'END:VEVENT','END:VCALENDAR'
      ].join('\r\n');
      var blob = new Blob([ics], { type: 'text/calendar' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'fathima-arfaan-reception.ics';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ================= MUSIC TOGGLE =================
  var musicBtn = document.getElementById('musicToggle');
  var audio = document.getElementById('bgAudio');
  var playing = false;
  
  // Ensure audio is loaded
  audio.load();
  
  // Update playing state when audio actually starts/stops
  audio.addEventListener('play', function(){ 
    playing = true; 
    musicBtn.classList.remove('muted'); 
    musicBtn.setAttribute('aria-pressed', 'true');
  });
  audio.addEventListener('pause', function(){ 
    playing = false; 
    musicBtn.classList.add('muted'); 
    musicBtn.setAttribute('aria-pressed', 'false');
  });
  
  musicBtn.addEventListener('click', function(){
    if(playing){ 
      audio.pause(); 
    } else { 
      var playPromise = audio.play();
      if(playPromise !== undefined){
        playPromise.catch(function(err){
          console.error('Audio play failed:', err);
          alert('Unable to play music. Please check your browser settings or try again.');
        }); 
      }
    }
  });

})();
