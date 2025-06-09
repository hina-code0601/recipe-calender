document.addEventListener("DOMContentLoaded", function () {
  // 🌟 URLパラメータからリンクを自動入力
  const params = new URLSearchParams(window.location.search);
  const autoUrl = params.get("url");
  if (autoUrl) {
    document.getElementById("url").value = autoUrl;
  }

  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "ja",

    // イベントをクリックしたときの処理（メモ＋リンクをポップアップ）
    eventClick: function (info) {
      info.jsEvent.preventDefault();
      const event = info.event;
      const note = event.extendedProps.note || "（メモはありません）";
      const url = event.url || "#";

      const content = `
        <strong>${event.title}</strong><br>
        <p>${note}</p>
        <a href="${url}" target="_blank">▶ YouTubeを見る</a>
      `;

      // ポップアップ表示（alert風）
      const popup = document.createElement("div");
      popup.innerHTML = content;
      popup.style.position = "fixed";
      popup.style.top = "30%";
      popup.style.left = "10%";
      popup.style.right = "10%";
      popup.style.padding = "20px";
      popup.style.background = "#fff";
      popup.style.border = "1px solid #ccc";
      popup.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
      popup.style.zIndex = 9999;
      popup.style.borderRadius = "10px";

      const closeBtn = document.createElement("button");
      closeBtn.innerText = "閉じる";
      closeBtn.style.marginTop = "10px";
      closeBtn.onclick = () => popup.remove();

      popup.appendChild(closeBtn);
      document.body.appendChild(popup);
    },

    // 右クリックで削除
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

  // 保存・読み込み
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

  // 登録フォームの処理
  document.getElementById("recipe-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const url = document.getElementById("url").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value;

    const newEvent = {
      title: title,
      start: date,
      url: url,
      note: note,
      allDay: true
    };

    calendar.addEvent(newEvent);
    savedEvents.push(newEvent);
    saveEvents(savedEvents);

    this.reset();
  });

  // 🌟 Service Worker 登録（PWA）
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").then(function () {
      console.log("Service Worker registered!");
    });
  }
});
