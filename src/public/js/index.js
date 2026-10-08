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
const modifyButton = document.getElementById("modify-booking-btn");
const cancelButton = document.getElementById("cancel-booking-btn");
const downloadButton = document.getElementById("download-ticket-btn");
let currentBooking = null;

const displayBooking = (booking) => {
  currentBooking = booking;
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


// Ticket actions
const downloadTicketAsPDF = async () => {
  if (!currentBooking) return;
  const ticket = document.getElementById("ticket");
  if (!ticket) return;

  downloadButton.disabled = true;
  const hiddenElements = ticket.querySelectorAll(
    ".ticket-close, .ticket-main-actions, #download-ticket-btn",
  );

  try {
    hiddenElements.forEach((element) => { element.style.display = "none"; });
    await new Promise((resolve) => setTimeout(resolve, 100));
    const canvas = await html2canvas(ticket, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    const imageData = canvas.toDataURL("image/png", 1.0);
    const { jsPDF } = window.jspdf;
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "mm",
      format: [pdfWidth, pdfHeight],
    });
    pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    pdf.save("QSystem-Ticket-" + currentBooking.id + ".pdf");
  } catch (error) {
    console.error("Failed to download ticket:", error);
  } finally {
    hiddenElements.forEach((element) => { element.style.display = ""; });
    downloadButton.disabled = false;
  }
};

downloadButton.addEventListener("click", downloadTicketAsPDF);

cancelButton.addEventListener("click", async () => {
  if (!currentBooking) return;
  if (!window.confirm("Are you sure you want to cancel your booking?")) return;

  try {
    const response = await fetch("/api/bookings/" + currentBooking.id + "/cancel", {
      method: "PATCH",
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Failed to cancel booking:", result);
      return;
    }

    bookingModal.hide();
    sessionStorage.removeItem("nationalId");
    sessionStorage.removeItem("phone");
    sessionStorage.removeItem("bookingCreated");
    sessionStorage.removeItem("modifyBooking");
    window.location.href = "/";
  } catch (error) {
    console.error("Failed to cancel booking:", error);
  }
});

modifyButton.addEventListener("click", () => {
  if (!currentBooking) return;
  sessionStorage.setItem("modifyBooking", JSON.stringify(currentBooking));
  bookingModal.hide();
  window.location.href = "/booking";
});
