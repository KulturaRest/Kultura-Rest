// js/reservation.js

document.addEventListener("DOMContentLoaded", () => {
  // Якщо відкрито через file:// — попередження
  if (window.location.protocol === "file:") {
    console.warn(
      "Для коректної роботи запитів необхідно запускати сайт через HTTP-сервер (наприклад, python -m http.server)."
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

    // 3. Збір даних
    const name = document.getElementById("reservation-name").value.trim();
    const phone = document.getElementById("reservation-phone").value.trim();
    const date = document.getElementById("reservation-date").value;
    const time = document.getElementById("reservation-time").value;
    const guests = parseInt(
      document.getElementById("reservation-guests").value,
      10
    );
    const message = document
      .getElementById("reservation-message")
      .value.trim();

    // 4. Просте віконне повідомлення про помилки валідації
    if (!name || !phone || !date || !time || isNaN(guests)) {
      alert("Будь ласка, заповніть усі обов'язкові поля.");
      return;
    }

    // 5. Автоматичний вибір столу
    const tableId = pickRandomTable(guests);
    if (!tableId) {
      alert("Немає вільного столу для такої кількості гостей.");
      return;
    }
    tableInput.value = tableId;

    // 6. Підготовка payload
    const formData = {
      name,
      phone,
      reservation_date: date,
      reservation_time: time,
      reservation_guests: guests,
      table_id: tableId,
      message
    };

    // 7. Логування перед відправкою
    const apiUrl =
      "https://veii5a3nu7ywmveqyav3zytgwu0fbvrn.lambda-url.eu-north-1.on.aws/booking";
    console.log("Відправляю запит на:", apiUrl, formData);

    // 8. POST-запит із налаштуваннями для CORS
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        mode: "cors",        // дозволити крос-доменні запити
        cache: "no-cache",   // без кешування
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      // 9. Обробка HTTP-статусу
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      // 10. Опціонально: розбір JSON-відповіді
      let resultText = "";
      try {
        const result = await response.json();
        console.log("Відповідь сервера:", result);
        resultText = result.message || "";
      } catch {
        // якщо не JSON — ігноруємо
      }

      alert(
        `Бронювання підтверджено! Стіл №${tableId}. ${resultText}`.trim()
      );
      form.reset();
    } catch (error) {
      console.error("Помилка при відправці:", error);
      alert(
        `Не вдалося надіслати дані. ${error.message ||
          "Перевірте з’єднання або CORS-настройки API."}`
      );
    }
  });
});
