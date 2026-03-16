
const fmt = (n) => '€' + Number(n || 0).toLocaleString('es-ES', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
    function calculate() {
        ['p', 'b', 'o'].forEach(s => {
            // 1. Premisas y Cálculos de Venta
            const n = parseFloat(document.getElementById(`v1_${s}`).value) || 0;    // Tomas
            const vel = parseFloat(document.getElementById(`v11_${s}`).value) || 0; // Velocidad de carga (kW)
            const util2 = parseFloat(document.getElementById(`v2_${s}`).value) || 0; // % de Utilización diaria

            // Calculamos la venta mensual (k) basada en: Potencia * 24h * % Utilización * 30 días
            const k = vel * 24 * (util2 / 100) * 30; 
            document.getElementById(`v3_${s}`).value = k.toFixed(2); // Mostramos el kWh/mes calculado

            const pvp = parseFloat(document.getElementById(`v4_${s}`).value) || 0;
            const ce = parseFloat(document.getElementById(`v5_${s}`).value) || 0;
            const period = parseFloat(document.getElementById(`v9_${s}`).value) || 60;

            // Cálculo de Ingresos y Margen
            const ingE = n * k * pvp;
            document.getElementById(`v6_${s}`).value = pvp > 0 ? (((pvp - ce) / pvp) * 100).toFixed(2) + '%' : '0.00%';
            document.getElementById(`v10_${s}`).value = fmt(ingE);

            // 2. CAPEX
            let capex = 0 ;
            
            for(let i=1; i<=7; i++) capex += parseFloat(document.getElementById(`c${i}_${s}`).value) || 0;
            
            
            const equipos = parseFloat(document.getElementById(`c4_${s}`).value) || 0;
            document.getElementById(`c8_${s}`).value = fmt(equipos * 0.20);
            const dep = equipos * 0.20; // depreciación anual informativa
            const amort = capex / period; // amortización mensual del CAPEX
            document.getElementById(`c10_${s}`).value = fmt(capex);
            document.getElementById(`c11_${s}`).value = fmt(amort);

            // 3. OPEX
            let opexTotal = 0;
            for(let i=1; i<=9; i++) opexTotal += parseFloat(document.getElementById(`o${i}_${s}`).value) || 0;
            document.getElementById(`o10_${s}`).value = fmt(opexTotal);

            // 4. EXTRA (Corregido IDs para evitar TypeError)
            let extraTotal = 0;
            for(let i=1; i<=5; i++) {
                extraTotal += parseFloat(document.getElementById(`e${i}_${s}`).value) || 0;
            }
            document.getElementById(`e6_${s}`).value = fmt(extraTotal);

            // 5. RENTABILIDAD
            const totalIng = ingE + extraTotal;
            const costoET = n * k * ce;
            const royVar = ingE * 0.15;
            const util = totalIng - (costoET + royVar + opexTotal + amort);
            
            document.getElementById(`r1_${s}`).value = fmt(totalIng);
            document.getElementById(`r2_${s}`).value = fmt(costoET);
            document.getElementById(`r3_${s}`).value = fmt(royVar);
            document.getElementById(`r4_${s}`).value = fmt(util); 

            if(s === 'b'){
                dibujarGraficaFlujo(capex, util);
            }
//------------------------------------------seccion 2 ---------------------------------
                    // --- LÓGICA BLOQUES 6 AL 10 ---
         // ================= BLOQUE 6 – ESCALABILIDAD =================

        // Utilidad base mensual (Excel)
        const utilidadBase = util;

        if (n > 0) {

            // Utilidad mensual escalada a 10 unidades
            const utilidad10 = (utilidadBase / n) * 10;
            document.getElementById(`v6_2_${s}`).value = fmt(utilidad10);

            // Año óptimo de escalabilidad
            const anioOptimo = (utilidadBase * 12 > 25000)
                ? "Año 1"
                : "Año 2";

            document.getElementById(`v6_3_${s}`).value = anioOptimo;

        } else {

            document.getElementById(`v6_2_${s}`).value = fmt(0);
            document.getElementById(`v6_3_${s}`).value = "N/A";
        }

        // ================= BLOQUE 7 – ACUMULADOS =================
        const acumulado5 = util * 0.70 * 60;
        const reinversion = acumulado5 * (Math.pow(1.07, 5) - 1);

        document.getElementById(`v7_1_${s}`).value = fmt(acumulado5);
        document.getElementById(`v7_2_${s}`).value = fmt(reinversion);

        // ================= BLOQUE 8 – EXIT =================
        const contrato7 = util * 84;
        const multiplo = parseFloat(document.getElementById(`v8_2_${s}`).value) || 0;

        // EBITDA anual y valuación base con múltiplo
        const ebitdaAnual = (util + amort) * 12;
        const precioVenta = ebitdaAnual * multiplo;

        // 🔹 Plus como porcentaje real
        const plusEscala = (s === 'p') ? 0.15 : (s === 'b') ? 0.25 : 0.40;

        // 🔹 Valuación final con plus
        const valuacionFinal = precioVenta * (1 + plusEscala);

        document.getElementById(`v8_1_${s}`).value = fmt(contrato7);
        document.getElementById(`v8_3_${s}`).value = fmt(precioVenta);
        document.getElementById(`v8_4_${s}`).value = (plusEscala * 100).toFixed(0) + "%";
        document.getElementById(`v8_5_${s}`).value = fmt(valuacionFinal);

        // ================= BLOQUE 9 – VALOR POR PLAZA =================

        // Valor inicial dinámico
        const valorInicial = parseFloat(document.getElementById(`v9_3_${s}`).value) || 0;

        // valor agregado por infraestructura
        const valorInfra = capex * 0.5;

        // valor agregado por operación
        const valorFlujo = util * 12 * 2;

        // valor final realista
        const valorFinalPlaza = valorInicial + valorInfra + valorFlujo;

        // plusvalía
        const plusvalia = valorInicial > 0
            ? valorFinalPlaza / valorInicial
            : 0;

        // Tiempo retorno
        const paybackMeses = util > 0
            ? (capex / util)
            : Infinity;

        // TIR operativa
        const tirOperativa = capex > 0
            ? ((util * 12) / capex * 100)
            : 0;

        document.getElementById(`v9_1_${s}`).value = tirOperativa.toFixed(2) + '%';
        document.getElementById(`v9_2_${s}`).value =
            (isFinite(paybackMeses) ? paybackMeses.toFixed(1) : 'N/A') + ' meses';
        document.getElementById(`v9_4_${s}`).value = fmt(valorFinalPlaza);
        document.getElementById(`v9_5_${s}`).value = plusvalia.toFixed(2) + 'x';


                // ===== RESUMEN SUPERIOR DE PLUSVALÍA =====
        // ===== RESUMEN SUPERIOR DE PLUSVALÍA (BASE) =====
        const inversionInicial = valorInicial; // 100,000
        const horizonteAnios = 5;

        document.getElementById('pv_inv_b').textContent = fmt(inversionInicial);
        document.getElementById('pv_t_b').textContent = horizonteAnios + ' años';



            // ================= BLOQUE 10 – COMISIONES =================
        const comisionFija = 500*n;                 // si existe input editable, aquí se lee
        const comisionVariable = totalIng * 0.02;   // 2% sobre venta electricidad

        const referidosEstimados = (s === 'p') ? 1 : (s === 'b') ? 2 : 5;
        const comisionPorReferido = 1500;
        const comisionReferidos = referidosEstimados * comisionPorReferido;

        const totalComisiones = comisionFija + comisionVariable + comisionReferidos;

        document.getElementById(`v10_1_${s}`).value = fmt(comisionFija);
        document.getElementById(`v10_2_${s}`).value = fmt(comisionVariable);
        document.getElementById(`v10_3_${s}`).value = referidosEstimados;
        document.getElementById(`v10_4_${s}`).value = fmt(comisionReferidos);
        document.getElementById(`v10_5_${s}`).value = fmt(totalComisiones);
        
        });
        // ===== RESUMEN ESTRATÉGICO (3 PILARES) =====
        ['p','b','o'].forEach(s => {

            // Pilar 1: Utilidad neta mensual
            document.getElementById(`kpi_u_${s}`).textContent =
                document.getElementById(`r4_${s}`).value;

            // Pilar 2: Plusvalía / Exit
            document.getElementById(`kpi_x_${s}`).textContent =
                document.getElementById(`v9_4_${s}`).value;

            // Pilar 3: Comisiones
            document.getElementById(`kpi_c_${s}`).textContent =
                document.getElementById(`v10_5_${s}`).value;
            // --- ACTUALIZACIÓN DE TABLA COMPARATIVA POR DEBAJO ---

// 1. kWh Totales
const kwh_val = (parseFloat(document.getElementById(`v1_${s}`).value) || 0) * (parseFloat(document.getElementById(`v3_${s}`).value) || 0);
document.getElementById(`comp_kwh_${s}`).textContent = Number(kwh_val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// 2. Margen de Energía
document.getElementById(`comp_margin_${s}`).textContent = document.getElementById(`v6_${s}`).value;

// 3. Payback
document.getElementById(`comp_pay_${s}`).textContent = document.getElementById(`v9_2_${s}`).value;

// 4. TIR
document.getElementById(`comp_tir_${s}`).textContent = document.getElementById(`v9_1_${s}`).value;

// 5. Plusvalía (x veces)
document.getElementById(`comp_plus_${s}`).textContent = document.getElementById(`v9_5_${s}`).value;
        });
        
        // === ACTUALIZACIÓN DE DETALLES EXTRA EN CARDS (SOLO BASE) ===
// 1. Datos de Energía
const kwh_total = (parseFloat(document.getElementById('v1_b').value) || 0) * (parseFloat(document.getElementById('v3_b').value) || 0);
document.getElementById('det_kwh_b').textContent = kwh_total.toLocaleString();
document.getElementById('det_margin_b').textContent = document.getElementById('v6_b').value;

// 2. Datos de Plusvalía
document.getElementById('det_payback_b').textContent = document.getElementById('v9_2_b').value;
document.getElementById('det_plus_b').textContent = document.getElementById('v9_5_b').value;

// 3. Datos de Comisiones
document.getElementById('det_ref_b').textContent = document.getElementById('v10_3_b').value;
document.getElementById('det_com_var_b').textContent = document.getElementById('v10_2_b').value;



        
        dibujarGraficaCrecimiento5Anios();
        actualizarInterpretacion();
        }

        
function resetEditable() {
    // 1. Resetea todos los inputs de la tabla a sus valores por defecto (HTML original)
    document.querySelectorAll('.read, .edit').forEach(input => {
        // Usamos defaultValue si existe, o el valor que definamos como base
        if (input.id.includes('v11')) { 
            // Caso especial para velocidad de carga si no tiene defaultValue
            input.value = input.id.endsWith('_p') ? 7.4 : (input.id.endsWith('_b') ? 11 : 22);
        } else {
            input.value = input.defaultValue;
        }
    });

    // 2. Resetea los Sliders y sus etiquetas visuales
    ['p', 'b', 'o'].forEach(s => {
        // --- Escenario (Número de tomas v1) ---
        const defTomas = (s === 'p') ? 2 : (s === 'b') ? 4 : 6;
        if(document.getElementById(`ctrl_${s}`)) {
            document.getElementById(`ctrl_${s}`).value = defTomas;
            document.getElementById(`val_${s}`).textContent = defTomas;
            document.getElementById(`v1_${s}`).value = defTomas;
        }

        // --- Velocidad de Carga (v11) ---
        const defVel = (s === 'p') ? 7.4 : (s === 'b') ? 22 : 28;
        if(document.getElementById(`ctrl_v11_${s}`)) {
            document.getElementById(`ctrl_v11_${s}`).value = defVel;
            document.getElementById(`val_v11_${s}`).textContent = defVel + " kW";
            document.getElementById(`v11_${s}`).value = defVel;
        }

        // --- Utilización (v2) ---
        const defUtil = (s === 'p') ? 3 : (s === 'b') ? 5 : 7;
        if(document.getElementById(`ctrl_v2_${s}`)) {
            document.getElementById(`ctrl_v2_${s}`).value = defUtil;
            document.getElementById(`val_v2_${s}`).textContent = defUtil + "%";
            document.getElementById(`v2_${s}`).value = defUtil;
        }
        const defCosto = (s === 'p') ? 4.90 : (s === 'b') ? 3.90 : 2.90;
        if(document.getElementById(`ctrl_v5_${s}`)) {
            document.getElementById(`ctrl_v5_${s}`).value = defCosto;
            document.getElementById(`val_v5_${s}`).textContent =defCosto.toFixed(2);
            document.getElementById(`v5_${s}`).value = defCosto;
        }
        // --- Valor de Plaza (v9_3) ---
        const defPlaza = 5000;
        if(document.getElementById(`ctrl_v9_${s}`)) {
            document.getElementById(`ctrl_v9_${s}`).value = defPlaza;
            document.getElementById(`val_v9_${s}`).textContent = '€' + defPlaza.toLocaleString('es-ES');
            document.getElementById(`v9_3_${s}`).value = defPlaza;
        }
    });

    // 3. Recalcula todo con los valores reseteados
    calculate();
}

    // Listener para actualizar en tiempo real
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', calculate);
    });

