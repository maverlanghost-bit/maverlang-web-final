// index.js - Lógica Principal de Maverlang
// Separación de preocupaciones: Lógica de Negocio y UI

// Importaciones de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, onSnapshot, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Variables Globales
let db, auth;
let userId = null;
let isAuthReady = false;
let whitelistCol;
let isClickOutsideListenerAdded = false; 
let tvWidgetLoaded = false; // Para Lazy Load
let modalShown = false; 

// Configuración de entorno (Globales inyectadas o defaults)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(
    typeof __firebase_config !== 'undefined' ? __firebase_config : '{}'
);

// --- Funciones del Modal ---
const openModal = (e) => {
    if (e) e.preventDefault();
    // Evitar abrir modal si es un enlace válido que no sea un ancla
    if (e && e.currentTarget && e.currentTarget.href && !e.currentTarget.href.endsWith('#') && e.currentTarget.target !== '_blank') {
        return; 
    }
    const modal = document.getElementById('whitelist-modal');
    if (!modal || !modal.classList.contains('invisible')) return;
    
    modalShown = true; 
    
    const modalContent = modal.querySelector('.modal-content');
    modal.classList.remove('invisible', 'opacity-0');
    modalContent.classList.remove('scale-95');
};

const closeModal = () => {
    const modal = document.getElementById('whitelist-modal');
    if (!modal) return;
    const modalContent = modal.querySelector('.modal-content');
    modal.classList.add('opacity-0');
    modalContent.classList.add('scale-95');
    setTimeout(() => modal.classList.add('invisible'), 300);
};

// --- Inicialización General ---
async function initApp() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.warn("Lucide no está listo, reintentando...");
        setTimeout(initApp, 100);
        return;
    }

    initTheme(); 
    await initFirebase();

    initWhitelistModal();
    initFauxChatAndLLM(); 
    initCourseChatAnimation(); // <--- NUEVA ANIMACIÓN DEL CHAT EN EL VIDEO
    initWhitelistForms();
    initChatInputBehavior();
    initCountdown();
    initTypingAnimation();
    initHeaderScrollBehavior(); 
    initNavigation(); 
    generateParticlesSlow(); 
    initMobileMenu(); 
    initPopups(); 
    initScrollReveal(); 
    initLazyLoadWidgets(); 

    if (isAuthReady) {
            console.log("Firebase listo, iniciando listener de whitelist.");
            listenToWhitelistCount();
    } else {
            console.warn("La autenticación de Firebase falló o no está lista. El listener de whitelist no se iniciará.");
    }
}

// --- Scroll Reveal ---
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Solo animar una vez
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(r => observer.observe(r));
}

