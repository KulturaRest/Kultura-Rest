// js/reservation.js

document.addEventListener("DOMContentLoaded", () => {
  // Попередження, якщо відкрито через file://
  if (window.location.protocol === "file:") {
    console.warn(
      "Для коректної роботи запитів запускайте сайт через HTTP-сервер (наприклад, python -m http.server)."
    );
  }

  // 1. Групи столів: maxGuests → масив ID
  const tableGroups = [
    { maxGuests: 2, tables: [1, 2, 3] },
    { maxGuests: 4, tables: [4, 5, 6] },
    { maxGuests: 6, tables: [7, 8, 9] },
    { maxGuests: 8, tables: [10, 11] },
    { maxGuests: Infinity, tables: [12] }
  ];

  // 2. Випадковий вибір столу
  function pickRandomTable(guestsCount) {
    const grp = tableGroups.find(g => guestsCount <= g.maxGuests);
    return grp ? grp.tables[Math.floor(Math.random()*grp.tables.length)] : null;
  }

  const form       = document.getElementById("reservation-form"),
        tableInput = document.getElementById("reservation-table-id");

  form.addEventListener("submit", async e => {
    e.preventDefault();

    // 3. Збір даних (guestsStr — рядок)
    const name       = form.name.value.trim(),
          phone      = form.phone.value.trim(),
          date       = form.reservation_date.value,
          time       = form.reservation_time.value,
          guestsStr  = form.reservation_guests.value,
          guestsNum  = parseInt(guestsStr,10),
          message    = form.message.value.trim();

    // 4. Валідація
    if(!name||!phone||!date||!time||!guestsStr||isNaN(guestsNum)){
      return alert("Будь ласка, заповніть всі обов’язкові поля правильно.");
    }

    // 5. Призначаємо стіл
    const tableIdNum = pickRandomTable(guestsNum);
    if(!tableIdNum){
      return alert("Немає вільних столів для цієї кількості гостей.");
    }
    const tableIdStr = String(tableIdNum);
    tableInput.value = tableIdStr;

    // 6. Формуємо payload (усі поля — рядки)
    const formData = {
      name,
      phone,
      reservation_date: date,
      reservation_time: time,
      reservation_guests: guestsStr,
      table_id: tableIdStr,
      message
    };

    // 7. Додаємо /booking до кінця URL
    const apiUrl = "https://veii5a3nu7ywmveqyav3zytgwu0fbvrn.lambda-url.eu-north-1.on.aws/booking";

    console.log("▶️ Відправка POST на:", apiUrl, formData);

    // 8. POST-запит із CORS
    try {
      const resp = await fetch(apiUrl, {
        method:  "POST",
        mode:    "cors",
        cache:   "no-cache",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify(formData)
      });
      if(!resp.ok){
        const text = await resp.text();
        console.error("❌ Lambda відповіла не-OK:",resp.status,text);
        throw new Error(`HTTP ${resp.status}`);
      }
      alert(`Бронювання успішно підтверджено! Стіл №${tableIdStr}.`);
      form.reset();
    } catch(err){
      console.error("🔥 Помилка при відправці:",err);
      alert(
        `Не вдалося відправити форму: ${err.message}. `+
        `Перевірте CORS-настройки Lambda або статус Function URL.`
      );
    }
  });
});
