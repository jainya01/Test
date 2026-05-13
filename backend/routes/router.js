import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import ExcelJS from "exceljs";
import csvParser from "csv-parser";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import authenticate from "../middleware/auth.js";
import asyncHandler from "../config/asyncHandler.js";
import assignCustomerLeads from "../controllers/customerController.js";

dotenv.config();
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/adminlogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const [rows] = await pool.execute(
      "SELECT id, email, password, role FROM admin WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const admin = rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!["admin"].includes(admin.role)) {
      return res.status(403).json({
        message: "You do not have permission to login as admin.",
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "9h" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: admin.role,
      id: admin.id,
      email: admin.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/adminpost", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const checkSQL = "SELECT * FROM admin WHERE email = ?";
    const [existingAdmin] = await pool.execute(checkSQL, [email]);

    if (existingAdmin.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const SQL = "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)";
    const [result] = await pool.execute(SQL, [name, email, hashedPassword]);

    res.status(201).json({
      success: true,
      message: "Admin added successfully",
      insertedId: result.insertId,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get(
  "/alladmindata",
  authenticate,
  asyncHandler(async (req, res) => {
    const SQL =
      "SELECT id, name, email, role FROM admin ORDER BY id DESC LIMIT 50";

    const [result] = await pool.execute(SQL);

    if (!result || result.length === 0) {
      const error = new Error("No admin data found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      result,
    });
  }),
);

router.delete("/admindelete/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const SQL = "DELETE FROM admin WHERE id=?";
    const [result] = await pool.execute(SQL, [id]);
    return res
      .status(200)
      .json({ message: "data deleted successfully", result });
  } catch (error) {
    console.error("error", error);
  }
});

router.put("/adminupdate/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const SQL = password
      ? "UPDATE admin SET email = ?, password = ? WHERE id = ?"
      : "UPDATE admin SET email = ? WHERE id = ?";

    const params = password ? [email, hashedPassword, id] : [email, id];
    await pool.execute(SQL, params);

    res.json({ success: true, message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get(
  "/allcustomers",
  authenticate,
  asyncHandler(async (req, res) => {
    const SQL = `
      SELECT 
        customers.id,
        customers.name,
        customers.phone,
        customers.city,
        customers.service,
        customers.status,
        customers.caller_id,
        caller.fullname,
        customers.notes
      FROM customers
      LEFT JOIN caller
      ON customers.caller_id = caller.id
    `;

    const [result] = await pool.execute(SQL);

    if (result.length <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      result,
    });
  }),
);

router.post("/callerlogin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const [rows] = await pool.execute(
      "SELECT id, email, password, role FROM caller WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const caller = rows[0];

    const isMatch = await bcrypt.compare(password, caller.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!["caller"].includes(caller.role)) {
      return res.status(403).json({
        message: "You do not have permission to login as caller.",
      });
    }

    const token = jwt.sign(
      { id: caller.id, email: caller.email, role: caller.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      role: caller.role,
      id: caller.id,
      email: caller.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/callerspost", authenticate, async (req, res) => {
  try {
    const { fullname, email, password, status, notes } = req.body;
    if (!fullname || !email || !password || !status) {
      return res.status(400).json({ message: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO caller (fullname, email, password, status, notes) VALUES (?, ?, ?, ?, ?)",
      [fullname, email, hashedPassword, status, notes],
    );

    res.status(201).json({ message: "Caller created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/callerupdate/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, email, status, password, notes } = req.body;

    if (!fullname || !email || !status) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    let query =
      "UPDATE caller SET fullname = ?, email = ?, status = ?, notes=?";
    let values = [fullname, email, status, notes];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ", password = ?";
      values.push(hashedPassword);
    }

    query += " WHERE id = ?";
    values.push(id);

    await pool.execute(query, values);

    res.status(200).json({
      message: "Caller updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/callerdelete/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM caller WHERE id = ?", [id]);
    res.status(200).json({
      message: "Caller deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/allcallers", authenticate, async (req, res) => {
  try {
    const SQL =
      "SELECT id, fullname, email, role, status, notes FROM caller ORDER BY id DESC LIMIT 20";
    const [result] = await pool.execute(SQL);
    return res.status(200).json({
      message: "Data fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load data",
    });
  }
});

router.get("/somecallers/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const SQL =
      "SELECT id, fullname, email, role, status, notes FROM caller WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);
    return res.status(200).json({
      message: "Data fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load data",
    });
  }
});

// services

router.post("/servicespost", authenticate, async (req, res) => {
  try {
    const { service_name, service_code, price, status, notes } = req.body;
    if (!service_name || !service_code || !price || !status) {
      return res.status(400).json({ message: "All fields required" });
    }

    await pool.execute(
      "INSERT INTO services (service_name, service_code, price, status, notes) VALUES (?, ?, ?, ?, ?)",
      [service_name, service_code, price, status, notes],
    );

    res.status(201).json({ message: "Services created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/serviceupdate/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, service_code, price, status, notes } = req.body;

    const query = `
      UPDATE services
      SET service_name=?, service_code=?, price=?, status=?, notes=?
      WHERE id=?
    `;

    await pool.execute(query, [
      service_name,
      service_code,
      price,
      status,
      notes,
      id,
    ]);

    res.json({ message: "Service updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete(
  "/servicesdelete/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const SQL = "DELETE FROM services WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.affectedRows <= 0) {
      const error = new Error("service not deleted");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "data deleted successfully",
      result,
    });
  }),
);

router.get(
  "/allservices",
  authenticate,
  asyncHandler(async (req, res) => {
    const SQL =
      "SELECT id, service_name, service_code, price, status, notes FROM services ORDER BY id DESC LIMIT 20";
    const [result] = await pool.execute(SQL);

    if (result.affectedRows <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      result,
    });
  }),
);

router.get(
  "/someservices/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const SQL =
      "SELECT id, service_name, service_code, price, status, notes FROM services WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.affectedRows <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      result,
    });
  }),
);

// customers

router.post(
  "/upload-stock",
  authenticate,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded",
        });
      }

      const uploadsDir = path.resolve("uploads");
      fs.readdirSync(uploadsDir).forEach((file) => {
        const fileExt = path.extname(file).toLowerCase();
        if (file !== req.file.filename && [".xlsx", ".csv"].includes(fileExt)) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      });

      const filePath = path.join(uploadsDir, req.file.filename);
      const ext = path.extname(req.file.originalname).toLowerCase();
      let values = [];

      if (ext === ".xlsx") {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        workbook.worksheets[0].eachRow(
          { includeEmpty: false },
          (row, rowNumber) => {
            if (rowNumber === 1) return;
            const name = row.getCell(2).value;
            const phone = row.getCell(3).value;
            if (!name || !phone) return;
            values.push([
              String(name).trim(),
              String(phone).replace(/\D/g, "").trim(),
              row.getCell(4).value ? String(row.getCell(4).value).trim() : null,
              row.getCell(5).value ? String(row.getCell(5).value).trim() : null,
            ]);
          },
        );
      } else if (ext === ".csv") {
        const rows = await new Promise((resolve, reject) => {
          const data = [];

          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (row) => data.push(row))
            .on("end", () => resolve(data))
            .on("error", reject);
        });

        rows.forEach((row) => {
          const name = row.Name || row.name;
          const phone = row.Phone || row.phone;
          const city = row.City || row.city;
          const service = row.Source || row.service;

          if (!name || !phone) return;

          values.push([
            String(name).trim(),
            String(phone).replace(/\D/g, "").trim(),
            city ? String(city).trim() : null,
            service ? String(service).trim() : null,
          ]);
        });
      } else {
        return res.status(400).json({
          error: "Only .xlsx and .csv files are allowed",
        });
      }

      if (!values.length) {
        return res.status(400).json({
          error: "No valid rows found",
        });
      }

      await pool.query(
        `INSERT INTO customers (name, phone, city, service) VALUES ?`,
        [values],
      );

      return res.json({
        success: true,
        message: "Bulk upload successfully",
        rowsInserted: values.length,
        file: req.file.filename,
      });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      return res.status(500).json({
        error: "Upload failed",
        details: err.message,
      });
    }
  },
);

router.post(
  "/customerspost",
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, phone, city, service, status, notes } = req.body;
    const SQL =
      "INSERT INTO customers(name, phone, city, service, status, notes) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await pool.execute(SQL, [
      name,
      phone,
      city,
      service,
      status,
      notes,
    ]);

    if (result.affectedRows <= 0) {
      const error = new Error("data not posted");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "data post successfully",
      result,
    });
  }),
);

router.delete(
  "/customersdelete/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const SQL = "DELETE FROM customers WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.affectedRows <= 0) {
      const error = new Error("not not deleted");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "data deleted successfully",
      result,
    });
  }),
);

router.put(
  "/customersupdate/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, phone, city, service, status, notes } = req.body;
    const SQL =
      "UPDATE customers SET name = ?, phone = ?, city = ?, service = ?, status = ?, notes = ? WHERE id = ?";
    const [result] = await pool.execute(SQL, [
      name,
      phone,
      city,
      service,
      status,
      notes,
      id,
    ]);

    if (result.affectedRows <= 0) {
      const error = new Error("data not update");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "data update successfully",
      result,
    });
  }),
);

router.get(
  "/somecustomers/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const SQL =
      "SELECT id, name, phone, city, service, status, notes FROM customers WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.length <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "data fetch successfully",
      result,
    });
  }),
);

router.post("/assign-custom-leads", authenticate, assignCustomerLeads);

export default router;