// --- Animación Chat Curso (La función que pediste) ---
function initCourseChatAnimation() {
    const container = document.getElementById('course-ai-chat-container');
    const inputSpan = document.getElementById('course-chat-input-text');
    const section = document.getElementById('aprendelo');
    const video = document.getElementById('course-demo-video'); // Referencia al video
    const volumeBtn = document.getElementById('video-volume-btn');
    
    // Si no existen los elementos, no hacemos nada (protección contra errores)
    if (!container || !inputSpan || !section || !video) return;

    const userText = "¿Qué es un ETF?";
    const botText = "Un ETF es como una canasta de acciones que cotiza en bolsa. Te permite diversificar comprando un solo activo.";
    let isAnimating = false;
    let isVideoMuted = false; // Empezamos intentando con sonido

    // Lógica del botón de volumen
    if(volumeBtn) {
        volumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isVideoMuted = !isVideoMuted;
            video.muted = isVideoMuted;
            // Actualizar icono
            const icon = volumeBtn.querySelector('i');
            if(icon) {
                // Cambiar a volumen alto o muteado
                icon.setAttribute('data-lucide', isVideoMuted ? 'volume-x' : 'volume-2');
                lucide.createIcons();
            }
        });
    }

    const runAnimation = async () => {
        if (isAnimating) return;
        isAnimating = true;

        // 1. Limpiar estado inicial
        container.innerHTML = '';
        inputSpan.textContent = '';

        // 2. Escribir pregunta "letra por letra"
        for (let i = 0; i <= userText.length; i++) {
            inputSpan.textContent = userText.substring(0, i);
            // Delay aleatorio para simular tecleo humano
            await new Promise(r => setTimeout(r, 50 + Math.random() * 50));
        }
        
        // Pequeña pausa antes de enviar
        await new Promise(r => setTimeout(r, 500));

        // 3. Enviar pregunta (Aparece burbuja azul, se limpia input)
        inputSpan.textContent = ''; // Limpiar input
        
        const userBubble = document.createElement('div');
        userBubble.className = 'ai-chat-bubble ai-bubble-user self-end bg-blue-600 text-white rounded-lg rounded-br-none px-4 py-2 max-w-[85%] text-sm mb-2 transform translate-y-2 opacity-0 transition-all duration-300';
        userBubble.textContent = userText;
        container.appendChild(userBubble);
        
        // Forzar reflow para activar transición CSS
        void userBubble.offsetWidth;
        userBubble.classList.remove('translate-y-2', 'opacity-0');

        // 4. Simular "Pensando..." (Pausa)
        await new Promise(r => setTimeout(r, 1000));
        
        // 5. Respuesta Bot (Aparece burbuja gris)
        const botBubble = document.createElement('div');
        botBubble.className = 'ai-chat-bubble ai-bubble-bot self-start bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg rounded-bl-none px-4 py-2 max-w-[85%] text-sm mb-2 transform translate-y-2 opacity-0 transition-all duration-300';
        botBubble.textContent = botText;
        container.appendChild(botBubble);

        // Forzar reflow
        void botBubble.offsetWidth;
        botBubble.classList.remove('translate-y-2', 'opacity-0');

        // 6. Programar reinicio del loop si el usuario sigue viendo la sección
        setTimeout(() => {
            isAnimating = false;
            // Verificar si la sección sigue visible en pantalla
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                runAnimation();
            }
        }, 8000); // Esperar 8 segundos antes de reiniciar
    };

    // Usar IntersectionObserver para iniciar solo cuando sea visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Intentar reproducir video CON SONIDO
                video.muted = false; 
                video.play().then(() => {
                    // Éxito: Autoplay con sonido funcionó
                    isVideoMuted = false;
                    // Actualizar icono a sonido activo
                    const icon = volumeBtn.querySelector('i');
                    if(icon) {
                        icon.setAttribute('data-lucide', 'volume-2');
                        lucide.createIcons();
                    }
                }).catch(() => {
                    // Fallo: Bloqueo de navegador -> Fallback a Muteado (para que se vea)
                    console.log("Autoplay con audio bloqueado, reproduciendo en silencio.");
                    video.muted = true;
                    isVideoMuted = true;
                    video.play();
                     // Icono se mantiene en mute por defecto
                });

                // Iniciar Chat 1 segundo después
                setTimeout(() => {
                    runAnimation();
                }, 1000);
            } else {
                // Pausar si sale de pantalla para ahorrar recursos
                video.pause();
                // No reseteamos currentTime para que no se sienta brusco al volver
                isAnimating = false; // Permitir reiniciar animación al volver
            }
        });
    }, { threshold: 0.4 }); // 40% visible para activar

    observer.observe(section);
}

// --- Lazy Load de Widgets ---
function initLazyLoadWidgets() {
    const widgetContainer = document.getElementById('tv-widget-container');
    if (!widgetContainer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !tvWidgetLoaded) {
                console.log("Widget container visible. Loading TradingView...");
                const currentTheme = localStorage.getItem('maverlang_theme') || 'light';
                loadTradingViewWidget(currentTheme === 'dark' ? 'dark' : 'light');
                tvWidgetLoaded = true;
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '200px' });

    observer.observe(widgetContainer);
}


