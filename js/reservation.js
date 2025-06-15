// js/reservation.js

document.addEventListener("DOMContentLoaded", () => {
  // Попередження, якщо відкрито через file://
  if (window.location.protocol === "file:") {
    console.warn(
      "Для коректної роботи запитів запускайте сайт через HTTP-сервер " +
      "(наприклад, python -m http.server)."
    );
  }

  // 1. Визначення груп столів: maxGuests → масив їхніх ID
  const tableGroups = [
    { maxGuests: 2, tables: [1, 2, 3] },
    { maxGuests: 4, tables: [4, 5, 6] },
    { maxGuests: 6, tables: [7, 8, 9] },
    { maxGuests: 8, tables: [10, 11] },
    { maxGuests: Infinity, tables: [12] }
  ];

  // 2. Вибір випадкового столу з групи
  function pickRandomTable(guestsCount) {
    const group = tableGroups.find(g => guestsCount <= g.maxGuests);
    if (!group) return null;
    const list = group.tables;
    return list[Math.floor(Math.random() * list.length)];
  }

  const form       = document.getElementById("reservation-form");
  const tableInput = document.getElementById("reservation-table-id");

  form.addEventListener("submit", async e => {
    e.preventDefault();

    // 3. Збір полів (guestsStr – рядок)
    const name        = form.name.value.trim();
    const phone       = form.phone.value.trim();
    const date        = form.reservation_date.value;
    const time        = form.reservation_time.value;
    const guestsStr   = form.reservation_guests.value;   // рядок, напр. "4"
    const guestsCount = parseInt(guestsStr, 10);        // для алгоритму вибору
    const message     = form.message.value.trim();

    // 4. Валідація
    if (!name || !phone || !date || !time || !guestsStr || isNaN(guestsCount)) {
      return alert("Будь ласка, заповніть всі обов'язкові поля коректно.");
    }

    // 5. Вибір столу
    const tableIdNum = pickRandomTable(guestsCount);
    if (!tableIdNum) {
      return alert("Немає вільного столу для цієї кількості гостей.");
    }
    const tableIdStr = String(tableIdNum);               // перетворюємо на рядок
    tableInput.value = tableIdStr;                       // заповнюємо прихований інпут

    // 6. Підготовка даних для відправки (усі поля – рядки)
    const formData = {
      name,
      phone,
      reservation_date: date,
      reservation_time: time,
      reservation_guests: guestsStr,
      table_id: tableIdStr,
      message
    };

    // 7. URL вашої Lambda Function
    const apiUrl = "https://veii5a3nu7ywmveqyav3zytgwu0fbvrn.lambda-url.eu-north-1.on.aws";

    console.log("▶️ Відправка на:", apiUrl, formData);

    // 8. POST-запит з підтримкою CORS
    try {
      const response = await fetch(apiUrl, {
        method:  "POST",
        mode:    "cors",
        cache:   "no-cache",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData)
      });

      // 9. Перевірка відповіді
      if (!response.ok) {
        const errText = await response.text();
        console.error("❌ Lambda відповіла:", response.status, errText);
        throw new Error(`HTTP ${response.status}`);
      }

      // 10. Підтвердження користувачеві
      alert(`Бронювання успішно! Ваш стіл №${tableIdStr}.`);
      form.reset();
    } catch (err) {
      console.error("🔥 Помилка при відправці:", err);
      alert(
        `Не вдалося надіслати форму: ${err.message}. ` +
        `Перевірте CORS-настройки та доступність API.`
      );
    }
  });
});
