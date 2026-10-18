const CONVOCATORIA_SEMANAL = {
  jornada: 'partido amistoso', //1er Partido del torneo, Primer partido eliminatorio, Primer partido de la liguilla
  competicion: ' ', //'' es por defecto; ' ' no pone texto; Otros ejemplos: 'Primera División Prebenjamín Sala', 'Trofeo Ciudad de Don Benito'...
  rival: 'CD Inicia "A"',
  esLocal: false, // true = Local | false = Visitante
  
  fecha: '23 ó 24 de octubre de 2026', //Viernes, 23 de octubre de 2026
  fechaISO: '2026-10-23', // 2026-10-23 //AAAA-MM-DD (Necesario para el calendario)
  estadoFecha: 'provisional', // 'provisional' o 'confirmada' cuando sea oficial
  
  horaPartido: '16:00', //16:00
  minutosAntelacion: 20,
  notasCitacion: '',
  
  lugarKey: 'jaulaVva', // pabellonDonBenito, pistaAzulDonBenito, pistaVerdeDonBenito, jaulaVva, pabellonMiajadas, pabellonValdivia, pabellonSantaAmalia
  equipacionSeleccionada: 1
};