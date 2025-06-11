document.getElementById("reservation-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = {
    name: document.getElementById("reservation-name").value,
    phone: document.getElementById("reservation-phone").value,
    reservation_date: document.getElementById("reservation-date").value,
    reservation_time: document.getElementById("reservation-time").value,
    reservation_guests: document.getElementById("reservation-guests").value,
    message: document.getElementById("reservation-message").value
  };

  fetch("https://9ka7vobns7.execute-api.eu-north-1.amazonaws.com/api/booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (!response.ok) throw new Error("Помилка при відправці");
    return response.json();
  })
  .then(data => {
    alert("Резервація успішно надіслана!");
    document.getElementById("reservation-form").reset();
  })
  .catch(error => {
    alert("Виникла помилка: " + error.message);
  });
});
