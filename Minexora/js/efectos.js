$(document).ready(function () {
    $('.menu a').css('position', 'relative');
    $('.menu a').each(function (index, elemento) {
        $(this).css({
            'top': '-200px'
        }).animate({
            'top': '0'
        }, 2000 + (index * 500));
    });

    if ($(window).width() > 800) {
        $('header .texto').css({
            opacity: 0,
            marginTop: 0
        });

        $('header .texto').animate({
            opacity: 1,
            marginTop: '-52px'
        }, 1500);
    }

    var acercaDe = $('#acerca-de').offset().top;
    var servicios = $('#productos').offset().top;
    var galeria = $('#galeriaId').offset().top;
    var ubicacion = $('#ubicacionId').offset().top;

    $('#btn-Acerca-de').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: acercaDe - 300
        }, 500);
    });

    $('#btn-Servicios').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: servicios
        }, 500);
    });

    $('#btn-Galeria').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: galeria
        }, 500);
    });

    $('#btn-Ubicacion').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: ubicacion
        }, 500);
    });

    $(window).scroll(function () {
        var windowWidth = $(window).width();

        if (windowWidth > 800) {
            var scroll = $(window).scrollTop();

            $('header .textos').css({
                'transform': 'translate(0px,' + scroll / 2 + '%)'
            });

            $('.acerca-de article').css({
                'transform': 'translate(0px, -' + scroll / 4 + '%)'
            });
        }
    });

    $(window).resize(function () {
        var windowWidth = $(window).width();
        if (windowWidth < 800) {
            $('.acerca-de article').css({
                'transform': 'translate(0px, 0px)'
            });
        }
    });

    /* ------------ CARRUSEL INFINITO SIN SALTOS ------------ */
    const track = document.querySelector('.carousel-track');
    if (track) {
        // Duplicamos los productos para garantizar continuidad
        const clones = track.innerHTML;
        track.innerHTML += clones;

        // Ajustamos el ancho dinámicamente
        const items = track.querySelectorAll('.producto');
        const itemWidth = items[0].offsetWidth + 40; // ancho + gap
        const totalWidth = itemWidth * items.length;

        // Ajustamos duración según el ancho total
        const duracion = totalWidth / 80; // velocidad: px por segundo
        track.style.animationDuration = duracion + "s";
    }

    /* ------------ EFECTOS EN IMÁGENES ------------ */
    $('.producto img').each(function () {
        // aumentar alto dinámicamente
        $(this).css({
            "height": "260px",
            "border-radius": "20px",
            "box-shadow": "0 8px 20px rgba(0,0,0,0.3)"
        });

        // añadir un fondo con degradado animado
        $(this).parent().css({
            "background": "linear-gradient(135deg, rgba(0,133,0,0.1), rgba(0,0,0,0.05))",
            "border-radius": "20px",
            "transition": "background 0.5s ease"
        });

        // efecto hover
        $(this).parent().hover(
            function () {
                $(this).css("background", "linear-gradient(135deg, rgba(0,133,0,0.25), rgba(0,0,0,0.15))");
            },
            function () {
                $(this).css("background", "linear-gradient(135deg, rgba(0,133,0,0.1), rgba(0,0,0,0.05))");
            }
        );
    });
});
