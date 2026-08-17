(function () {
    const gates = Array.from(document.querySelectorAll("[data-gate]"))
        .map(el => ({ el, at: Number(el.dataset.gate) || 0, shown: false })) // sempre começa bloqueado
        .sort((a, b) => a.at - b.at);

    gates.forEach(g => g.el.classList.add("hidden")); // garante que não “pisque” antes do JS

    function unlock(sec) {
        for (const g of gates) {
            if (!g.shown && sec >= g.at) {
                g.el.classList.remove("hidden");
                g.shown = true;
            }
        }
    }

    function attachSmartplayer(tries = 0) {
        const inst = window.smartplayer?.instances?.[0];
        if (!inst) {
            if (tries < 40) setTimeout(() => attachSmartplayer(tries + 1), 250); // tenta por ~10s
            return;
        }
        const onTick = () => unlock(inst.video?.currentTime || 0);
        inst.on("timeupdate", onTick);
        inst.on("seeking", onTick);
        inst.on("play", onTick);
        onTick(); // checa imediatamente
    }

    attachSmartplayer();

    // debug manual pelo console
    window.gateReport = function (seconds) {
        unlock(Number(seconds) || 0);
    };
})();
