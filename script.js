document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "ja",

    eventClick: function (info) {
      info.jsEvent.preventDefault();

      document.getElementById("popup-title").textContent = info.event.title;
      document.getElementById("popup-memo").textContent = info.event.extendedProps.memo || "（メモなし）";

      const linkEl = document.getElementById("popup-link");
      if (info.event.url) {
        linkEl.href = info.event.url;
        linkEl.style.display = "inline-block";
      } else {
        linkEl.style.display = "none";
      }

      document.getElementById("popup").style.display = "block";
    },

    eventDidMount: function (info) {
      info.el.addEventListener("contextmenu", function (e) {
        e.preventDefault();
        const confirmDelete = confirm(`「${info.event.title}」を削除しますか？`);
        if (confirmDelete) {
          info.event.remove();
          const updatedEvents = savedEvents.filter(e =>
            !(e.title === info.event.title && e.start === info.event.startStr)
          );
          saveEvents(updatedEvents);
          savedEvents.length = 0;
          updatedEvents.forEach(e => savedEvents.push(e));
        }
      });
    }
  });

  // localStorage処理
  function saveEvents(events) {
    localStorage.setItem("recipeEvents", JSON.stringify(events));
  }

  function loadEvents() {
    const saved = localStorage.getItem("recipeEvents");
    return saved ? JSON.parse(saved) : [];
  }

  const savedEvents = loadEvents();
  savedEvents.forEach(event => {
    calendar.addEvent(event);
  });

  calendar.render();

  // 登録フォーム
  document.getElementById("recipe-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const url = document.getElementById("url").value;
    const memo = document.getElementById("memo").value;
    const date = document.getElementById("date").value;

    const eventData = {
      title: title,
      start: date,
      url: url,
      memo: memo,
      allDay: true
    };

    calendar.addEvent(eventData);
    savedEvents.push(eventData);
    saveEvents(savedEvents);

    this.reset();
  });

  // ポップアップを閉じる処理
  document.getElementById("popup-close").addEventListener("click", function () {
    document.getElementById("popup").style.display = "none";
  });
});
