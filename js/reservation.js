// js/reservation.js

document.addEventListener("DOMContentLoaded", () => {
  // Якщо відкрито через file:// — попередження
  if (window.location.protocol === "file:") {
    console.warn(
      "Для коректної роботи запитів необхідно запускати сайт через HTTP-сервер " +
      "(наприклад, python -m http.server)."
    );
  }

  // 1. Групи столів: максимальна кількість гостей → масив доступних table_id
  const tableGroups = [
    { maxGuests: 2, tables: [1, 2, 3] },
    { maxGuests: 4, tables: [4, 5, 6] },
    { maxGuests: 6, tables: [7, 8, 9] },
    { maxGuests: 8, tables: [10, 11] },
    { maxGuests: Infinity, tables: [12] }
  ];

  // 2. Випадковий вибір столу з потрібної групи
  function pickRandomTable(guests) {
    const group = tableGroups.find(g => guests <= g.maxGuests);
    if (!group) return null;
    const { tables } = group;
    return tables[Math.floor(Math.random() * tables.length)];
  }

  const form = document.getElementById("reservation-form");
  const tableInput = document.getElementById("reservation-table-id");

  form.addEventListener("submit", async e => {
    e.preventDefault();

    // 3. Збір даних (зберігаємо кількість гостей як рядок для відправки)
    const name     = form.name.value.trim();
    const phone    = form.phone.value.trim();
    const date     = form.reservation_date.value;
    const time     = form.reservation_time.value;
    const guestsStr = form.reservation_guests.value;          // рядок, напр. "4"
    const message  = form.message.value.trim();

    // для алгоритму вибору столу потрібно числове значення
    const guestsNum = parseInt(guestsStr, 10);

    // 4. Валідація
    if (!name || !phone || !date || !time || !guestsStr || isNaN(guestsNum)) {
      alert("Будь ласка, заповніть усі обов’язкові поля правильно.");
      return;
    }

    // 5. Випадкове призначення столу
    const tableId = pickRandomTable(guestsNum);
    if (!tableId) {
      alert("Немає вільного столу для цієї кількості гостей.");
      return;
    }
    tableInput.value = tableId;

    // 6. Формуємо дані для відправки (reservation_guests як рядок)
    const formData = {
      name,
      phone,
      reservation_date: date,
      reservation_time: time,
      reservation_guests: guestsStr,   // тепер рядок
      table_id: tableId,
      message
    };

    // 7. Ваш Function URL
    const apiUrl =
      "https://veii5a3nu7ywmveqyav3zytgwu0fbvrn.lambda-url.eu-north-1.on.aws";

    console.log("Відправка POST на:", apiUrl, formData);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Lambda відповіла не-OK:", response.status, text);
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      // Успішне бронювання
      alert(`Бронювання підтверджено! Стіл №${tableId}.`);
      form.reset();
    } catch (err) {
      console.error("Помилка при відправці:", err);
      alert(
        `Не вдалося надіслати дані: ${err.message}. ` +
        `Перевірте CORS-настройки Lambda або статус Function URL.`
      );
    }
  });
});
