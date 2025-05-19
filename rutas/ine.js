const express = require('express');
const router = express.Router();
const db = require('../conexion/db');

router.post('/crear', (req, res) => {
    const { id, nombre, apellido_paterno, apellido_materno, curp, clave_elector, domicilio, fecha_nacimiento, sexo } = req.body;
    const query = 'INSERT INTO ine (id, nombre, apellido_paterno, apellido_materno, curp, clave_elector, domicilio, fecha_nacimiento, sexo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [id, nombre, apellido_paterno, apellido_materno, curp, clave_elector, domicilio, fecha_nacimiento, sexo], (err, results) => {
      if (err) {
        res.status(500).json({ error: err });
        return;
      }
      res.status(201).json({ id: results.insertId });
    });
  });

  module.exports = router;
  