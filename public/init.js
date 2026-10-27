// Marca que há JavaScript (para as entradas animadas) e cobre a falha do módulo principal.
document.documentElement.classList.add('js');
setTimeout(function () {
  if (!document.documentElement.dataset.efeitos) document.documentElement.classList.add('revelar-tudo');
}, 3000);
