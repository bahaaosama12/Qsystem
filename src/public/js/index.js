// DOM Elements
const form = document.getElementById("customer-form");
const lookupError = document.getElementById("lookup-error");
const bookingModalElement = document.getElementById("bookingModal");
const bookingModal = new bootstrap.Modal(bookingModalElement);
const ticketBranch = document.getElementById("ticket-branch");
const ticketQueue = document.getElementById("ticket-queue");
const ticketTime = document.getElementById("ticket-time");
const ticketPhone = document.getElementById("ticket-phone");
const ticketDepartment = document.getElementById("ticket-department");
const ticketService = document.getElementById("ticket-service");

const displayBooking = (booking) => {
  const appointmentDate = new Date(booking.appointment_date).toLocaleDateString(
    "en-GB",
    { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Africa/Cairo" },
  );
  const appointmentTime = new Date(
    "1970-01-01T" + booking.appointment_time,
  ).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Africa/Cairo",
  });
  ticketBranch.textContent = booking.branch_name;
  ticketQueue.textContent = booking.queue_code;
  ticketTime.textContent = appointmentDate + " " + appointmentTime;
  ticketPhone.textContent = booking.phone;
  ticketDepartment.textContent = currentLanguage === "ar"
    ? booking.department_name_ar
    : booking.department_name_en;
  ticketService.textContent = currentLanguage === "ar"
    ? booking.service_name_ar
    : booking.service_name_en;
};

// Get Active Booking
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nationalId = document.getElementById("nationalId").value;
  const phone = document.getElementById("phone").value;

  const response = await fetch("/api/bookings/active", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nationalId, phone }),
  });

  const result = await response.json();

  if (result.code === "BOOKING_IDENTITY_MISMATCH") {
    lookupError.textContent = "The National ID and phone do not match the same active booking. Please check both values and try again.";
    lookupError.classList.remove("d-none");
    return;
  }

  if (!result.data) {
    sessionStorage.setItem("nationalId", nationalId);
    sessionStorage.setItem("phone", phone);
    window.location.href = "/booking";
    return;
  }

  displayBooking(result.data);

  bookingModal.show();
});

const showCreatedBooking = async () => {
  if (sessionStorage.getItem("bookingCreated") !== "true") {
    return;
  }

  const nationalId = sessionStorage.getItem("nationalId");
  const phone = sessionStorage.getItem("phone");
  const response = await fetch("/api/bookings/active", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nationalId, phone }),
  });
  const result = await response.json();

  if (!response.ok || !result.data) {
    console.error("Failed to get created booking:", result);
    return;
  }

  displayBooking(result.data);
  sessionStorage.removeItem("bookingCreated");
  bookingModal.show();
};

showCreatedBooking();
