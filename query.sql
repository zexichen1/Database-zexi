CREATE TABLE Appointments (
    AppointmentID INTEGER PRIMARY KEY,
    CarID INTEGER,
    ShopID INTEGER,
    AppointmentDate DATE NOT NULL,
    ServiceRequired VARCHAR(255),
    FOREIGN KEY (CarID) REFERENCES Cars(CarID),
    FOREIGN KEY (ShopID) REFERENCES Shops(ShopID)
)

CREATE TABLE CarOwners (
    OwnerID INTEGER PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    ContactInfo VARCHAR(255)
)

CREATE TABLE Car_Maintenance (
    PackageID INTEGER,
    CarID INTEGER,
    FOREIGN KEY (PackageID) REFERENCES MaintenancePackages(PackageID),
    FOREIGN KEY (CarID) REFERENCES Cars(CarID),
    PRIMARY KEY (PackageID, CarID)
)

CREATE TABLE Cars (
    CarID INTEGER PRIMARY KEY,
    OwnerID INTEGER,
    Model VARCHAR(255) NOT NULL,
    Year INTEGER,
    LastMaintenanceDate DATE,
    FOREIGN KEY (OwnerID) REFERENCES CarOwners(OwnerID)
)

CREATE TABLE MaintenancePackages (
    PackageID INTEGER PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Details TEXT
)

CREATE TABLE Shops (
    ShopID INTEGER PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Address VARCHAR(255) NOT NULL
)

SELECT Cars.model, CarOwners.name AS owner_name, MaintenancePackages.name AS package_name 
FROM Cars 
JOIN CarOwners ON Cars.ownerID = CarOwners.ownerID 
JOIN Car_Maintenance ON Cars.carID = Car_Maintenance.carID 
JOIN MaintenancePackages ON Car_Maintenance.packageID = MaintenancePackages.packageID;

SELECT model, year 
FROM Cars 
WHERE carID = (SELECT carID FROM Appointments ORDER BY appointmentDate DESC LIMIT 1);

SELECT model, COUNT(*) as count 
FROM Cars 
GROUP BY model 
HAVING count > 5;

SELECT model, year, lastMaintenanceDate 
FROM Cars 
WHERE (year <= 2019) AND (lastMaintenanceDate > '2022-01-01');

SELECT model, year,
CASE 
   WHEN year > 2020 THEN 'New Car'
   ELSE 'Old Car'
END AS car_type 
FROM Cars;