// --- Inicialización de Firebase ---
async function initFirebase() {
        if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "TU_API_KEY") {
        console.warn("Firebase no está configurado.");
        isAuthReady = false;
        return;
    }
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        setLogLevel('debug');
        
        whitelistCol = collection(db, 'artifacts', appId, 'public', 'data', 'whitelist');

        await new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                unsubscribe();
                if (user) {
                    userId = user.uid;
                    isAuthReady = true;
                    updateWhitelistButtonState(true);
                    console.log("Usuario ya autenticado:", userId);
                    resolve();
                } else {
                    try {
                        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                            await signInWithCustomToken(auth, __initial_auth_token);
                        } else {
                            await signInAnonymously(auth);
                        }
                        if (auth.currentUser) {
                            userId = auth.currentUser.uid;
                            isAuthReady = true;
                            updateWhitelistButtonState(true);
                            console.log("Autenticación exitosa:", userId);
                            resolve();
                        } else {
                                isAuthReady = false;
                                updateWhitelistButtonState(false, "Error de Conexión");
                                reject(new Error("Fallo en la autenticación silenciosa."));
                        }
                    } catch (authError) {
                        isAuthReady = false;
                        updateWhitelistButtonState(false, "Error de Conexión");
                        reject(authError);
                    }
                }
            }, (error) => {
                isAuthReady = false;
                updateWhitelistButtonState(false, "Error de Conexión");
                reject(error);
            });
        });

    } catch (e) {
        console.error("Error crítico al inicializar Firebase:", e.message);
        isAuthReady = false;
        updateWhitelistButtonState(false, "Error de Configuración");
    }
}

// --- Estado del Botón Whitelist ---
function updateWhitelistButtonState(isReady, errorMessage = "Iniciando...") {
    const submitBtn = document.getElementById('submit-btn-modal');
    if (!submitBtn) return;
    
    if (isReady) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Anotarme";
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        submitBtn.disabled = true;
        submitBtn.textContent = errorMessage;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
}

// --- Widget de TradingView ---
function loadTradingViewWidget(theme) {
        const container = document.getElementById('tv-widget-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const widgetContainerDiv = document.createElement('div');
        widgetContainerDiv.className = 'tradingview-widget-container';
        widgetContainerDiv.style.width = '100%';
        widgetContainerDiv.style.height = '100%';
        
        const widgetDiv = document.createElement('div');
        widgetDiv.className = 'tradingview-widget-container__widget';
        widgetDiv.style.height = 'calc(100% - 32px)';
        widgetDiv.style.width = '100%';
        
        const copyrightDiv = document.createElement('div');
        copyrightDiv.className = 'tradingview-widget-copyright';
        copyrightDiv.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text"></span></a>';

        const scriptConfig = {
            "lineWidth": 2,
            "lineType": 0,
            "chartType": "area",
            "fontColor": theme === 'dark' ? "rgba(255, 255, 255, 0.7)" : "rgb(106, 109, 120)",
            "gridLineColor": theme === 'dark' ? "rgba(255, 255, 255, 0.06)" : "rgba(46, 46, 46, 0.06)",
            "volumeUpColor": "rgba(34, 171, 148, 0.5)",
            "volumeDownColor": "rgba(247, 82, 95, 0.5)",
            "backgroundColor": theme === 'dark' ? "#1e1e1e" : "#ffffff",
            "widgetFontColor": theme === 'dark' ? "#fcfcfc" : "#0F0F0F",
            "upColor": "#22ab94",
            "downColor": "#f7525f",
            "borderUpColor": "#22ab94",
            "borderDownColor": "#f7525f",
            "wickUpColor": "#22ab94",
            "wickDownColor": "#f7525f",
            "colorTheme": theme,
            "isTransparent": true,
            "locale": "en",
            "chartOnly": false,
            "scalePosition": "right",
            "scaleMode": "Normal",
            "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
            "valuesTracking": "1",
            "changeMode": "price-and-percent",
            "symbols": [
                ["Apple", "NASDAQ:AAPL|1D"],
                ["Google", "NASDAQ:GOOGL|1D"],
                ["Microsoft", "NASDAQ:MSFT|1D"]
            ],
            "dateRanges": ["1d|1", "1m|30", "3m|60", "12m|1D", "60m|1W", "all|1M"],
            "fontSize": "10",
            "headerFontSize": "medium",
            "autosize": true,
            "width": "100%",
            "height": "100%",
            "noTimeScale": false,
            "hideDateRanges": false,
            "hideMarketStatus": false,
            "hideSymbolLogo": false
        };

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
        script.async = true;
        script.innerHTML = JSON.stringify(scriptConfig);

        widgetContainerDiv.appendChild(widgetDiv);
        widgetContainerDiv.appendChild(copyrightDiv);
        widgetContainerDiv.appendChild(script);
        container.appendChild(widgetContainerDiv);
}


// --- Manejo de Temas ---
function initTheme() {
    const themeMainBtn = document.getElementById('theme-main-btn');
    const themeDropdownMenu = document.getElementById('theme-dropdown-menu');
    const themeDropdownBtns = themeDropdownMenu.querySelectorAll('.theme-dropdown-btn');

    if (!themeMainBtn || !themeDropdownMenu) return;

    const currentTheme = localStorage.getItem('maverlang_theme') || 'light';
    applyTheme(currentTheme, true); 

        themeMainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
            const isVisible = !themeDropdownMenu.classList.contains('invisible');
            if (isVisible) {
                themeDropdownMenu.classList.add('opacity-0', 'scale-95', 'invisible');
            } else {
                document.getElementById('nav-funciones-menu')?.classList.add('opacity-0', 'scale-95', 'invisible');
                document.getElementById('mobile-menu-panel')?.classList.add('opacity-0', 'hidden'); 
                themeDropdownMenu.classList.remove('opacity-0', 'scale-95', 'invisible');
            }
    });

    themeDropdownBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            applyTheme(btn.dataset.theme);
            themeDropdownMenu.classList.add('opacity-0', 'scale-95', 'invisible');
        });
    });
}

