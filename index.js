const express = require('express');
const cors = require('cors'); 
const ineRoutes = require('./rutas/ine');


const app = express();
const port = 3000;
app.use(cors());
// Middleware para parsear JSON
app.use(express.json());

// Usar las rutas
app.use('/api/ine', ineRoutes);


// Definir tus rutas aquí, por ejemplo:
app.get('/', (req, res) => {
  res.send('Hola Mundo!');
});

app.listen(port, () => {
  console.log(`Servidor ejecutandose en puerto ${port}`);
});
