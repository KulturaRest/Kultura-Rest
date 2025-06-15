// js/reservation.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Визначення груп столів: максимальна кількість гостей → масив доступних table_id
  const tableGroups = [
    { maxGuests: 2, tables: [1, 2, 3] },
    { maxGuests: 4, tables: [4, 5, 6] },
    { maxGuests: 6, tables: [7, 8, 9] },
    { maxGuests: 8, tables: [10, 11] },
    { maxGuests: Infinity, tables: [12] }
  ];

  // 2. Функція для випадкового вибору столу з відповідної групи
  function pickRandomTable(guests) {
    const group = tableGroups.find(g => guests <= g.maxGuests);
    if (!group) return null;
    const list = group.tables;
    return list[Math.floor(Math.random() * list.length)];
  }

  const form = document.getElementById("reservation-form");
  const tableInput = document.getElementById("reservation-table-id");

  // 3. Обробник відправки форми
  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    // 4. Зібрати дані з полів
    const name = document.getElementById("reservation-name").value.trim();
    const phone = document.getElementById("reservation-phone").value.trim();
    const date = document.getElementById("reservation-date").value;
    const time = document.getElementById("reservation-time").value;
    const guests = parseInt(document.getElementById("reservation-guests").value, 10);
    const message = document.getElementById("reservation-message").value.trim();

    // Валідація обов’язкових полів
    if (!name || !phone || !date || !time || isNaN(guests)) {
      alert("Будь ласка, заповніть усі обов'язкові поля.");
      return;
    }

    // 5. Випадковий вибір столу
    const tableId = pickRandomTable(guests);
    if (!tableId) {
      alert("Не вдалося призначити стіл для такої кількості гостей.");
      return;
    }
    tableInput.value = tableId; // заповнюємо прихований інпут

    // 6. Формуємо об'єкт для відправки
    const formData = {
      name,
      phone,
      reservation_date: date,
      reservation_time: time,
      reservation_guests: guests,
      table_id: tableId,
      message
    };

    // 7. Відправка POST-запиту на AWS API Gateway
    try {
      const response = await fetch(
        "https://veii5a3nu7ywmveqyav3zytgwu0fbvrn.lambda-url.eu-north-1.on.aws/booking",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );
      if (!response.ok) {
        throw new Error(`Статус ${response.status}`);
      }
      alert(`Бронювання успішно надіслано! Ваш стіл №${tableId}`);
      form.reset();
    } catch (error) {
      console.error("Помилка при відправці:", error);
      alert("Виникла помилка при надсиланні форми. Спробуйте пізніше.");
    }
  });
});