function applyTheme(theme, isInitialLoad = false) {
    const html = document.documentElement;
    const themeMainBtn = document.getElementById('theme-main-btn'); 
    let tvTheme;
    let iconName = 'sun'; 

    html.classList.remove('dark'); 

    if (theme === 'dark') {
        html.classList.add('dark');
        tvTheme = 'dark';
        iconName = 'moon';
    } else { 
        tvTheme = 'light';
        iconName = 'sun';
    }

    if (!isInitialLoad) {
        localStorage.setItem('maverlang_theme', theme);
    }

    if (themeMainBtn) { 
        const newIconHTML = `<i data-lucide="${iconName}"></i>`;
        themeMainBtn.innerHTML = newIconHTML; 
        if (typeof lucide !== 'undefined') {
            lucide.createIcons(); 
        }
    }

    document.querySelectorAll('.theme-dropdown-btn').forEach(b => b.classList.remove('active'));
    const activeButton = document.querySelector(`.theme-dropdown-btn[data-theme="${theme}"]`);
    if (activeButton) activeButton.classList.add('active');

    if (tvWidgetLoaded) {
        loadTradingViewWidget(tvTheme); 
    }
    
    updateHeaderBackground(); 
}

// --- Popups y Banners (Exit Intent) ---
function initPopups() {
    const banner = document.getElementById('bottom-left-banner');
    const closeBannerBtn = document.getElementById('banner-close-btn');
    const registerBannerBtn = document.getElementById('banner-register-btn');

    // Banner inferior (no intrusivo)
    if (banner && closeBannerBtn && registerBannerBtn) {
        setTimeout(() => {
            banner.classList.remove('hidden');
            setTimeout(() => banner.classList.add('visible'), 50); 
        }, 2500); // Se queda como timer suave

        closeBannerBtn.addEventListener('click', () => {
            banner.classList.remove('visible');
            setTimeout(() => banner.classList.add('hidden'), 500);
        });

        registerBannerBtn.addEventListener('click', (e) => {
            openModal(e);
            banner.classList.remove('visible');
            setTimeout(() => banner.classList.add('hidden'), 500);
        });
    }

    // Modal de Whitelist - AHORA CON INTENCIÓN DE SALIDA (Mouse leave)
    // Detecta cuando el mouse sale de la ventana hacia arriba (queriendo cerrar tab o cambiar URL)
    const onMouseLeave = (e) => {
        if (e.clientY < 0 && !modalShown) {
            openModal();
            // Removemos el listener para que no salte cada vez
            document.removeEventListener('mouseleave', onMouseLeave);
        }
    };
    
    // Solo añadimos el listener de "Exit Intent" en desktop (mouse)
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mouseleave', onMouseLeave);
    } else {
        // En móvil, fallback a un timer largo
        setTimeout(() => {
            if (!modalShown) openModal();
        }, 30000); 
    }
}

