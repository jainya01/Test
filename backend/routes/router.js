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
import redisClient from "../config/redisClient.js";

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
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const admin = rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      const error = new Error("Invalid credentials");
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
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    const caller = rows[0];

    const isMatch = await bcrypt.compare(password, caller.password);

    if (!isMatch) {
      const error = new Error("Invalid credentials");
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

    await redisClient.del("crm1:admindata:all");

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
    const cacheKey = "crm1:admindata:all";
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL = "SELECT id, name, email, role FROM admin LIMIT 50";
    const [result] = await pool.execute(SQL);

    if (!result || result.length === 0) {
      const error = new Error("No admin data found");
      error.statusCode = 404;
      throw error;
    }

    const response = {
      success: true,
      message: "Data fetched successfully",
      count: result.length,
      result,
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
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

    await redisClient.del("crm1:admindata:all");

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

    await redisClient.del("crm1:admindata:all");

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
    const cacheKey = "crm1:allcustomers:all";
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL = `
      SELECT 
        customers.id,
        customers.name,
        customers.phone,
        customers.service,
        customers.status,
        customers.customer_type,
        customers.current_status,
        customers.caller_id,
        customers.created_at,
        customers.updated_at,
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

    const response = {
      success: true,
      message: "data fetched successfully",
      count: result.length,
      result,
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
  }),
);

router.get(
  "/allcustomersdata",
  authenticate,
  asyncHandler(async (req, res) => {
    const cacheKey = `crm1:bulkcustomers:all`;
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL = "SELECT name, phone, service, status FROM  customers";
    const [result] = await pool.execute(SQL);

    if (result.length <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    const response = {
      success: true,
      message: "data fetched successfully",
      count: result.length,
      result,
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
  }),
);

// callers

router.post(
  "/callerspost",
  authenticate,
  upload.fields([
    { name: "high_school_certificate", maxCount: 1 },
    { name: "intermediate_certificate", maxCount: 1 },
    { name: "graduation_certificate", maxCount: 1 },
    { name: "postgraduate_certificate", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
    { name: "aadhaar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "passport_size_photo", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const {
      fullname,
      phone,
      alternate_phone,
      email,
      password,
      status,
      notes,
      aadhaar_number,
      pan_number,
      passport_number,
    } = req.body;

    if (!fullname || !phone || !email || !password || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM caller WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const high_school_certificate =
      req.files?.high_school_certificate?.[0]?.filename || null;

    const intermediate_certificate =
      req.files?.intermediate_certificate?.[0]?.filename || null;

    const graduation_certificate =
      req.files?.graduation_certificate?.[0]?.filename || null;

    const postgraduate_certificate =
      req.files?.postgraduate_certificate?.[0]?.filename || null;

    const resume = req.files?.resume?.[0]?.filename || null;
    const bank_passbook = req.files?.bank_passbook?.[0]?.filename || null;

    const aadhaar_card = req.files?.aadhaar_card?.[0]?.filename || null;

    const pan_card = req.files?.pan_card?.[0]?.filename || null;

    const passport = req.files?.passport?.[0]?.filename || null;

    const passport_size_photo =
      req.files?.passport_size_photo?.[0]?.filename || null;

    const [result] = await pool.execute(
      `INSERT INTO caller (
        fullname,
        phone,
        alternate_phone,
        email,
        password,
        status,
        notes,
        aadhaar_number,
        pan_number,
        passport_number,
        high_school_certificate,
        intermediate_certificate,
        graduation_certificate,
        postgraduate_certificate,
        resume,
        bank_passbook,
        aadhaar_card,
        pan_card,
        passport,
        passport_size_photo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullname,
        phone,
        alternate_phone || null,
        email,
        hashedPassword,
        status,
        notes || null,
        aadhaar_number || null,
        pan_number || null,
        passport_number || null,
        high_school_certificate,
        intermediate_certificate,
        graduation_certificate,
        postgraduate_certificate,
        resume,
        bank_passbook,
        aadhaar_card,
        pan_card,
        passport,
        passport_size_photo,
      ],
    );

    await redisClient.del("crm1:allcallers:all");

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
  upload.fields([
    { name: "high_school_certificate", maxCount: 1 },
    { name: "intermediate_certificate", maxCount: 1 },
    { name: "graduation_certificate", maxCount: 1 },
    { name: "postgraduate_certificate", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
    { name: "aadhaar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "passport", maxCount: 1 },
    { name: "passport_size_photo", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
      fullname,
      phone,
      alternate_phone,
      email,
      status,
      password,
      notes,
      aadhaar_number,
      pan_number,
      passport_number,
    } = req.body;

    if (!fullname || !phone || !email || !status) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    let query = `
      UPDATE caller SET
      fullname = ?,
      phone = ?,
      alternate_phone = ?,
      email = ?,
      status = ?,
      notes = ?,
      aadhaar_number = ?,
      pan_number = ?,
      passport_number = ?
    `;

    let values = [
      fullname,
      phone,
      alternate_phone || null,
      email,
      status,
      notes || null,
      aadhaar_number || null,
      pan_number || null,
      passport_number || null,
    ];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = ?`;
      values.push(hashedPassword);
    }

    const files = req.files || {};

    if (files.high_school_certificate) {
      query += `, high_school_certificate = ?`;
      values.push(files.high_school_certificate[0].filename);
    }

    if (files.intermediate_certificate) {
      query += `, intermediate_certificate = ?`;
      values.push(files.intermediate_certificate[0].filename);
    }

    if (files.graduation_certificate) {
      query += `, graduation_certificate = ?`;
      values.push(files.graduation_certificate[0].filename);
    }

    if (files.postgraduate_certificate) {
      query += `, postgraduate_certificate = ?`;
      values.push(files.postgraduate_certificate[0].filename);
    }

    if (files.resume) {
      query += `, resume = ?`;
      values.push(files.resume[0].filename);
    }

    if (files.bank_passbook) {
      query += `, bank_passbook = ?`;
      values.push(files.bank_passbook[0].filename);
    }

    if (files.aadhaar_card) {
      query += `, aadhaar_card = ?`;
      values.push(files.aadhaar_card[0].filename);
    }

    if (files.pan_card) {
      query += `, pan_card = ?`;
      values.push(files.pan_card[0].filename);
    }

    if (files.passport) {
      query += `, passport = ?`;
      values.push(files.passport[0].filename);
    }

    if (files.passport_size_photo) {
      query += `, passport_size_photo = ?`;
      values.push(files.passport_size_photo[0].filename);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Caller not found",
      });
    }

    await redisClient.del(`crm1:somecallers:${id}`);
    await redisClient.del("crm1:allcallers:all");

    return res.status(200).json({
      success: true,
      message: "Caller updated successfully",
    });
  }),
);

router.delete(
  "/callerdelete/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const callerId = Number(req.params.id);

    const [caller] = await pool.execute(
      `SELECT
        high_school_certificate,
        intermediate_certificate,
        graduation_certificate,
        postgraduate_certificate,
        resume,
        aadhaar_card,
        pan_card,
        passport,
        passport_size_photo
      FROM caller
      WHERE id = ?`,
      [callerId],
    );

    if (caller.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Caller not found",
      });
    }

    const documents = caller[0];

    const documentFields = [
      "high_school_certificate",
      "intermediate_certificate",
      "graduation_certificate",
      "postgraduate_certificate",
      "resume",
      "aadhaar_card",
      "pan_card",
      "passport",
      "passport_size_photo",
    ];

    for (const field of documentFields) {
      const fileName = documents[field];
      if (!fileName) continue;

      const filePath = path.join(process.cwd(), "./uploads", fileName);

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else {
          console.log(`File not found: ${filePath}`);
        }
      } catch (err) {
        console.error(`Failed to delete ${fileName}`, err);
      }
    }

    await pool.execute(
      `UPDATE customers
       SET caller_id = NULL
       WHERE caller_id = ?`,
      [callerId],
    );

    const [result] = await pool.execute("DELETE FROM caller WHERE id = ?", [
      callerId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Caller not found",
      });
    }

    await redisClient.del(`crm1:somecallers:${callerId}`);
    await redisClient.del("crm1:allcallers:all");

    return res.status(200).json({
      success: true,
      message: "Caller deleted successfully",
    });
  }),
);

router.get(
  "/allcallers",
  asyncHandler(async (req, res) => {
    const cacheKey = `crm1:allcallers:all`;
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL =
      "SELECT id, fullname, phone, alternate_phone, email, role, status, notes FROM caller ORDER BY id DESC LIMIT 20";

    const [result] = await pool.execute(SQL);

    if (result.length === 0) {
      const error = new Error("Caller not found");
      error.statusCode = 404;
      throw error;
    }

    const response = {
      success: true,
      message: "Data fetched successfully",
      count: result.length,
      data: result,
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
  }),
);

router.get(
  "/somecallers/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = `crm1:somecallers:${id}`;
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL =
      "SELECT id, fullname, phone, alternate_phone, email, role, status, notes, aadhaar_number, pan_number, passport_number FROM caller WHERE id = ?";

    const [result] = await pool.execute(SQL, [id]);

    if (result.length === 0) {
      const error = new Error("Caller not found");
      error.statusCode = 404;
      throw error;
    }

    const response = {
      success: true,
      message: "Data fetched successfully",
      data: result[0],
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
  }),
);

// status

router.get(
  "/allstatusdata",
  authenticate,
  asyncHandler(async (req, res) => {
    const cacheKey = `crm1:allstatusdata:all`;
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL =
      "SELECT id, status_name, status, notes FROM status ORDER BY id DESC LIMIT 20";
    const [result] = await pool.execute(SQL);

    if (result.affectedRows <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    const response = {
      success: true,
      message: "data fetched successfully",
      count: result.length,
      result,
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
  }),
);

router.post(
  "/statuspost",
  authenticate,
  asyncHandler(async (req, res) => {
    const { status_name, status, notes } = req.body;

    if (!status_name || !status) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    const [result] = await pool.execute(
      "INSERT INTO status (status_name, status, notes) VALUES (?, ?, ?)",
      [status_name, status, notes],
    );

    await redisClient.del("crm1:allstatusdata:all");

    return res.status(201).json({
      success: true,
      message: "Status created successfully",
      serviceId: result.insertId,
    });
  }),
);

router.put(
  "/statusupdate/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status_name, status, notes } = req.body;

    if (!status_name || !status) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    const query = `
      UPDATE status
      SET status_name = ?, status = ?, notes = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [
      status_name,
      status,
      notes,
      id,
    ]);

    if (result.affectedRows === 0) {
      const error = new Error("Service not found or not updated");
      error.statusCode = 404;
      throw error;
    }

    await redisClient.del(`crm1:somestatus:${id}`);
    await redisClient.del("crm1:allstatusdata:all");

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      result,
    });
  }),
);

