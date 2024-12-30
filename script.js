const text = ["Computer Vision Engineer", "Data Scientist", "MLOps Engineer"];
let count = 0;
let index = 0;
let currentText = "";
let letter = "";

(function type() {
    if (count === text.length) {
        count = 0;
    }
    currentText = text[count];
    letter = currentText.slice(0, ++index);

    document.getElementById("animated-text").textContent = letter;
    if (letter.length === currentText.length) {
        count++;
        index = 0;
        setTimeout(type, 1500); // Pause before the next word
    } else {
        setTimeout(type, 100); // Speed of typing
    }
})();


window.addEventListener('scroll', function() {
    const header = document.querySelector('.header-bar');
    if (window.scrollY > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

document.addEventListener('mousemove', (e) => {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const dx = (Math.random() - 0.5) * 100;
        const dy = (Math.random() - 0.5) * 100;
        particle.style.left = `${e.pageX}px`;
        particle.style.top = `${e.pageY}px`;
        particle.style.setProperty('--dx', `${dx}px`);
        particle.style.setProperty('--dy', `${dy}px`);
        document.body.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }
});


