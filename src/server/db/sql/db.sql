BEGIN TRANSACTION;
DROP TABLE IF EXISTS "data";
CREATE TABLE IF NOT EXISTS "data" (
	"ID"	INTEGER UNIQUE,
	"device_id"	TEXT,
	"created_at"	TEXT,
	"Battery [V]"	NUMERIC,
	"Temperature [C]"	NUMERIC,
	"rel. Humidity [%]"	NUMERIC,
	"Pressure [hPa]"	NUMERIC,
	"Pressure (PMSL) [hPa]"	NUMERIC,
	"Air [KOhms]"	NUMERIC,
	"Light (visible)"	NUMERIC,
	"Light (IR)"	NUMERIC,
	"Light (UV)"	NUMERIC,
	"UV-Index"	NUMERIC,
	"PM1.0 [ug/m3]"	NUMERIC,
	"PM2.5 [ug/m3]"	NUMERIC,
	"PM10.0 [ug/m3]"	NUMERIC,
	">0.3 [um/0.1L]"	NUMERIC,
	">0.5 [um/0.1L]"	NUMERIC,
	">1.0 [um/0.1L]"	NUMERIC,
	">2.5 [um/0.1L]"	NUMERIC,
	">5.0 [um/0.1L]"	NUMERIC,
	">10.0 [um/0.1L]"	NUMERIC,
	"Heat Index [C]"	NUMERIC,
	"Dew Point [C]"	NUMERIC,
	"AQI"	NUMERIC,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "devices";
CREATE TABLE IF NOT EXISTS "devices" (
	"ID"	INTEGER UNIQUE,
	"device_id"	TEXT NOT NULL,
	"description"	TEXT,
	"latitude"	REAL NOT NULL CHECK("latitude" >= -90 AND "latitude" <= 90),
	"longitude"	REAL NOT NULL CHECK("longitude" >= -180 AND "longitude" <= 180),
	"altitude"	REAL,
	"timezone"	TEXT NOT NULL,
	"active"	INTEGER NOT NULL DEFAULT 1 CHECK("active" IN (0, 1)),
	"default"	INTEGER NOT NULL DEFAULT 0 CHECK("active" IN (0, 1)),
	"created_at"	TEXT NOT NULL,
	"updated_at"	TEXT NOT NULL,
	PRIMARY KEY("ID" AUTOINCREMENT)
);
DROP INDEX IF EXISTS "data_idx";
CREATE INDEX IF NOT EXISTS "data_idx" ON "data" (
	"created_at"	ASC
);
DROP INDEX IF EXISTS "data_device_id_idx";
CREATE INDEX IF NOT EXISTS "data_device_id_idx" ON "data" (
	"device_id"	ASC
);
DROP INDEX IF EXISTS "data_list_devices_idx";
CREATE INDEX IF NOT EXISTS "data_list_devices_idx" ON "data" (
	"device_id"	DESC,
	"created_at"	DESC
);
DROP INDEX IF EXISTS "devices_id_idx";
CREATE INDEX IF NOT EXISTS "devices_id_idx" ON "devices" (
	"device_id"	ASC
);
DROP INDEX IF EXISTS "devices_list_idx";
CREATE INDEX IF NOT EXISTS "devices_list_idx" ON "devices" (
	"device_id"	ASC,
	"created_at"	ASC
);
DROP INDEX IF EXISTS "devices_default_idx";
CREATE INDEX IF NOT EXISTS "devices_default_idx" ON "devices" (
	"default"	ASC
);
COMMIT;
DROP TRIGGER "main"."data_submit";
CREATE TRIGGER data_submit
BEFORE INSERT ON data
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'Data was submitted by a device that is not registered.')
    WHERE NOT EXISTS (SELECT 1
                  FROM devices
                  WHERE device_id = NEW.device_id);
END;