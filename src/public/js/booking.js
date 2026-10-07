// ============================================================
// DOM Elements
// ============================================================
const bookingForm = document.getElementById("booking-form");
const departmentSelect = document.getElementById("department");
const serviceSelect = document.getElementById("service");
const governorateSelect = document.getElementById("governorate");
const citySelect = document.getElementById("city");
const branchSelect = document.getElementById("branch");
const appointmentDate = document.getElementById("appointment-date");
const timeSection = document.getElementById("time-section");
const appointmentTime = document.getElementById("appointment-time");
const confirmBookingButton = document.getElementById("confirm-booking");

// ============================================================
// Constants
// ============================================================
const MAX_BOOKING_DAYS_AHEAD = 15;

const API = {
  departments: "/api/departments",
  governorates: "/api/governorates",
  services: (departmentId) => `/api/services?departmentId=${departmentId}`,
  cities: (governorateId) => `/api/cities?governorateId=${governorateId}`,
  branches: (cityId) => `/api/branches?cityId=${cityId}`,
  availability: (branchId, departmentId, date) =>
    `/api/availability?branchId=${branchId}&departmentId=${departmentId}&date=${date}`,
};

// ============================================================
// Formatting Helpers
// ============================================================
const getLocalizedName = (item) =>
  currentLanguage === "ar" ? item.name_ar : item.name_en;

const getBranchName = (branch) => branch.name;

