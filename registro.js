document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-comunidad');
    const loader = document.getElementById('loader');
    const modalSuccess = document.getElementById('modal-success');

    // ============ WIZARD: navegación por pasos ============
    const TOTAL_STEPS = 3;
    const STEP_TITLES = {
        1: 'Datos básicos',
        2: 'Redes sociales',
        3: 'Herramientas'
    };
    let currentStep = 1;

    const stepPanels = form.querySelectorAll('.step-panel');
    const stepDots = document.querySelectorAll('.step-dot');
    const progressLabel = document.getElementById('progress-label');
    const progressTitle = document.getElementById('progress-title');
    const btnBack = document.getElementById('btn-back');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');

    function validateStep(stepEl) {
        const requiredInputs = stepEl.querySelectorAll('[required]');
        for (const el of requiredInputs) {
            if (!el.checkValidity()) {
                el.reportValidity();
                return false;
            }
        }
        return true;
    }

    function goToStep(n) {
        currentStep = n;

        stepPanels.forEach(panel => {
            panel.classList.toggle('active', Number(panel.dataset.step) === n);
        });

        stepDots.forEach(dot => {
            const isDone = Number(dot.dataset.dot) <= n;
            dot.classList.toggle('bg-yellow-comunidad', isDone);
            dot.classList.toggle('bg-white/15', !isDone);
        });

        progressLabel.textContent = `Paso ${n} de ${TOTAL_STEPS}`;
        progressTitle.textContent = STEP_TITLES[n];

        btnBack.classList.toggle('hidden', n === 1);
        btnNext.classList.toggle('hidden', n === TOTAL_STEPS);
        btnSubmit.classList.toggle('hidden', n !== TOTAL_STEPS);

        const card = document.getElementById('form-card');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    btnNext.addEventListener('click', () => {
        const activePanel = form.querySelector(`.step-panel[data-step="${currentStep}"]`);
        if (!validateStep(activePanel)) return;
        goToStep(currentStep + 1);
    });

    btnBack.addEventListener('click', () => {
        goToStep(currentStep - 1);
    });

    // Resalta la opción elegida en cada grupo de radios/checkboxes
    form.querySelectorAll('.option-group').forEach(group => {
        group.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => {
                if (input.type === 'radio') {
                    group.querySelectorAll('.option-pill').forEach(pill => {
                        pill.classList.remove('border-yellow-comunidad', 'bg-yellow-comunidad/10');
                    });
                }
                const pill = input.closest('.option-pill');
                if (input.checked) {
                    pill.classList.add('border-yellow-comunidad', 'bg-yellow-comunidad/10');
                } else {
                    pill.classList.remove('border-yellow-comunidad', 'bg-yellow-comunidad/10');
                }
            });
        });
    });
    // ============ FIN WIZARD ============

    // IMPORTANTE: Reemplazá esto con la URL que te da Google Apps Script al implementar
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwGLTRGPpfXhvs5vFEMPiEYD3Ic5RFTNZ26tmktfm200EBGvEcRtJRMNTIOQ_wIG3WB/exec';

    // Envía los datos a Google Apps Script. Usamos fetch con no-cors (igual que
    // en sumatucomercio.js) en vez de sendBeacon: Apps Script responde con un
    // redirect antes de ejecutar el doPost, y sendBeacon no siempre lo sigue
    // bien, por lo que puede "encolar" el envío sin que el dato llegue nunca
    // al Sheet. fetch maneja ese redirect de forma transparente.
    async function enviarDatos(datos) {
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Fundamental para Google Apps Script
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(datos)
            });
            return true;
        } catch (error) {
            console.error("Error al enviar:", error);
            return false;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Mostrar Loader
        loader.classList.remove('hidden');
        loader.classList.add('flex');

        const formData = new FormData(form);

        // Juntamos todas las redes sociales (checkboxes) separadas por coma
        const redesSeleccionadas = formData.getAll('redes').join(', ');

        // Preparamos los datos estructurados para Google Sheets
        const datos = {
            nombreEmprendimiento: formData.get('nombreEmprendimiento'),
            nombreResponsable: formData.get('nombreResponsable'),
            whatsapp: formData.get('whatsapp'),
            conocimientoRedes: formData.get('conocimientoRedes'),
            redes: redesSeleccionadas,
            manejoRedes: formData.get('manejoRedes'),
            comodidad: formData.get('comodidad'),
            experienciaWeb: formData.get('experienciaWeb'),
            dispositivo: formData.get('dispositivo')
        };

        const enviado = await enviarDatos(datos);

        loader.classList.add('hidden');
        loader.classList.remove('flex');

        if (enviado) {
            // ÉXITO: mostrar modal
            modalSuccess.classList.remove('hidden');
            modalSuccess.classList.add('flex');
            form.reset();
            form.querySelectorAll('.option-pill').forEach(pill => {
                pill.classList.remove('border-yellow-comunidad', 'bg-yellow-comunidad/10');
            });
            goToStep(1);
        } else {
            alert("Hubo un problema al enviar la información. Por favor, revisá tu conexión e intentá de nuevo.");
        }
    });
});