function syncScenario(suffix, value) {
    // 1. Validar el rango (entre 1 y 12 cargadores)
    value = Math.max(1, Math.min(12, Number(value) || 1));

    // 2. Actualizar el slider y el input de la tabla (v1)
    document.getElementById(`ctrl_${suffix}`).value = value;
    document.getElementById(`v1_${suffix}`).value = value;

    // 3. Mostrar el número de cargadores al lado del slider (sin $)
    const label = document.getElementById(`val_${suffix}`);
    if(label) label.textContent = value; // Solo el número, ej: "6"

    calculate();
}
function stepScenario(suffix, delta){
    const input = document.getElementById(`ctrl_${suffix}`);
    syncScenario(suffix, Number(input.value) + delta);
}


 // GRAFICO 2

function generarFlujoAcumulado(capex, utilidad, meses = 60){

    const labels = [];
    const data = [];

    let acumulado = -capex;

    for(let i = 0; i <= meses; i++){

        labels.push("Mes " + i);

        if(i === 0){
            data.push(acumulado);
        } else {
            acumulado += utilidad;
            data.push(acumulado);
        }
    }

    return {labels, data};
}

let graficoFlujo;

function dibujarGraficaFlujo(capex, utilidad) {

    const flujo = generarFlujoAcumulado(capex, utilidad);

    const labels = flujo.labels.slice(0, 36);
    const data = flujo.data.slice(0, 36);

    const ctx = document.getElementById('graficoFlujo');
    if (!ctx) return;

    if (graficoFlujo) graficoFlujo.destroy();

    graficoFlujo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Flujo acumulado',
                data: data,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHitRadius: 10,
                borderWidth: 3,

                segment: {
                    borderColor: ctx => ctx.p0.parsed.y < 0 ? '#ef4444' : '#5bc008',
                    backgroundColor: ctx => ctx.p0.parsed.y < 0
                        ? 'rgba(239,68,68,0.18)'
                        : 'rgba(124, 192, 14, 0.18)'
                }
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            clip: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            layout: {
                padding: {
                    bottom: 40,
                    left: 20
                }
            },

            scales: {
                x: {
                    display: true,
                    grid: {
                        drawBorder: true,
                        display: false
                    },
                    ticks: {
                        font: { size: 12 },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8
                    }
                },

                y: {
                    ticks: {
                        callback: (v) => '€' + Number(v).toLocaleString('es-ES')
                    }
                }
            }
        }
    });
} 
function actualizarInterpretacion(){

const cargadores = document.getElementById("v1_b").value;

const payback = document.getElementById("v9_2_b").value;

const acumuladoRaw = document.getElementById("v7_1_b").value;
// limpiar símbolo y formato es-ES para obtener número
const acumuladoNumber = Number(String(acumuladoRaw).replace(/[€\s]/g, '').replace(/\./g, '').replace(/,/g, '.')) || 0;
const acumuladoUS = '€' + acumuladoNumber.toLocaleString('en-US', { maximumFractionDigits: 0 });

const texto = `
Con <strong>${cargadores} cargadores</strong> en escenario <strong>BASE</strong>, 
recuperas tu inversión en aproximadamente <strong>${payback}</strong> 
y tu proyecto podría generar cerca de <strong>${acumuladoUS}</strong> en <strong>5 años</strong>.
`;

document.getElementById("interpretacion").innerHTML = texto;

}



    
function syncInput(id, value){

document.getElementById(id).value = value;

calculate();

}
function syncValorPlaza(suffix, value){

value = Number(value);

document.getElementById(`v9_3_${suffix}`).value = value;

document.getElementById(`val_v9_${suffix}`).textContent =
'€' + Number(value).toLocaleString('es-ES');

calculate();

}
    window.onload = calculate;

    // Sincronizar Slider de Velocidad de Carga (v11)
const velocidades = [3.7, 7.4, 11, 22, 30, 50, 120, 180];

function syncVelocidad(suffix, index) {

    const value = velocidades[index];

    document.getElementById(`v11_${suffix}`).value = value;

    document.getElementById(`val_v11_${suffix}`).textContent =
        value + " kW";

    calculate();
}

// Sincronizar Slider de % de Utilización (v2)
function syncUtilizacion(suffix, value) {
    value = parseFloat(value);
    // Actualiza el campo oculto de la tabla
    document.getElementById(`v2_${suffix}`).value = value;
    // Actualiza el texto debajo del slider
    document.getElementById(`val_v2_${suffix}`).textContent = value + "%";
    calculate();
}
// Sincronizar Costo de Electricidad (v5)
function syncCosto(suffix, value) {
    const val = parseFloat(value);
    // 1. Actualiza el input en la tabla (v5)
    const tablaInput = document.getElementById(`v5_${suffix}`);
    if (tablaInput) tablaInput.value = val.toFixed(2);

    // 2. Actualiza el texto visual del slider
    const label = document.getElementById(`val_v5_${suffix}`);
    if (label) label.textContent = val.toFixed(2);

    // 3. Ejecuta el cálculo general
    calculate();
}
