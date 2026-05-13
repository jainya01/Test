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

router.post(
  "/adminlogin",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const [rows] = await pool.execute(
      "SELECT id, email, password, role FROM admin WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const admin = rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (admin.role !== "admin") {
      const error = new Error("You are not allowed to login as admin");
      error.statusCode = 403;
      throw error;
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "9h" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: admin.role,
      id: admin.id,
      email: admin.email,
    });
  }),
);

router.post(
  "/adminpost",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    const [existingAdmin] = await pool.execute(
      "SELECT id FROM admin WHERE email = ?",
      [email],
    );

    if (existingAdmin.length > 0) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword],
    );

    return res.status(201).json({
      success: true,
      message: "Admin added successfully",
      insertedId: result.insertId,
    });
  }),
);

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

router.delete(
  "/admindelete/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const SQL = "DELETE FROM admin WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.affectedRows <= 0) {
      const error = new Error("Data delete failed or not found");
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
  "/adminupdate/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const SQL = password
      ? "UPDATE admin SET email = ?, password = ? WHERE id = ?"
      : "UPDATE admin SET email = ? WHERE id = ?";

    const params = password ? [email, hashedPassword, id] : [email, id];

    const [result] = await pool.execute(SQL, params);

    if (result.affectedRows === 0) {
      const error = new Error("Admin not found or not updated");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      result,
    });
  }),
);

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
      ORDER BY customers.id DESC
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

router.post(
  "/callerlogin",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }

    const [rows] = await pool.execute(
      "SELECT id, email, password, role FROM caller WHERE email = ?",
      [email],
    );

    if (rows.length === 0) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const caller = rows[0];

    const isMatch = await bcrypt.compare(password, caller.password);

    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (caller.role !== "caller") {
      const error = new Error("You are not allowed to login");
      error.statusCode = 403;
      throw error;
    }

    const token = jwt.sign(
      {
        id: caller.id,
        email: caller.email,
        role: caller.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      role: caller.role,
      id: caller.id,
      email: caller.email,
    });
  }),
);

router.post(
  "/callerspost",
  authenticate,
  asyncHandler(async (req, res) => {
    const { fullname, email, password, status, notes } = req.body;

    if (!fullname || !email || !password || !status) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    const [existing] = await pool.execute(
      "SELECT id FROM caller WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO caller (fullname, email, password, status, notes) VALUES (?, ?, ?, ?, ?)",
      [fullname, email, hashedPassword, status, notes],
    );

    return res.status(201).json({
      success: true,
      message: "Caller created successfully",
      callerId: result.insertId,
    });
  }),
);

router.put(
  "/callerupdate/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { fullname, email, status, password, notes } = req.body;

    if (!fullname || !email || !status) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    let query =
      "UPDATE caller SET fullname = ?, email = ?, status = ?, notes = ?";
    let values = [fullname, email, status, notes];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ", password = ?";
      values.push(hashedPassword);
    }

    query += " WHERE id = ?";
    values.push(id);

    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      const error = new Error("Caller not found or not updated");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Caller updated successfully",
      result,
    });
  }),
);

router.delete(
  "/callerdelete/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM caller WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      const error = new Error("Caller not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Caller deleted successfully",
    });
  }),
);

router.get(
  "/allcallers",
  authenticate,
  asyncHandler(async (req, res) => {
    const SQL =
      "SELECT id, fullname, email, role, status, notes FROM caller ORDER BY id DESC LIMIT 20";

    const [result] = await pool.execute(SQL);

    if (result.length === 0) {
      const error = new Error("Caller not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: result,
    });
  }),
);

router.get(
  "/somecallers/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const SQL =
      "SELECT id, fullname, email, role, status, notes FROM caller WHERE id = ?";

    const [result] = await pool.execute(SQL, [id]);

    if (result.length === 0) {
      const error = new Error("Caller not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: result[0],
    });
  }),
);

// services

router.post(
  "/servicespost",
  authenticate,
  asyncHandler(async (req, res) => {
    const { service_name, service_code, price, status, notes } = req.body;

    if (!service_name || !service_code || !price || !status) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    const [existing] = await pool.execute(
      "SELECT id FROM services WHERE service_code = ?",
      [service_code],
    );

    if (existing.length > 0) {
      const error = new Error("Service code already exists");
      error.statusCode = 409;
      throw error;
    }

    const [result] = await pool.execute(
      "INSERT INTO services (service_name, service_code, price, status, notes) VALUES (?, ?, ?, ?, ?)",
      [service_name, service_code, price, status, notes],
    );

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      serviceId: result.insertId,
    });
  }),
);

router.put(
  "/serviceupdate/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { service_name, service_code, price, status, notes } = req.body;

    if (!service_name || !service_code || !price || !status) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    const query = `
      UPDATE services
      SET service_name = ?, service_code = ?, price = ?, status = ?, notes = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [
      service_name,
      service_code,
      price,
      status,
      notes,
      id,
    ]);

    if (result.affectedRows === 0) {
      const error = new Error("Service not found or not updated");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      result,
    });
  }),
);

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
    const { name, phone, city, service, notes } = req.body;
    const SQL =
      "INSERT INTO customers(name, phone, city, service, notes) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.execute(SQL, [
      name,
      phone,
      city,
      service,
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
    const { name, phone, city, service, notes } = req.body;

    const SQL =
      "UPDATE customers SET name = ?, phone = ?, city = ?, service = ?, notes = ? WHERE id = ?";

    const [result] = await pool.execute(SQL, [
      name,
      phone,
      city,
      service,
      notes,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found or not updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data updated successfully",
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
