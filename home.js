/* Скрипты главной страницы Whoopy: подсветка точек-оглавления,
   перепечатка заголовка, появление блоков вылетом, приплывающая плашка.
   Вынесены из index.html 04.08.2026 по той же причине, что и стили —
   английская версия должна брать тот же файл, а не его копию. */

/* Здесь жил скрипт красной метки у логотипа: она горела 10 дней с даты
   последнего обновления и гасла сама. Метка убрана 03.08.2026 по слову Саши
   («тут давай без точки»), скрипт ушёл следом — мёртвый код хуже лишней
   точки: он ищет элемент, которого нет, и делает вид, что что-то умеет. */

/* Оглавление точками: подсветка той, в чьём разделе мы сейчас.
   Порог 0.5 экрана сверху — активной становится секция, дошедшая до середины
   вида, а не та, что едва показалась краем. Иначе точка дёргается на стыках. */
(function () {
  var dots = document.getElementById('dots');
  if (!dots) return;
  var links = [].slice.call(dots.querySelectorAll('a'));
  var targets = links.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });

  function paint() {
    var mid = window.innerHeight * 0.5, best = 0;
    targets.forEach(function (el, i) {
      if (el && el.getBoundingClientRect().top <= mid) best = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('on', i === best); });
    // сами точки показываются вместе с плашкой — на первом экране их нет
    dots.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
  }

  paint();
  addEventListener('scroll', paint, { passive: true });
  addEventListener('resize', paint);
})();

/* Заголовок перепечатывает сам себя: «второй мозг» ⇄ «ИИ».
   Стирание быстрее печати — так живой человек и печатает.
   Долгая пауза на «второй мозг»: это наше слово, «ИИ» — только пояснение к нему. */
(function () {
  var live = document.getElementById('swapLive'), hold = document.querySelector('#swap .hold');
  if (!live) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Слова переехали из кода в разметку (data-words у #swap) 04.08.2026, когда
     появилась английская версия: скрипт у обеих страниц один, и зашитая в него
     русская пара печатала бы «второй мозг» поверх английского заголовка.
     Значение по умолчанию оставлено на случай, если атрибут забыли. */
  var swapBox = document.getElementById('swap');
  var words = ((swapBox && swapBox.dataset.words) || 'второй мозг|ИИ').split('|');
  var i = 0, ch = words[0].length, erasing = true;
  var caret = document.createElement('i');
  caret.className = 'caret';

  function draw(text) {
    live.textContent = text;
    live.appendChild(caret);
  }

  function tick() {
    var word = words[i], next = words[(i + 1) % words.length], delay;
    if (erasing) {
      ch--;
      draw(word.slice(0, ch));
      delay = 55;
      if (ch === 0) { erasing = false; i = (i + 1) % words.length; delay = 260; }
    } else {
      ch++;
      draw(words[i].slice(0, ch));
      delay = 95;
      if (ch === words[i].length) { erasing = true; delay = i === 0 ? 4200 : 1700; }
    }
    setTimeout(tick, delay);
  }
  draw(words[0]);
  setTimeout(tick, 2600);
})();

/* Появление вылетом */
(function () {
  var items = document.querySelectorAll('.rev');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  /* rootMargin снизу здесь стоял (-8%) — чтобы блок появлялся не в момент
     касания нижнего края, а чуть позже. Снят 04.08.2026: он срезал у зоны
     наблюдения 8% высоты ОКНА, и всё, что лежит к концу документа ближе
     этого среза, в зону не попадало никогда. На высоком мониторе (окно
     1267 px → срез 101 px) кнопка «Написать» в подвале, до конца страницы
     от которой 91 px, не появлялась вообще — Саша поймал 04.08. На ноутбуке
     баг не воспроизводится: срез меньше, и кнопка успевает войти в зону.
     Задержку теперь держит один threshold: блок показывается, войдя на 12%
     своей высоты. */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .12 });
  items.forEach(function (el) { io.observe(el); });
  /* Страховка от того же класса поломок: докрутили до самого низа — всё,
     что ещё не показалось, показываем. Наблюдатель мог не сработать не
     только из-за среза. */
  addEventListener('scroll', function () {
    if (innerHeight + scrollY < document.documentElement.scrollHeight - 4) return;
    document.querySelectorAll('.rev:not(.in)').forEach(function (el) { el.classList.add('in'); });
  }, { passive: true });
})();

/* Плашка приплывает, когда первый экран уехал */
(function () {
  var bar = document.getElementById('bar'), hero = document.getElementById('top');
  if (!bar || !hero) return;
  var io = new IntersectionObserver(function (entries) {
    bar.classList.toggle('show', !entries[0].isIntersecting);
  }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });
  io.observe(hero);
})();