// --- Whitelist Logic ---
function initWhitelistModal() {
    const modal = document.getElementById('whitelist-modal');
    if (!modal) return;
    const closeModalBtn = document.getElementById('close-modal-btn');
    const triggerButtons = document.querySelectorAll('.modal-trigger-btn, #header-whitelist-btn, #response-cta-button, #banner-register-btn, #mobile-whitelist-btn'); 
    
    triggerButtons.forEach(btn => {
        if (btn.dataset.modalListenerAttached === 'true') return; 
        
        btn.addEventListener('click', (e) => {
                if (e.currentTarget.tagName === 'A' && e.currentTarget.href && !e.currentTarget.href.endsWith('#') && e.currentTarget.target !== '_blank') {
                    return; 
                }
                openModal(e);
        });
        btn.dataset.modalListenerAttached = 'true'; 
    });
    
    if (closeModalBtn && closeModalBtn.dataset.modalListenerAttached !== 'true') {
            closeModalBtn.addEventListener('click', closeModal);
            closeModalBtn.dataset.modalListenerAttached = 'true';
    }
    if (modal.dataset.modalListenerAttached !== 'true') {
            modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
            modal.dataset.modalListenerAttached = 'true';
    }
}


// --- Listener de Whitelist Count ---
function listenToWhitelistCount() {
        if (!db || !whitelistCol || !isAuthReady) {
        const fomoCounterEl = document.getElementById('fomo-counter');
            const countEl = document.getElementById('whitelist-count');
            if(fomoCounterEl && countEl) { countEl.textContent = '...'; }
        return;
    }
    const fomoCounterEl = document.getElementById('fomo-counter');
    const countEl = document.getElementById('whitelist-count');
    if (!fomoCounterEl || !countEl) return; 
    try {
        const unsub = onSnapshot(whitelistCol, (snapshot) => {
            const count = snapshot.size;
            countEl.textContent = count > 0 ? count.toLocaleString('es') : '0';
            fomoCounterEl.classList.add('visible');
        }, (error) => {
            fomoCounterEl.classList.add('visible');
            countEl.textContent = 'Error';
        });
    } catch (error) {
        fomoCounterEl.classList.add('visible');
        countEl.textContent = 'Error';
    }
}

function initWhitelistForms() {
        const modalForm = document.getElementById('whitelist-form-modal');
    if (modalForm) modalForm.addEventListener('submit', (e) => handleWhitelistSubmit(e));
}

async function handleWhitelistSubmit(e) {
        e.preventDefault();
    if (!db || !whitelistCol || !isAuthReady || !auth.currentUser) { setMessage('Error: Sistema no listo.', 'error'); return; }

    const emailInput = document.getElementById('email-input-modal');
    const submitBtn = document.getElementById('submit-btn-modal');
    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMessage('Correo inválido.', 'error'); return; }
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true; submitBtn.textContent = 'Enviando...'; setMessage('', 'clear');
    try {
        const q = query(whitelistCol, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) { throw new Error('Este correo ya está registrado.'); }
        await addDoc(whitelistCol, {
            email: email,
            timestamp: serverTimestamp(),
            source: 'modal',
        });
        setMessage('¡Gracias! Estás en la lista.', 'success'); emailInput.value = '';
        setTimeout(closeModal, 2000);
    } catch (error) {
        console.error("Error al registrar en whitelist:", error);
        setMessage(error.message || 'Error al registrar.', 'error');
    } finally {
        submitBtn.disabled = false; submitBtn.textContent = originalBtnText;
    }
}

function setMessage(message, type) {
        const messageEl = document.getElementById('form-message-modal');
        if (!messageEl) return;
        messageEl.textContent = message;
        messageEl.style.color = type === 'success' ? 'var(--success-color)' : (type === 'error' ? 'var(--accent-red)' : 'inherit');
}

