const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

async function connect() {
  return open({
    filename: "./db/Vehicle_database.sqlite3", 
    driver: sqlite3.Database,
  });
}

async function getCarMaintenanceRecords() {
  const db = await connect();
  try {
    const records = await db.all(`SELECT

    Car_Maintenance.PackageID,
    Car_Maintenance.CarID,
    Cars.Model,
    Cars.Year,
    MaintenancePackages.Name AS PackageName,
    MaintenancePackages.Details,
    Cars.LastMaintenanceDate,
    Appointments.AppointmentID 
  FROM 
    Car_Maintenance
  JOIN 
    Cars ON Car_Maintenance.CarID = Cars.CarID
  JOIN 
    MaintenancePackages ON Car_Maintenance.PackageID = MaintenancePackages.PackageID
  LEFT JOIN 
    Appointments ON Car_Maintenance.CarID = Appointments.CarID
  ORDER BY 
    Car_Maintenance.CarID DESC
  LIMIT 20;
  
    `);

    console.log("dbConnector got data", records.length);

    return records;
  } finally {
    await db.close();
  }
}

async function getCars() {
  const db = await connect();
  try {
    const records = await db.all(`SELECT
    Cars.CarID,
    Cars.OwnerID,
    Cars.Model,
    Cars.Year
  FROM 
    Cars;
    `);

    console.log("dbConnector got data", records.length);

    return records;
  } finally {
    await db.close();
  }
}

async function getCar(CarID) {
  const db = await connect();
  try {
    const Car = await db.get(`SELECT
    Cars.CarID,
    Cars.OwnerID,
    Cars.Model,
    Cars.Year
  FROM 
    Cars
  WHERE 
    CarID = :CarID;
 
  `, CarID);
    return Car;
  } finally {
    await db.close();
  }
}





async function getAppointment(appointmentID) {
  const db = await connect();
  try {
    const appointment = await db.get(`SELECT 
    AppointmentID, 
    CarID, 
    ShopID, 
    AppointmentDate, 
    ServiceRequired
  FROM 
    Appointments
  WHERE 
    AppointmentID = :appointmentID;
  `, appointmentID);
    return appointment;
  } finally {
    await db.close();
  }
}

async function createAppointment(appointmentData) {
  const db = await connect();
  try {
    const result = await db.run(`INSERT INTO Appointments (CarID, ShopID, AppointmentDate, ServiceRequired) VALUES (?, ?, ?, ?)`, 
      appointmentData.CarID, appointmentData.ShopID, appointmentData.AppointmentDate, appointmentData.ServiceRequired);

    return result.lastID;
  } finally {
    await db.close();
  }
}

async function updateAppointment(appointmentID, appointmentData) {
  const db = await connect();
  try {
    const stmt = await db.prepare(`UPDATE Appointments 
    SET
      CarID = :CarID,
      ShopID = :ShopID, 
      AppointmentDate  = :AppointmentDate , 
      ServiceRequired = :ServiceRequired
    WHERE 
      AppointmentID = :AppointmentID    
  `);

    stmt.bind({
      ":CarID": appointmentData.CarID,
      ":ShopID": appointmentData.ShopID,
      ":AppointmentDate": appointmentData.AppointmentDate,
      ":ServiceRequired": appointmentData.ServiceRequired,
      ":AppointmentID": appointmentID,
    });

    const result = await stmt.run();

    await stmt.finalize();

    return result;
  } finally {
    await db.close();
  }
}


async function updateCar(carID, carData) {
  const db = await connect();
  let stmt;
  try {
    stmt = await db.prepare(`UPDATE Cars 
      SET 
        OwnerID = :OwnerID, 
        Year = :Year, 
        Model = :Model
      WHERE CarID = :CarID`);

    await stmt.bind({
      ":Model": carData.Model,
      ":OwnerID": carData.OwnerID, 
      ":Year": carData.Year,
      ":CarID": carID,
    });

    const result = await stmt.run();
    return result;
  } catch (error) {
    console.error('Error during updateCar:', error);
    throw error;
  } finally {
    if (stmt) {
      await stmt.finalize();
    }
    await db.close();
  }
}



async function deleteAppointment(appointmentID) {
  const db = await connect();
  try {
    const result = await db.run(`DELETE FROM Appointments WHERE AppointmentID = ?`, appointmentID);
    return result;
  } finally {
    await db.close();
  }
}

async function deletecar(carID) {
  const db = await connect();
  try {
    const result = await db.run(`DELETE FROM Cars WHERE CarID = ?`, carID);
    await db.run(`DELETE FROM Appointments WHERE CarID = ?`, carID);
    await db.run(`DELETE FROM Car_Maintenance WHERE CarID = ?`, carID);
    return result;
  } finally {
    await db.close();
  }
}

module.exports = {
  getCarMaintenanceRecords,
  getAppointment,
  createAppointment,
  updateAppointment,
  getCars,
  getCar,
  updateCar,
  deletecar,
  deleteAppointment
};

