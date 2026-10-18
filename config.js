const CONFIG = {
  // =========================================================================
  // 🎯 JORNADA ACTIVA: Cambia solo este número para cargar la semana deseada
  // =========================================================================
  jornadaActiva: 1,

  // Configuración del repositorio para escaneo automático de fotos
  githubUser: "saulentrenador",
  githubRepo: "prebenjamin-a",

  // Datos fijos del club y competición
  temporada: '2026/2027',
  competicion: 'Primera División Prebenjamín Sala',
  miEquipo: 'CD Don Benito Prebenjamín "A"',
  aguaTexto: 'Botella de agua personal',
  valoresTexto: 'En la grada: Valores, Respeto y Apoyo',

  // CATÁLOGO DE EQUIPACIONES
  equipaciones: {
    1: {
      nombre: '1ª Equipación (Oficial)',
      camiseta: 'Rojiblanca',
      pantalon: 'Azul',
      medias: 'Rojas',
      swatchCamiseta: 'repeating-linear-gradient(90deg, #ef4444, #ef4444 4px, #ffffff 4px, #ffffff 8px)',
      swatchPantalon: '#2563eb',
      swatchMedias: '#ef4444',
      foto: 'imagenes/equipacion1.png'
    },
    2: {
      nombre: '2ª Equipación',
      camiseta: 'Negra',
      pantalon: 'Rojo',
      medias: 'Rojinegras',
      swatchCamiseta: '#0E0F0F',
      swatchPantalon: '#E2232B',
      swatchMedias: 'repeating-linear-gradient(90deg, #0E0F0F, #0E0F0F 4px, #E2232B 4px, #E2232B 8px)',
      foto: 'imagenes/equipacion2.png'
    }
  },

  // CATÁLOGO DE LUGARES (Solo pones el nombre de la subcarpeta dentro de imagenes/lugares/)
  lugares: {
    pabellonDonBenito: {
      nombre: 'Pabellón Municipal "Julio Fco. Gómez"',
      direccion: 'Ciudad Deportiva "Pedro Porro", Av. del Deporte, Don Benito',
      pista: 'Pista cubierta - Goma',
      desplazamiento: '',
      linkGoogleMaps: 'https://maps.app.goo.gl/e9y5AZfnv39xkhix9',
      carpeta: 'pabellonDonBenito' 
    },
    pistaAzulDonBenito: {
      nombre: 'Pista "Azul"',
      pista: 'Pista exterior - Cemento pulido',
      direccion: 'Ciudad Deportiva "Pedro Porro", Av. del Deporte, Don Benito',
      desplazamiento: '',
      linkGoogleMaps: 'https://maps.app.goo.gl/e9y5AZfnv39xkhix9',
      carpeta: 'pistaAzulDonBenito' 
    },
    pistaVerdeDonBenito: {
      nombre: 'Pista "Verde"',
      pista: 'Pista exterior - Césped artificial de 3ª gen. (muy estropeado)',
      direccion: 'Ciudad Deportiva "Pedro Porro", Av. del Deporte, Don Benito',
      desplazamiento: '',
      linkGoogleMaps: 'https://maps.app.goo.gl/e9y5AZfnv39xkhix9',
      carpeta: 'pistaVerdeDonBenito' 
    },
    jaulaVva: {
      nombre: 'Pista deportiva verde "La Jaula"',
      pista: 'Pista exterior - Césped artificial de 1ª gen.',
      direccion: 'Av. Deportes, 61, Villanueva de la Serena',
      desplazamiento: 'desde Don Benito 10 km (20 minutos)',
      linkGoogleMaps: 'https://maps.app.goo.gl/hpiPQ4xzuiKnxVrw6',
      carpeta: 'jaulaVva'
    }
  }
};