router.delete(
  "/statusdelete/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const SQL = "DELETE FROM status WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.affectedRows <= 0) {
      const error = new Error("Status not deleted");
      error.statusCode = 404;
      throw error;
    }

    await redisClient.del(`crm1:somestatus:${id}`);
    await redisClient.del("crm1:allstatusdata:all");

    return res.status(200).json({
      success: true,
      message: "data deleted successfully",
      result,
    });
  }),
);

router.get(
  "/somestatus/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = `crm1:somestatus:${id}`;
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL =
      "SELECT id, status_name, status, notes FROM status WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.affectedRows <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    const response = {
      success: true,
      message: "data fetched successfully",
      result,
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
  }),
);

// services

router.post(
  "/servicespost",
  authenticate,
  asyncHandler(async (req, res) => {
    const { service_name, sub_category, status, notes } = req.body;

    if (!service_name || !sub_category || !status) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    const [result] = await pool.execute(
      "INSERT INTO services (service_name, sub_category, status, notes) VALUES (?, ?, ?, ?)",
      [service_name, sub_category, status, notes],
    );

    await redisClient.del("crm1:allservicesdata:all");

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      serviceId: result.insertId,
    });
  }),
);

router.put(
  "/servicesupdate/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { service_name, sub_category, status, notes } = req.body;

    if (!service_name || !sub_category || !status) {
      const error = new Error("All fields are required");
      error.statusCode = 400;
      throw error;
    }

    const query = `
      UPDATE services
      SET service_name = ?, sub_category = ?, status = ?, notes = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [
      service_name,
      sub_category,
      status,
      notes,
      id,
    ]);

    if (result.affectedRows === 0) {
      const error = new Error("Service not found or not updated");
      error.statusCode = 404;
      throw error;
    }

    await redisClient.del(`crm1:someservices:${id}`);
    await redisClient.del("crm1:allservicesdata:all");

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      result,
    });
  }),
);

router.delete(
  "/servicedelete/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const SQL = "DELETE FROM services WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.affectedRows <= 0) {
      const error = new Error("Service not deleted");
      error.statusCode = 404;
      throw error;
    }

    await redisClient.del(`crm1:someservices:${id}`);
    await redisClient.del("crm1:allservicesdata:all");

    return res.status(200).json({
      success: true,
      message: "data deleted successfully",
      result,
    });
  }),
);

router.get(
  "/allservicesdata",
  authenticate,
  asyncHandler(async (req, res) => {
    const cacheKey = `crm1:allservicesdata:all`;
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL =
      "SELECT id, service_name, sub_category, status, notes FROM services ORDER BY id DESC LIMIT 20";
    const [result] = await pool.execute(SQL);

    if (result.affectedRows <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    const response = {
      success: true,
      message: "data fetched successfully",
      count: result.length,
      result,
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
  }),
);

router.get(
  "/someservices/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cacheKey = `crm1:someservices:${id}`;
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL =
      "SELECT id, service_name, sub_category, status, notes FROM services WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.affectedRows <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    const response = {
      success: true,
      message: "data fetched successfully",
      result,
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
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

      await redisClient.del("crm1:allcustomers:all");
      await redisClient.del("crm1:bulkcustomers:all");

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
    const {
      name,
      phone,
      alternate_phone,
      customer_type,
      customer_status,
      status,
      service,
      address,
      notes,
    } = req.body;

    const SQL =
      "INSERT INTO customers(name, phone, alternate_phone, customer_type, customer_status, status, service, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const [result] = await pool.execute(SQL, [
      name,
      phone,
      alternate_phone,
      customer_type,
      customer_status,
      status,
      service,
      address,
      notes,
    ]);

    if (result.affectedRows <= 0) {
      const error = new Error("data not posted");
      error.statusCode = 404;
      throw error;
    }

    await redisClient.del("crm1:allcustomers:all");

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

    await redisClient.del(`crm1:somecustomers:${id}`);
    await redisClient.del("crm1:allcustomers:all");

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
    const {
      name,
      phone,
      alternate_phone,
      customer_type,
      customer_status,
      service,
      address,
      notes,
    } = req.body;

    const SQL =
      "UPDATE customers SET name = ?, phone = ?, alternate_phone = ?, customer_type = ?, customer_status = ?, service = ?, address = ?, notes = ? WHERE id = ?";

    const [result] = await pool.execute(SQL, [
      name,
      phone,
      alternate_phone,
      customer_type,
      customer_status,
      service,
      address,
      notes,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found or not updated",
      });
    }

    await redisClient.del(`crm1:somecustomers:${id}`);
    await redisClient.del("crm1:allcustomers:all");

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
    const cacheKey = `crm1:somecustomers:${id}`;
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL =
      "SELECT id, name, phone, alternate_phone, customer_type, customer_status, service, address, notes FROM customers WHERE id = ?";
    const [result] = await pool.execute(SQL, [id]);

    if (result.length <= 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    const response = {
      success: true,
      message: "data fetch successfully",
      result,
    };

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
  }),
);

router.post("/assign-custom-leads", authenticate, assignCustomerLeads);

router.post(
  "/caller-lead-post",
  authenticate,
  asyncHandler(async (req, res) => {
    const {
      customer_id,
      caller_id,
      name,
      call_status,
      call_duration,
      customer_type,
      customer_status,
      status,
      service,
      sub_category,
      district,
      state,
      notes,
    } = req.body;

    if (!customer_id || !caller_id || !call_status) {
      return res.status(400).json({
        success: false,
        message:
          "Please select one of the following options: Answered, Rejected, or Unanswered.",
      });
    }

    const customerId = Number(customer_id);
    const callerId = Number(caller_id);

    await pool.execute(
      `INSERT INTO call_logs (
        customer_id,
        caller_id,
        call_status,
        call_duration,
        status,
        service,
        sub_category,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        callerId,
        call_status || null,
        call_duration || 0,
        status || null,
        service || null,
        sub_category || null,
        notes || null,
      ],
    );

    await pool.execute(
      `UPDATE customers
      SET
          name = COALESCE(NULLIF(?, ''), name),
          customer_status = COALESCE(NULLIF(?, ''), customer_status),
          district = COALESCE(NULLIF(?, ''), district),
          state = COALESCE(NULLIF(?, ''), state),
          status = ?,
          notes = ?,
          customer_type = ?,
          current_status = 'Completed'
      WHERE id = ?
      AND caller_id = ?`,
      [
        name ?? null,
        customer_status ?? null,
        district ?? null,
        state ?? null,
        status ?? null,
        notes ?? null,
        customer_type ?? null,
        customerId,
        callerId,
      ],
    );

    await pool.execute(
      `UPDATE caller
        SET status = 'Active'
        WHERE id = ?
        AND status = 'Inactive'`,
      [callerId],
    );

    const [remainingLeads] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM customers
       WHERE caller_id=? AND status IS NULL`,
      [callerId],
    );

    if (remainingLeads[0].total <= 0) {
      const limitPerCaller = 100;

      const [newCustomers] = await pool.query(
        `SELECT id
        FROM customers
        WHERE caller_id IS NULL
        AND current_status = 'New'
        LIMIT ?`,
        [limitPerCaller],
      );

      const ids = newCustomers.map((c) => c.id);

      if (ids.length > 0) {
        await pool.query(
          `UPDATE customers
            SET caller_id = ?, assigned_at = NOW()
            WHERE id IN (?)`,
          [callerId, ids],
        );
      }
    }

    await redisClient.del("crm1:allcallers:all");
    await redisClient.del("crm1:allcustomers:all");

    return res.status(201).json({
      success: true,
      message: "Lead updated successfully",
    });
  }),
);

router.get(
  "/allcalllogs",
  asyncHandler(async (req, res) => {
    const SQL = `
    SELECT 
      c.id AS customer_id,
      c.status AS customer_status,
      c.caller_id AS caller_id,
      c.current_status,
      c.service,
      c.notes,
      c.assigned_at,

      cl.id AS call_log_id,
      cl.customer_id AS call_log_customer_id,
      cl.caller_id AS call_log_caller_id,
      cl.call_status,
      cl.call_duration,
      cl.status AS call_log_status,
      cl.created_at

      FROM customers c
      LEFT JOIN call_logs cl
        ON cl.customer_id = c.id
      WHERE c.assigned_at IS NOT NULL
      ORDER BY c.id DESC
  `;

    const [result] = await pool.execute(SQL);

    if (!result || result.length === 0) {
      const error = new Error("data not found");
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "data fetched successfully",
      count: result.length,
      result,
    });
  }),
);

router.post(
  "/download-completed-customers",
  authenticate,
  asyncHandler(async (req, res) => {
    const { selectedService, selectedStatus } = req.body;
    let query = `
      SELECT 
        name,
        phone,
        service,
        status,
        current_status
      FROM customers
      WHERE current_status = 'Completed'
    `;

    const values = [];

    if (selectedService) {
      query += ` AND service = ?`;
      values.push(selectedService);
    }

    if (selectedStatus) {
      query += ` AND status = ?`;
      values.push(selectedStatus);
    }

    const [rows] = await pool.execute(query, values);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Customers");
    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Service", key: "service", width: 25 },
      { header: "Status", key: "status", width: 20 },
      { header: "Current Status", key: "current_status", width: 25 },
    ];

    worksheet.addRows(rows);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Customers.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  }),
);

// states and district

router.get(
  "/allindiadata",
  authenticate,
  asyncHandler(async (req, res) => {
    const cacheKey = `crm1:allindiadata:all`;
    const cache = await redisClient.get(cacheKey);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    const SQL = `SELECT s.id AS state_id, s.name AS state_name, d.id AS district_id, d.name AS district_name FROM states AS s INNER JOIN districts AS d ON d.state_id = s.id ORDER BY s.name, d.name`;
    const [result] = await pool.execute(SQL);

    const response = {
      success: true,
      message: "data fetched successfully",
      count: result.length,
      result,
    };

    if (result.length === 0) {
      const error = new Error("data loaded failed");
      error.statusCode = 404;
      throw error;
    }

    await redisClient.set(cacheKey, JSON.stringify(response));
    return res.status(200).json(response);
  }),
);

export default router;
