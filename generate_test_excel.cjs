const XLSX = require('xlsx');
const path = require('path');

const docentes = [
    { Tipo: 'Docente', Nombre: 'Juan Carlos', Apellidos: 'Pérez García', Cargo: 'Tutor', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Docente', Nombre: 'Ana María', Apellidos: 'García López', Cargo: 'Auxiliar', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Docente', Nombre: 'Carlos José', Apellidos: 'Ruiz Martínez', Cargo: 'Música', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Docente', Nombre: 'María Elva', Apellidos: 'López Sánchez', Cargo: 'Inglés', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Docente', Nombre: 'Luis Miguel', Apellidos: 'Moreno Torres', Cargo: 'Educación Física', Curso: 'Clase 3 Infantil' }
];

const alumnos = [
    { Tipo: 'Alumno', Nombre: 'Mario', Apellidos: 'Abad González', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Lucía', Apellidos: 'Beltrán Ruiz', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'David', Apellidos: 'Castro Jiménez', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Elena', Apellidos: 'Díaz Morales', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Pablo', Apellidos: 'Esteban Ortega', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Sara', Apellidos: 'Flores Vargas', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Jorge', Apellidos: 'Galán Herrera', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Irene', Apellidos: 'Hervás Navarro', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Alberto', Apellidos: 'Jiménez Domínguez', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Marta', Apellidos: 'León Serrano', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Raúl', Apellidos: 'Muñoz Blanco', Cargo: '', Curso: 'Clase 3 Infantil' },
    { Tipo: 'Alumno', Nombre: 'Silvia', Apellidos: 'Navarro Ibáñez', Cargo: '', Curso: 'Clase 3 Infantil' }
];

const data = [...docentes, ...alumnos];
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Listado Orlas');

const filePath = path.join(__dirname, 'Listado_Prueba_Orlas.xlsx');
XLSX.writeFile(wb, filePath);

console.log('Excel actualizado con distinción de Tipo en:', filePath);
