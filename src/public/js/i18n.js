// =========================
// Translations
// =========================

const translations = {
  en: {
    title: "QSystem",
    subtitle: "Online Booking",

    nationalId: "National ID",
    phone: "Phone Number",
    continue: "Continue",

    onlineBooking: "Online Booking",
    modify: "Modify",
    cancel: "Cancel",
    download: "Download",

    arrivalNote:
      "Please arrive at the branch no more than 10 minutes before your appointment.",

    department: "Department",
    service: "Service",
    governorate: "Governorate",
    city: "City",
    branch: "Branch",
    date: "Date",
    time: "Available Time",

    selectDepartment: "Select Department",
    selectService: "Select Service",
    selectGovernorate: "Select Governorate",
    selectCity: "Select City",
    selectBranch: "Select Branch",
    selectTime: "Select Time",

    booking: "Booking",
  },

  ar: {
    title: "QSystem",
    subtitle: "الحجز الإلكتروني",

    nationalId: "الرقم القومي",
    phone: "رقم الهاتف",
    continue: "متابعة",

    onlineBooking: "الحجز الإلكتروني",
    modify: "تعديل",
    cancel: "إلغاء",
    download: "تحميل",

    arrivalNote:
      "برجاء الحضور للفرع قبل الموعد المحدد بمدة لا تتجاوز 10 دقائق.",

    department: "القسم",
    service: "الخدمة",
    governorate: "المحافظة",
    city: "المدينة",
    branch: "الفرع",
    date: "التاريخ",
    time: "المواعيد المتاحة",

    selectDepartment: "اختر القسم",
    selectService: "اختر الخدمة",
    selectGovernorate: "اختر المحافظة",
    selectCity: "اختر المدينة",
    selectBranch: "اختر الفرع",
    selectTime: "اختر الموعد",

    booking: "حجز",
  },
};

// =========================
// Current Language
// =========================

let currentLanguage =
  localStorage.getItem("language") || "en";

// =========================
// Set Language
// =========================

const setLanguage = (language) => {
  const selectedLanguage =
    translations[language];

  currentLanguage = language;

  document.documentElement.lang =
    language;

  document.documentElement.dir =
    language === "ar"
      ? "rtl"
      : "ltr";

  document
    .querySelectorAll("[data-i18n]")
    .forEach((element) => {
      const key =
        element.dataset.i18n;

      if (
        key &&
        selectedLanguage[key]
      ) {
        element.textContent =
          selectedLanguage[key];
      }
    });

  localStorage.setItem(
    "language",
    language
  );
  document.dispatchEvent(
  new Event("languageChanged")
);
};

// =========================
// Language Buttons
// =========================

const languageEnButton =
  document.getElementById("language-en");

const languageArButton =
  document.getElementById("language-ar");

if (languageEnButton) {
  languageEnButton.addEventListener(
    "click",
    () => {
      setLanguage("en");
    }
  );
}

if (languageArButton) {
  languageArButton.addEventListener(
    "click",
    () => {
      setLanguage("ar");
    }
  );
}

// =========================
// Initialize Language
// =========================

setLanguage(currentLanguage);