const formatTime = (time) => {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString(currentLanguage === "ar" ? "ar-EG" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ============================================================
// Select Helpers
// ============================================================
const getDefaultOption = (key) => {
  const option = document.createElement("option");

  option.value = "";
  option.selected = true;
  option.disabled = true;
  option.textContent = translations[currentLanguage][key];

  return option;
};

const addOption = (select, value, text) => {
  const option = document.createElement("option");

  option.value = value;
  option.textContent = text;

  select.appendChild(option);
};

// Empties the select and leaves only its placeholder option
const setDefaultOption = (select, defaultKey) => {
  select.innerHTML = "";
  select.appendChild(getDefaultOption(defaultKey));
};

// Same as above, but also disables the select
const clearSelect = (select, defaultKey) => {
  setDefaultOption(select, defaultKey);
  select.disabled = true;
};

// ============================================================
// Reset Helpers
// Each one resets its own field + everything that comes after it
// ============================================================
const resetTime = () => {
  setDefaultOption(appointmentTime, "selectTime");
  appointmentTime.disabled = true;
  timeSection.classList.add("d-none");
  confirmBookingButton.disabled = true;
};

const resetDateAndTime = () => {
  appointmentDate.value = "";
  appointmentDate.disabled = true;
  resetTime();
};

const resetFromCity = () => {
  clearSelect(branchSelect, "selectBranch");
  resetDateAndTime();
};

const resetFromGovernorate = () => {
  clearSelect(citySelect, "selectCity");
  resetFromCity();
};

const resetFromService = () => {
  clearSelect(governorateSelect, "selectGovernorate");
  resetFromGovernorate();
};

const resetFromDepartment = () => {
  clearSelect(serviceSelect, "selectService");
  resetFromService();
};

// ============================================================
// API Helpers
// ============================================================

// Fetches a list from the API. Returns the array, or null if the data isn't an array.
const fetchList = async (name, url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${name}`);
  }

  const result = await response.json();

  if (!Array.isArray(result.data)) {
    console.error(`${name} data is not an array:`, result);
    return null;
  }

  return result.data;
};

// Fetches a list and fills a select with it. Returns true if it succeeded.
const populateSelect = async (select, name, url, getLabel) => {
  const items = await fetchList(name, url);

  if (!items) {
    return false;
  }

  items.forEach((item) => addOption(select, item.id, getLabel(item)));
  select.disabled = false;

  return true;
};

// Same as populateSelect, but logs the error instead of throwing it
const loadSelect = async (select, name, url, getLabel) => {
  try {
    await populateSelect(select, name, url, getLabel);
  } catch (error) {
    console.error(`Failed to load ${name}:`, error);
  }
};

const getDepartments = () =>
  loadSelect(
    departmentSelect,
    "departments",
    API.departments,
    getLocalizedName,
  );

const getServices = (departmentId) =>
  loadSelect(
    serviceSelect,
    "services",
    API.services(departmentId),
    getLocalizedName,
  );

const getGovernorates = () =>
  loadSelect(
    governorateSelect,
    "governorates",
    API.governorates,
    getLocalizedName,
  );

const getCities = (governorateId) =>
  loadSelect(citySelect, "cities", API.cities(governorateId), getLocalizedName);

const getBranches = (cityId) =>
  loadSelect(branchSelect, "branches", API.branches(cityId), getBranchName);

// ============================================================
// Date & Time
// ============================================================
const setDateRange = () => {
  const today = new Date();
  const maxDate = new Date();

  maxDate.setDate(maxDate.getDate() + MAX_BOOKING_DAYS_AHEAD);

  appointmentDate.min = formatDateForInput(today);
  appointmentDate.max = formatDateForInput(maxDate);
  appointmentDate.disabled = false;
};

// A slot can be a plain string ("09:00") or an object ({ appointment_time })
const getSlotTime = (slot) =>
  typeof slot === "string" ? slot : slot?.appointment_time;

const fillTimeOptions = (slots) => {
  slots.forEach((slot) => {
    const time = getSlotTime(slot);

    if (!time) {
      return;
    }

    addOption(appointmentTime, time, formatTime(time));
  });
};

const getAvailableTimes = async (date) => {
  try {
    setDefaultOption(appointmentTime, "selectTime");
    timeSection.classList.remove("d-none");
    appointmentTime.disabled = true;
    confirmBookingButton.disabled = true;

    const slots = await fetchList(
      "availability",
      API.availability(branchSelect.value, departmentSelect.value, date),
    );

    if (!slots || slots.length === 0) {
      return;
    }

    fillTimeOptions(slots);

    if (appointmentTime.options.length > 1) {
      appointmentTime.disabled = false;
    }
  } catch (error) {
    console.error("Failed to load available times:", error);
  }
};

// ============================================================
// Event Handlers
// ============================================================
appointmentTime.addEventListener("change", () => {
  confirmBookingButton.disabled = !appointmentTime.value;
});

// One handler per field, keyed by the element's id
const changeHandlers = {
  department: async () => {
    resetFromDepartment();
    await getServices(departmentSelect.value);
  },

  service: async () => {
    resetFromService();
    await getGovernorates();
  },

  governorate: async () => {
    resetFromGovernorate();
    await getCities(governorateSelect.value);
  },

  city: async () => {
    resetFromCity();
    await getBranches(citySelect.value);
  },

  branch: () => {
    resetDateAndTime();
    setDateRange();
  },

  "appointment-date": async () => {
    const selectedDate = appointmentDate.value;

    if (!selectedDate) {
      resetTime();
      return;
    }

    await getAvailableTimes(selectedDate);
  },
};

bookingForm.addEventListener("change", async (event) => {
  await changeHandlers[event.target.id]?.();
});

// ============================================================
// Language Change
// ============================================================
const refreshLanguageOptions = async () => {
  const saved = {
    department: departmentSelect.value,
    service: serviceSelect.value,
    governorate: governorateSelect.value,
    city: citySelect.value,
    branch: branchSelect.value,
    time: appointmentTime.value,
  };

  // Each level depends on the saved value of the level before it
  const levels = [
    {
      select: departmentSelect,
      defaultKey: "selectDepartment",
      name: "departments",
      getUrl: () => API.departments,
      getLabel: getLocalizedName,
      savedValue: saved.department,
    },
    {
      select: serviceSelect,
      defaultKey: "selectService",
      name: "services",
      getUrl: API.services,
      getLabel: getLocalizedName,
      savedValue: saved.service,
    },
    {
      select: governorateSelect,
      defaultKey: "selectGovernorate",
      name: "governorates",
      getUrl: () => API.governorates,
      getLabel: getLocalizedName,
      savedValue: saved.governorate,
    },
    {
      select: citySelect,
      defaultKey: "selectCity",
      name: "cities",
      getUrl: API.cities,
      getLabel: getLocalizedName,
      savedValue: saved.city,
    },
    {
      select: branchSelect,
      defaultKey: "selectBranch",
      name: "branches",
      getUrl: API.branches,
      getLabel: getBranchName,
      savedValue: saved.branch,
    },
  ];

  // Step 1: reset every select to its placeholder in the new language
  levels.forEach((level, index) => {
    setDefaultOption(level.select, level.defaultKey);

    if (index > 0) {
      level.select.disabled = !levels[index - 1].savedValue;
    }
  });

  // Step 2: reload the options level by level and restore the user's choice
  for (const [index, level] of levels.entries()) {
    const isFirstLevel = index === 0;
    const parentValue = levels[index - 1]?.savedValue;

    // A level is only loaded if the level before it had a selection
    if (!isFirstLevel && !parentValue) {
      continue;
    }

    const loaded = await populateSelect(
      level.select,
      level.name,
      level.getUrl(parentValue),
      level.getLabel,
    );

    if (!loaded) {
      // Without departments nothing else makes sense, so stop
      if (isFirstLevel) {
        return;
      }

      continue;
    }

    if (level.savedValue) {
      level.select.value = level.savedValue;
    }
  }

  // Step 3: time slots
  setDefaultOption(appointmentTime, "selectTime");

  if (appointmentDate.value && saved.branch && saved.department) {
    const slots = await fetchList(
      "availability",
      API.availability(saved.branch, saved.department, appointmentDate.value),
    );

    if (slots) {
      fillTimeOptions(slots);

      appointmentTime.disabled = appointmentTime.options.length <= 1;

      if (saved.time) {
        appointmentTime.value = saved.time;
      }
    }
  }
};

document.addEventListener("languageChanged", async () => {
  try {
    await refreshLanguageOptions();
  } catch (error) {
    console.error("Failed to refresh language:", error);
  }
});

// ============================================================
// Booking Submit
// ============================================================
const getBookingData = () => ({
  nationalId: sessionStorage.getItem("nationalId"),
  phone: sessionStorage.getItem("phone"),
  branchId: Number(branchSelect.value),
  departmentId: Number(departmentSelect.value),
  serviceId: Number(serviceSelect.value),
  appointmentDate: appointmentDate.value,
  appointmentTime: appointmentTime.value,
});

bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!appointmentTime.value) {
    return;
  }

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(getBookingData()),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Booking error:", result);
      return;
    }

    const booking = result.data;
    sessionStorage.setItem("nationalId", booking.national_id);
    sessionStorage.setItem("phone", booking.phone);
    sessionStorage.setItem("bookingCreated", "true");
    window.location.href = "/";
  } catch (error) {
    console.error("Booking failed:", error);
  }
});

// ============================================================
// Initialize
// ============================================================
resetFromDepartment();
getDepartments();
