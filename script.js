document.addEventListener('DOMContentLoaded', function() {

    // --- LOGIKA HAMBURGER MENU ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    
    // Toggle menu saat hamburger diklik
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('show');
    });

    // Sembunyikan menu saat link di klik (untuk mobile)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('show')) { // Hanya sembunyikan jika menu sedang terbuka
                hamburger.classList.remove('active');
                navLinks.classList.remove('show');
            }
        });
    });

    // --- LOGIKA ANIMASI SCROLL (Intersection Observer) ---
    const animateElements = document.querySelectorAll('.animate-title, .animate-content, .home-text, .home-image');

    const observerOptions = {
        root: null, // Mengamati viewport
        rootMargin: '0px',
        threshold: 0.15 // Elemen terlihat 15% untuk memicu animasi
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Hentikan observasi setelah animasi pertama
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // --- ANIMASI BACKGROUND PARTIKEL (Canvas) ---
    const canvas = document.getElementById('particle-bg');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const colors = [
        '#00fff7', '#00c3ff', '#a7d9e2', '#e0f7fa', '#00e0ff', '#00aaff', '#5d7d9b'
    ]; // Diperbarui untuk palet warna yang konsisten

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Panggil ulang createParticles untuk menyesuaikan dengan ukuran baru
        createParticles(window.innerWidth < 768 ? 10 : 20); // Kurangi partikel di mobile
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Panggil pertama kali untuk mengatur ukuran

    function randomBetween(a, b) { return a + Math.random() * (b - a); }

    function createParticles(num) {
        particles = []; // Reset partikel
        for (let i = 0; i < num; i++) {
            particles.push({
                x: randomBetween(0, canvas.width),
                y: randomBetween(0, canvas.height),
                r: randomBetween(1.5, 4), // Radius partikel lebih kecil
                color: colors[Math.floor(Math.random() * colors.length)],
                dx: randomBetween(-0.3, 0.3), // Kecepatan lebih halus
                dy: randomBetween(-0.3, 0.3),
                alpha: randomBetween(0.1, 0.4) // Transparansi lebih tinggi
            });
        }
    }
    // createParticles dipanggil di resizeCanvas, jadi tidak perlu di sini lagi
    // createParticles(20); 

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan canvas
        for (let p of particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); // Menggunakan Math.PI * 2
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = p.r * 8; // Blur mengikuti radius partikel
            ctx.fill();
            ctx.restore();

            p.x += p.dx;
            p.y += p.dy;

            // Memantul dari tepi
            if (p.x < -p.r) p.x = canvas.width + p.r;
            if (p.x > canvas.width + p.r) p.x = -p.r;
            if (p.y < -p.r) p.y = canvas.height + p.r;
            if (p.y > canvas.height + p.r) p.y = -p.r;
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --- FALLBACK FOTO PROFIL (untuk bagian home) ---
    const profileImg = document.querySelector('img.profile-picture');
    if (profileImg) {
        // Daftar kandidat path gambar, disarankan pakai relative path tanpa root domain
        const candidates = [
            'images/profil.jpg',
            'images/profil.jpeg',
            'images/profile.jpg',
            'images/profile.jpeg',
            'images/IMG_0740.jpg'
        ];

        let currentIndex = 0;

        const tryNextImage = () => {
            if (currentIndex >= candidates.length) {
                console.error('Semua gambar profil gagal dimuat.');
                profileImg.src = 'https://via.placeholder.com/320x320?text=Foto+Tidak+Ada'; // Placeholder jika semua gagal
                return;
            }
            const nextSrc = candidates[currentIndex];
            currentIndex++;
            
            const img = new Image();
            img.onload = () => {
                profileImg.src = nextSrc;
                profileImg.removeEventListener('error', tryNextImage); // Hapus listener error setelah berhasil
            };
            img.onerror = tryNextImage; // Jika gambar ini gagal, coba yang berikutnya
            img.src = nextSrc;
        };

        // Jika gambar utama (pertama) gagal dimuat, mulai coba kandidat lain
        profileImg.addEventListener('error', tryNextImage, { once: true });

        // Cek langsung jika gambar sudah ada dan valid (misal dari cache)
        if (profileImg.complete && profileImg.naturalWidth !== 0) {
            // Gambar sudah berhasil dimuat
        } else if (profileImg.src === '' || profileImg.src.includes('undefined') || !profileImg.src.includes('profil.jpg.jpg')) {
            // Jika src kosong atau terlihat rusak, mulai coba fallback
            tryNextImage();
        }
    }


    // --- TYPEWRITER EFFECT UNTUK SUBTITLE ---
    const subtitleElement = document.getElementById('typewriter-text');
    const textToType = "Saya adalah seorang Mahasiswa Sistem Informasi Semester 3 di Universitas Pendidikan Ganesha, yang bercita-cita ingin menjadi pebisnis yang sukses.";
    let charIndex = 0;
    let delay = 50; // Millidetik per karakter

    function typeWriter() {
        if (charIndex < textToType.length) {
            subtitleElement.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, delay);
        }
    }

    // Panggil typewriter hanya saat bagian home terlihat
    const homeSection = document.getElementById('home');
    const homeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (charIndex === 0) { // Pastikan hanya dijalankan sekali
                    typeWriter();
                }
                observer.unobserve(entry.target); // Hentikan observasi
            }
        });
    }, { threshold: 0.5 }); // Pemicu saat 50% section home terlihat

    homeObserver.observe(homeSection);

});