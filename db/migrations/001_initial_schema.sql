CREATE TABLE governorates (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name_en varchar(100) NOT NULL UNIQUE,
  name_ar varchar(100)
);

CREATE TABLE cities (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name_en varchar(100) NOT NULL,
  governorate_id integer NOT NULL,
  name_ar varchar(100),
  CONSTRAINT fk_cities_governorate FOREIGN KEY (governorate_id) REFERENCES governorates(id),
  CONSTRAINT uq_city_name_governorate UNIQUE (governorate_id, name_en)
);

CREATE TABLE branch_classes (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(10) NOT NULL UNIQUE,
  CONSTRAINT chk_branch_class_name CHECK (name IN ('A', 'B', 'C', 'D'))
);

CREATE TABLE branches (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  branch_code varchar(50) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  city_id integer NOT NULL,
  class_id integer NOT NULL,
  status varchar(30) NOT NULL,
  CONSTRAINT fk_branches_city FOREIGN KEY (city_id) REFERENCES cities(id),
  CONSTRAINT fk_branches_class FOREIGN KEY (class_id) REFERENCES branch_classes(id),
  CONSTRAINT chk_branch_status CHECK (status IN ('ACTIVE', 'TEMPORARILY_CLOSED', 'PERMANENTLY_CLOSED'))
);

CREATE TABLE departments (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name_en varchar(100) NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  name_ar varchar(100)
);

CREATE TABLE services (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name_en varchar(100) NOT NULL,
  department_id integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  name_ar varchar(100),
  CONSTRAINT fk_services_department FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT uq_services_department_name UNIQUE (department_id, name_en)
);

CREATE TABLE branch_class_services (
  branch_class_id integer NOT NULL,
  service_id integer NOT NULL,
  CONSTRAINT pk_branch_class_services PRIMARY KEY (branch_class_id, service_id),
  CONSTRAINT fk_bcs_branch_class FOREIGN KEY (branch_class_id) REFERENCES branch_classes(id),
  CONSTRAINT fk_bcs_service FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE pos_devices (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  branch_id integer NOT NULL UNIQUE,
  device_serial varchar(100) NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT fk_pos_devices_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  national_id varchar(20) NOT NULL,
  phone varchar(20) NOT NULL,
  branch_id integer NOT NULL,
  department_id integer NOT NULL,
  service_id integer NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  queue_number integer NOT NULL,
  status varchar(20) NOT NULL,
  CONSTRAINT chk_booking_status CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'EXPIRED')),
  CONSTRAINT fk_bookings_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
  CONSTRAINT fk_bookings_department FOREIGN KEY (department_id) REFERENCES departments(id),
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE system_settings (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  opening_time time NOT NULL,
  closing_time time NOT NULL,
  slot_interval integer NOT NULL DEFAULT 15,
  CONSTRAINT system_settings_check CHECK (opening_time < closing_time),
  CONSTRAINT system_settings_slot_interval_minutes_check CHECK (slot_interval > 0)
);