// --- UI/Animación ---
function initCountdown() {
    const targetDate = new Date('2025-12-10T00:00:00').getTime();
    const ids = ['modal'];
    const labels = ['days', 'hours', 'minutes', 'seconds'];
    const elements = {};
    ids.forEach(id => { elements[id] = {}; labels.forEach(l => elements[id][l] = document.getElementById(`${id}-${l}`)); });
    const interval = setInterval(() => {
        const distance = targetDate - new Date().getTime();
        if (distance < 0) {
            clearInterval(interval);
            ids.forEach(id => { const cont = document.getElementById(`${id}-countdown-container`); if(cont) cont.innerHTML = '<p class="text-xl font-bold text-blue-500">¡Lanzamiento iniciado!</p>'; });
            return;
        }
        const d = Math.floor(distance / 864e5), h = Math.floor((distance % 864e5) / 36e5), m = Math.floor((distance % 36e5) / 6e4), s = Math.floor((distance % 6e4) / 1e3);
        const times = { days: d, hours: h, minutes: m, seconds: s };
        ids.forEach(id => { labels.forEach(l => { if(elements[id] && elements[id][l]) elements[id][l].textContent = String(times[l]).padStart(2, '0'); }); });
    }, 1000);
}

function typeWriterEffect(element, text, speed = 30) {
    let i = 0;
    element.innerHTML = ""; 
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            const btn = document.getElementById('response-cta-button');
            if(btn) btn.style.opacity = '1';
        }
    }
    type();
}

function initTypingAnimation() {
    const el = document.getElementById('typing-text'); if(!el) return;
    const q = ["Análisis fundamental de SQM", "¿Impacto del cobre en el IPSA?", "Noticias clave para COPEC", "Pronóstico técnico de BTC/USD"];
    let qi = 0, ci = 0, del = false, t;
    const type = () => { clearTimeout(t); const cq = q[qi]; let ts = del ? 50 : 100; if (del) { el.textContent = cq.substring(0, ci-1); ci--; } else { el.textContent = cq.substring(0, ci+1); ci++; } if (!del && ci === cq.length) { ts = 2000; del = true; } else if (del && ci === 0) { del = false; qi=(qi+1)%q.length; ts = 500; } if(el.isConnected) t=setTimeout(type, ts); }; type();
}

function initChatInputBehavior() {
    const chatInput = document.getElementById('chat-input');
    const placeholder = document.getElementById('placeholder-container');
    if (!chatInput || !placeholder) return;
    chatInput.addEventListener('input', () => { placeholder.style.opacity = chatInput.value.length > 0 ? '0' : '1'; });
}

