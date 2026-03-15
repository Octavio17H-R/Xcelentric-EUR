function ajustarCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // ancho y alto del contenedor
    const rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
}

function dibujarGraficaCrecimiento5Anios() {
    const canvas = document.getElementById('graficaGanancias');
    ajustarCanvas(canvas);
    const ctx = canvas.getContext('2d');

    const escenarios = ['p','b','o'];
    const labels = ['Mes 1', 'Mes 12', 'Mes 24', 'Mes 36', 'Mes 48', 'Mes 60'];

    const colores = {
        p: { border: '#F9D342', bg: '#FFF9C4', point: '#F9A825' },
        b: { border: '#FFB74D', bg: '#FFE0B2', point: '#FF9800' },
        o: { border: '#90A4AE', bg: '#CFD8DC', point: '#607D8B' }
    };

    const datasets = escenarios.map(s => {
        const utilidadMensual = parseFloat(document.getElementById(`r4_${s}`).value.replace(/[$,%]/g,'')) || 0;
        const exit = parseFloat(document.getElementById(`v8_5_${s}`).value.replace(/[$,%]/g,'')) || 0;

        const data = [];
        for(let i=0; i<6; i++){
            if(i < 5){
                data.push(utilidadMensual * 12 * (i+1));
            } else {
                data.push(exit);
            }
        }

        const nombresEscenario = { p: 'Pesimista', b: 'Base', o: 'Optimista' };
        return {
            label: nombresEscenario[s],
            data,
            fill: false,
            borderColor: colores[s].border,
            backgroundColor: colores[s].bg,
            tension: 0.3,
            pointRadius: 6,
            pointBackgroundColor: colores[s].point,
            borderWidth: 3,
        };
    });

    if(window.miGrafica) window.miGrafica.destroy();

    window.miGrafica = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Proyección de ganancias a 5 años',
                    color: '#37474F',
                    font: { size: 16, weight: '700' }
                },
                legend: {
                    labels: {
                        color: '#37474F',
                        font: { size: 12, weight: '600' }
                    }
                },
                tooltip: {
                    backgroundColor: '#37474F',
                    titleColor: '#FFFFFF',
                    bodyColor: '#FFFFFF',
                    callbacks: {
                        label: function(context){
                            return '$' + Number(context.raw).toLocaleString('es-MX', {minimumFractionDigits:0});
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Monto ($)',
                        color: '#37474F',
                        font: { size: 12, weight: '600' }
                    },
                    ticks: { color: '#607D8B' }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo',
                        color: '#37474F',
                        font: { size: 12, weight: '600' }
                    },
                    ticks: { color: '#607D8B' }
                }
            }
        }
    });
}