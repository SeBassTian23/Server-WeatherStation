CREATE TABLE "data" (
    "ID"	INTEGER UNIQUE,
    "device_id"	NUMERIC DEFAULT NULL,
    "created_at"	NUMERIC DEFAULT NULL,
    "Battery [V]"	NUMERIC DEFAULT NULL,
    "Temperature [C]"	NUMERIC DEFAULT NULL,
    "rel. Humidity [%]"	NUMERIC DEFAULT NULL,
    "Pressure [hPa]"	NUMERIC DEFAULT NULL,
    "Pressure (PMSL) [hPa]"	NUMERIC DEFAULT NULL,
    "Air [KOhms]"	NUMERIC DEFAULT NULL,
    "Light (visible)"	NUMERIC DEFAULT NULL,
    "Light (IR)"	NUMERIC DEFAULT NULL,
    "Light (UV)"	NUMERIC DEFAULT NULL,
    "UV-Index"	NUMERIC DEFAULT NULL,
    "PM1.0 [micro g/m3]"	NUMERIC DEFAULT NULL,
    "PM2.5 [micro g/m3]"	NUMERIC DEFAULT NULL,
    "PM10.0 [micro g/m3]"	NUMERIC DEFAULT NULL,
    "> 0.3um / 0.1L"	NUMERIC DEFAULT NULL,
    "> 0.5um / 0.1L"	NUMERIC DEFAULT NULL,
    "> 1.0um / 0.1L"	NUMERIC DEFAULT NULL,
    "> 2.5um / 0.1L"	NUMERIC DEFAULT NULL,
    "> 5.0um / 0.1L"	NUMERIC DEFAULT NULL,
    "> 10.0um / 0.1L"	NUMERIC DEFAULT NULL,
    "Heat Index [C]"	NUMERIC DEFAULT NULL,
    "Dew Point [C]"	NUMERIC DEFAULT NULL,   
    "AQI"	NUMERIC DEFAULT NULL,
    PRIMARY KEY("ID" AUTOINCREMENT)
);
CREATE INDEX "data_idx" ON "data" (
    "created_at"	ASC
);
CREATE INDEX "device_id_idx" ON "data" (
    "device_id"	ASC
);
CREATE INDEX "list_idx" ON "data" (
    "device_id"	DESC,
    "created_at"	DESC
);