// Lógica del Chat Demo
function initFauxChatAndLLM() {
    const aiModeBtn = document.getElementById('ai-mode-btn'); const aiModeMenu = document.getElementById('ai-mode-menu'); const mainView = document.getElementById('ai-menu-main-view'); const llmView = document.getElementById('llm-options-view'); const llmH = document.getElementById('llm-selector-header'); const llmBackButton = document.getElementById('llm-back-btn'); const llmOptsContainer = document.getElementById('llm-options'); const llmLabel = document.getElementById('llm-selector-label'); const tutorCont = document.getElementById('tutor-toggle-container');
    
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn'); 
    const chatInputContainer = document.getElementById('chat-input-container');
    const chatResponseContainer = document.getElementById('chat-response-container');
    const thinkingIndicator = document.getElementById('thinking-indicator');
    const aiResponseCard = document.getElementById('ai-response-card');
    const aiResponseText = document.getElementById('ai-response-text'); 
    const responseCtaButton = document.getElementById('response-cta-button');

    if (!aiModeBtn || !aiModeMenu || !chatInput || !sendBtn || !aiResponseText) { 
            return; 
    }
    
    if (tutorCont) { const check = tutorCont.querySelector('input'); tutorCont.addEventListener('click', (e) => { if (!e.target.closest('.tutor-toggle-switch')) check.checked = !check.checked; }); }
    const llms = [{ id:'gpt-5', name:'GPT-5' }, { id:'grok-4', name:'Grok 4' }, { id:'gemini-2.5-pro', name:'Gemini 2.5 Pro' }, { id:'claude-sonnet', name:'Claude 4.5 Sonnet' }];
    llmOptsContainer.innerHTML = llms.map(l => `<div class="llm-card-small rounded-lg p-2 text-center" data-llm-id="${l.id}"><p class="font-semibold text-xs">${l.name}</p></div>`).join('');
    const localCloseMenu = () => { aiModeMenu.classList.add('opacity-0','scale-95'); setTimeout(() => { aiModeMenu.classList.add('invisible'); mainView.classList.remove('hidden'); llmView.classList.add('hidden'); }, 200); };
    aiModeBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); aiModeMenu.classList.contains('invisible') ? aiModeMenu.classList.remove('invisible','opacity-0','scale-95') : localCloseMenu(); });
    document.addEventListener('click', () => { if (!aiModeMenu.classList.contains('invisible')) localCloseMenu(); }); 
    llmH.addEventListener('click', (e) => { e.stopPropagation(); mainView.classList.add('hidden'); llmView.classList.remove('hidden'); lucide.createIcons(); });
    llmBackButton.addEventListener('click', (e) => { e.stopPropagation(); llmView.classList.add('hidden'); mainView.classList.remove('hidden'); });
    llmOptsContainer.querySelectorAll('.llm-card-small').forEach(c => { c.addEventListener('click', (e) => { e.stopPropagation(); const id = c.dataset.llmId; const sel = llms.find(l => l.id === id); localStorage.setItem('selectedLLM', id); llmOptsContainer.querySelectorAll('.llm-card-small').forEach(x => x.classList.remove('selected')); c.classList.add('selected'); llmLabel.textContent = sel.name; localCloseMenu(); }); });
    document.querySelectorAll('#ai-menu-main-view .modal-trigger-btn').forEach(btn => { if (btn.dataset.modalListenerAttached !== 'true') { btn.addEventListener('click', (e) => { e.preventDefault(); localCloseMenu(); }); btn.dataset.modalListenerAttached = 'true'; } });

    const triggerChatDemo = (e) => {
        e.preventDefault();
        if (chatInput.value.trim() === '') {
            openModal(e);
            return;
        }
        
        chatInputContainer.style.display = 'none';
        chatResponseContainer.style.display = 'block';
        thinkingIndicator.style.display = 'flex';
        aiResponseCard.style.display = 'none';
        
        setTimeout(() => {
            thinkingIndicator.style.display = 'none';
            aiResponseCard.style.display = 'block';
            chatResponseContainer.classList.add('visible'); 
            
            const responseHTML = `Análisis rápido de <span class="highlight">AAPL</span>: Sentimiento actual: <span class="highlight">Positivo (7.2/10)</span>. Se detectan 3 noticias de alto impacto en las últimas 2h. <em>Análisis completo, alertas 24/7 y modelos predictivos están disponibles para usuarios registrados.</em>`;
            aiResponseText.innerHTML = responseHTML;
            aiResponseText.style.opacity = 0;
            
            setTimeout(() => {
                aiResponseText.style.transition = "opacity 1s";
                aiResponseText.style.opacity = 1;
                setTimeout(() => {
                    responseCtaButton.style.opacity = '1';
                }, 800);
            }, 100);

        }, 1500);
    };

    sendBtn.addEventListener('click', triggerChatDemo);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            triggerChatDemo(e);
        }
    });
    
    micBtn.addEventListener('click', openModal);
    responseCtaButton.addEventListener('click', openModal);
}

function updateHeaderBackground() {
    const header = document.querySelector('header');
    if (!header) return;
    const headerContent = header.firstElementChild;
    if (!headerContent) return; 

    const threshold = 50;
    const scrolled = window.scrollY > threshold;
    const isDark = document.documentElement.classList.contains('dark'); 
    
    const bgColor = scrolled 
        ? (isDark ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.8)') 
        : (isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)');
        
    headerContent.style.backgroundColor = bgColor;
}

function initHeaderScrollBehavior() {
    window.addEventListener('scroll', updateHeaderBackground, { passive: true });
    updateHeaderBackground(); 
}

