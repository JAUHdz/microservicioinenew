const express = require('express');
const router = express.Router();
const db = require('../conexion/db');

router.post('/crear', async (req, res) => {
  const {
    nombre,
    apellido_paterno,
    apellido_materno,
    curp,
    fecha_nacimiento,
    sexo,
    calle,
    numero,
    colonia,
    municipio,
    estado,
    cp,
    clave_elector
  } = req.body;

  try {
    // Paso 1: Insertar en persona
    const personaQuery = `
      INSERT INTO persona (nombre, apellido_paterno, apellido_materno, curp, fecha_nacimiento, sexo)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [personaResult] = await db.promise().query(personaQuery, [
      nombre, apellido_paterno, apellido_materno, curp, fecha_nacimiento, sexo
    ]);
    const personaId = personaResult.insertId;

    // Paso 2: Insertar en direccion
    const direccionQuery = `
      INSERT INTO direccion (persona_id, calle, numero, colonia, municipio, estado, cp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.promise().query(direccionQuery, [
      personaId, calle, numero, colonia, municipio, estado, cp
    ]);

    // Paso 3: Insertar en ine
    const ineQuery = `
      INSERT INTO ine (persona_id, clave_elector)
      VALUES (?, ?)
    `;
    await db.promise().query(ineQuery, [
      personaId, clave_elector
    ]);

    res.status(201).json({ message: 'Persona creada con éxito', persona_id: personaId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al insertar datos' });
  }
});

//obtener todos
router.get('/consulta', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id AS persona_id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.curp,
        p.fecha_nacimiento,
        p.sexo,
        d.calle,
        d.numero,
        d.colonia,
        d.municipio,
        d.estado,
        d.cp,
        i.clave_elector
      FROM persona p
      LEFT JOIN direccion d ON p.id = d.persona_id
      LEFT JOIN ine i ON p.id = i.persona_id
    `;

    const [results] = await db.promise().query(query);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener personas:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

//consulta curp
// Consultar persona por CURP
router.get('/consulta/curp/:curp', async (req, res) => {
  const { curp } = req.params;

  try {
    const query = `
      SELECT 
        p.id AS persona_id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.curp,
        p.fecha_nacimiento,
        p.sexo,
        d.calle,
        d.numero,
        d.colonia,
        d.municipio,
        d.estado,
        d.cp,
        i.clave_elector
      FROM persona p
      LEFT JOIN direccion d ON p.id = d.persona_id
      LEFT JOIN ine i ON p.id = i.persona_id
      WHERE p.curp = ?;
    `;

    const [results] = await db.promise().query(query, [curp]);

    if (results.length > 0) {
      res.status(200).json(results[0]); // Retorna la primera (y única) persona que coincida
    } else {
      res.status(404).json({ error: 'Persona no encontrada con ese CURP' });
    }
  } catch (error) {
    console.error('Error al obtener persona por CURP:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

//consulta id
// Consultar persona por ID
router.get('/consulta/id/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        p.id AS persona_id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        p.curp,
        p.fecha_nacimiento,
        p.sexo,
        d.calle,
        d.numero,
        d.colonia,
        d.municipio,
        d.estado,
        d.cp,
        i.clave_elector
      FROM persona p
      LEFT JOIN direccion d ON p.id = d.persona_id
      LEFT JOIN ine i ON p.id = i.persona_id
      WHERE p.id = ?;
    `;

    const [results] = await db.promise().query(query, [id]);

    if (results.length > 0) {
      res.status(200).json(results[0]); // Retorna la persona encontrada
    } else {
      res.status(404).json({ error: 'Persona no encontrada con ese ID' });
    }
  } catch (error) {
    console.error('Error al obtener persona por ID:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

//eliminar por curp
// Eliminar persona por CURP
router.delete('/eliminar/curp/:curp', async (req, res) => {
  const { curp } = req.params;

  try {
    // Inicia la transacción
    await db.promise().query('START TRANSACTION');

    // Primero eliminamos los datos de la tabla 'ine'
    const ineDeleteQuery = 'DELETE FROM ine WHERE persona_id = (SELECT id FROM persona WHERE curp = ?)';
    await db.promise().query(ineDeleteQuery, [curp]);

    // Luego eliminamos los datos de la tabla 'direccion'
    const direccionDeleteQuery = 'DELETE FROM direccion WHERE persona_id = (SELECT id FROM persona WHERE curp = ?)';
    await db.promise().query(direccionDeleteQuery, [curp]);

    // Finalmente eliminamos la persona de la tabla 'persona'
    const personaDeleteQuery = 'DELETE FROM persona WHERE curp = ?';
    await db.promise().query(personaDeleteQuery, [curp]);

    // Si todo salió bien, confirmamos la transacción
    await db.promise().query('COMMIT');

    res.status(200).json({ message: `Persona con CURP ${curp} eliminada con éxito` });
  } catch (error) {
    // Si algo salió mal, hacemos un rollback
    await db.promise().query('ROLLBACK');
    console.error('Error al eliminar persona:', error);
    res.status(500).json({ error: 'Error al eliminar los datos' });
  }
});


  module.exports = router;
  