// --- Navegación ---
function initNavigation() {
    const funcionesBtn = document.getElementById('nav-funciones-btn');
    const funcionesMenu = document.getElementById('nav-funciones-menu');

    if (funcionesBtn && funcionesMenu) {
        const toggleFuncionesDropdown = (e) => {
            e.stopPropagation();
            const isVisible = !funcionesMenu.classList.contains('invisible');
            if (isVisible) {
                funcionesMenu.classList.add('opacity-0', 'scale-95', 'invisible');
            } else {
                document.getElementById('theme-dropdown-menu')?.classList.add('opacity-0', 'scale-95', 'invisible');
                document.getElementById('mobile-menu-panel')?.classList.add('opacity-0', 'hidden'); 
                document.body.classList.remove('no-scroll'); 
                funcionesMenu.classList.remove('opacity-0', 'scale-95', 'invisible');
            }
        };
            if (funcionesBtn.dataset.navListenerAttached !== 'true') {
                funcionesBtn.addEventListener('click', toggleFuncionesDropdown);
                funcionesBtn.dataset.navListenerAttached = 'true';
            }
    }

    if (!isClickOutsideListenerAdded) { 
            document.addEventListener('click', (e) => {
            const themeDropdown = document.getElementById('theme-dropdown-menu');
            const themeButton = document.getElementById('theme-main-btn');
            const funcionesDropdown = document.getElementById('nav-funciones-menu');
            const funcionesButton = document.getElementById('nav-funciones-btn');
            const mobileMenu = document.getElementById('mobile-menu-panel'); 
            const mobileButton = document.getElementById('mobile-menu-btn'); 

            if (themeDropdown && !themeDropdown.classList.contains('invisible') && themeButton && !themeButton.contains(e.target) && !themeDropdown.contains(e.target)) {
                themeDropdown.classList.add('opacity-0', 'scale-95', 'invisible');
            }
                if (funcionesDropdown && !funcionesDropdown.classList.contains('invisible') && funcionesButton && !funcionesButton.contains(e.target) && !funcionesDropdown.contains(e.target)) {
                funcionesDropdown.classList.add('opacity-0', 'scale-95', 'invisible');
            }
                if (mobileMenu && !mobileMenu.classList.contains('hidden') && mobileButton && !mobileButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('opacity-0');
                setTimeout(() => {
                    mobileMenu.classList.add('hidden');
                    document.body.classList.remove('no-scroll'); 
                }, 300);
            }
        });
        isClickOutsideListenerAdded = true; 
    }

    if (funcionesMenu) {
        funcionesMenu.querySelectorAll('a').forEach(item => {
                if (item.dataset.navItemListener !== 'true') {
                    item.addEventListener('click', (e) => { 
                        if (!item.href || item.href.endsWith('#') || item.classList.contains('modal-trigger-btn')) {
                        funcionesMenu.classList.add('opacity-0', 'scale-95', 'invisible');
                        }
                    });
                    item.dataset.navItemListener = 'true';
                }
        });
    }
}

function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-menu-close-btn');
    const panel = document.getElementById('mobile-menu-panel');
    const links = panel.querySelectorAll('a');

    if (!menuBtn || !closeBtn || !panel) return;

    const openMenu = () => {
        panel.classList.remove('hidden');
        setTimeout(() => panel.classList.remove('opacity-0'), 10); 
        document.body.classList.add('no-scroll'); 
    };

    const closeMenu = () => {
        panel.classList.add('opacity-0');
        setTimeout(() => {
            panel.classList.add('hidden');
            document.body.classList.remove('no-scroll'); 
        }, 300);
    };

    menuBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (link.href && !link.href.endsWith('#') && !link.classList.contains('modal-trigger-btn')) {
                return;
            }
            closeMenu();
        });
    });
}

// --- Animación Partículas ---
function generateParticlesSlow() {
    const container = document.querySelector('#nav-portafolio-ai-link .particles-container');
    if (!container) return;

    const particleCount = 8; 
    const colors = ['var(--particle-color-1)', 'var(--particle-color-2)', 'var(--particle-color-3)'];
    const totalAnimationCycle = 5; 
    const particleAnimationDuration = 2.5; 
    const baseStartDelay = 2.1; 

    container.innerHTML = ''; 

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const randomDelayOffset = Math.random() * 0.4; 
        const particleStartDelay = baseStartDelay + randomDelayOffset; 
        const relativeDelayCSS = particleStartDelay / totalAnimationCycle; 

        particle.style.setProperty('--particle-delay', relativeDelayCSS.toFixed(3)); 
        particle.style.setProperty('--particle-x', `${Math.random() * 20 - 10}px`); 
        particle.style.setProperty('--particle-y', `${Math.random() * -4 - 2}px`); 
        particle.style.setProperty('--particle-color', colors[Math.floor(Math.random() * colors.length)]);
        
            particle.style.animationDuration = `${particleAnimationDuration}s`; 
            particle.style.animationIterationCount = 'infinite'; 

        container.appendChild(particle);
    }
}

// Iniciar
initApp();
