// Datos mock para simular la base de datos - Sistema de Seguimiento de Desarrollos
// Usa Google Sheets como base de datos principal, localStorage como fallback

import { readFromSheets, writeToSheets, updateRowInSheets, deleteRowFromSheets, type SheetData } from './googleSheets';

export interface Desarrollo {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'PENDIENTE' | 'EN_SOPORTE' | 'ENTREGADO_AL_CLIENTE';
  horasEstimadas: number; // horas estimadas para completar
  sprintId?: string;
  tiempoGastado: number; // en segundos
  fechaCreacion: string;
  fechaActualizacion: string;
  comentarios?: Comentario[];
  soportista?: 'jose' | 'estewill' | 'darwin';
}

export interface Comentario {
  id: string;
  desarrolloId: string;
  contenido: string;
  fechaCreacion: string;
}

export interface Sprint {
  id: string;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'PLANIFICADO' | 'EN_CURSO' | 'COMPLETADO';
  desarrollos: string[]; // IDs de desarrollos
}

export interface Daily {
  id: string;
  fecha: string;
  sprintId?: string;
  desarrollos: DailyDesarrollo[];
  bloqueadores: string[];
  notas: string;
}

export interface DailyDesarrollo {
  desarrolloId: string;
  trabajoAyer: string;
  trabajoHoy: string;
  tiempoGastado: number; // en segundos
}

export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'NUEVO' | 'EN_CURSO' | 'CERRADO';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  fechaCreacion: string;
  fechaActualizacion: string;
}

// Funciones de localStorage
const STORAGE_KEYS = {
  DESARROLLOS: 'serviceflow_desarrollos',
  COMENTARIOS: 'serviceflow_comentarios',
  SPRINTS: 'serviceflow_sprints',
  DAILIES: 'serviceflow_dailies',
  TICKETS: 'serviceflow_tickets',
};

// Flag para saber si usar Google Sheets (se detecta automáticamente si hay credenciales)
// En el cliente, intentamos usar Google Sheets si la API está disponible
const USE_GOOGLE_SHEETS = typeof window !== 'undefined';

const getFromStorage = async <T>(key: string, defaultValue: T): Promise<T> => {
  if (typeof window === 'undefined') return defaultValue;
  
  // Intentar leer desde Google Sheets primero
  if (USE_GOOGLE_SHEETS) {
    try {
      const sheetData = await readFromSheets();
      if (sheetData) {
        const sheetKeyMap: Record<string, keyof SheetData> = {
          'serviceflow_desarrollos': 'desarrollos',
          'serviceflow_sprints': 'sprints',
          'serviceflow_dailies': 'dailies',
          'serviceflow_comentarios': 'comentarios',
          'serviceflow_tickets': 'tickets',
        };
        const sheetKey = sheetKeyMap[key];
        if (sheetKey && sheetData) {
          const sheetValue = sheetData[sheetKey];
          if (sheetValue && Array.isArray(sheetValue) && sheetValue.length > 0) {
            // Sincronizar con localStorage como backup
            localStorage.setItem(key, JSON.stringify(sheetValue));
            return sheetValue as T;
          }
        }
      }
    } catch (error) {
      // Silenciosamente fallar a localStorage
    }
  }
  
  // Fallback a localStorage
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = async <T>(key: string, data: T): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // Mapear keys a nombres de hojas
  const sheetNameMap: Record<string, string> = {
    'serviceflow_desarrollos': 'desarrollos',
    'serviceflow_sprints': 'sprints',
    'serviceflow_dailies': 'dailies',
    'serviceflow_comentarios': 'comentarios',
    'serviceflow_tickets': 'tickets',
  };
  
  const sheetName = sheetNameMap[key];
  
  // Siempre guardar en localStorage primero (más rápido)
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
  
  // Si está configurado para usar Google Sheets, intentar escribir ahí también
  if (USE_GOOGLE_SHEETS && sheetName && Array.isArray(data)) {
    try {
      await writeToSheets(sheetName, data);
    } catch (error) {
      // Silenciosamente fallar, ya tenemos localStorage como backup
    }
  }
};

// Datos iniciales por defecto
const defaultDesarrollos: Desarrollo[] = [
  {
    id: '1',
    titulo: 'Setup Next.js + Tailwind & Estructura de Mocks',
    descripcion: "Inicializar proyecto Next.js, configurar Tailwind CSS con la paleta de colores institucional del Colombo. Crear estructura de carpetas para 'mock-data' (jsons).",
    estado: 'EN_SOPORTE',
    horasEstimadas: 3.0,
    sprintId: '1',
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '2',
    titulo: 'Diseño de Layout Principal y Selector de Sede',
    descripcion: "Crear el Sidebar y Header. Incluir un selector visual prominente (Dropdown) para cambiar entre 'Sede Centro' y 'Sede Norte' que filtre la data visualmente.",
    estado: 'EN_SOPORTE',
    horasEstimadas: 4.0,
    sprintId: '1',
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '3',
    titulo: 'Dashboard Administrativo (KPIs Visuales)',
    descripcion: 'Maquetar vista de Admin con gráficas (usando Recharts o similar) mostrando: Estudiantes Activos, Ingresos por Sede, y Tasas de Aprobación (Data fake desde JSON).',
    estado: 'PENDIENTE',
    horasEstimadas: 5.0,
    sprintId: '1',
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '4',
    titulo: "Vista de 'Matriz de Calificación Flexible' (Demo Clave)",
    descripcion: "Crear la interfaz donde el docente ve su lista de estudiantes. DEBE tener un selector de 'Plantilla' que cambie dinámicamente las columnas de notas (ej: cambiar de 3 columnas a 5 columnas en vivo).",
    estado: 'PENDIENTE',
    horasEstimadas: 8.0,
    sprintId: '1',
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '5',
    titulo: 'Portal del Estudiante: Vista de Notas y Progreso',
    descripcion: 'Maquetar la vista móvil/desktop del estudiante viendo sus notas desglosadas con barras de progreso y su asistencia visual.',
    estado: 'PENDIENTE',
    horasEstimadas: 4.0,
    sprintId: '1',
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '6',
    titulo: 'Login Simulado con Selección de Rol',
    descripcion: "Pantalla de Login estéticamente perfecta. En lugar de auth real, botones rápidos: 'Entrar como Admin', 'Entrar como Docente', 'Entrar como Estudiante' para agilizar la demo.",
    estado: 'PENDIENTE',
    horasEstimadas: 2.5,
    sprintId: '1',
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '7',
    titulo: 'Creación de JSONs Mock (Data Maestra)',
    descripcion: "Generar archivos JSON robustos: 'students.json', 'courses.json', 'grades_templates.json' con datos realistas para poblar las vistas.",
    estado: 'PENDIENTE',
    horasEstimadas: 2.0,
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '8',
    titulo: 'Vista de Programación Académica (Calendario)',
    descripcion: "Interfaz tipo Calendario o Lista para ver la oferta de cursos. Mostrar etiquetas de colores para diferenciar cursos 'Sabatino Mañana', 'Intensivo', etc.",
    estado: 'PENDIENTE',
    horasEstimadas: 4.5,
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '9',
    titulo: 'Generador de Certificado Visual',
    descripcion: 'Un botón en el perfil del estudiante que abra un modal con un PDF/Imagen pre-generado del certificado de notas con el logo del Colombo.',
    estado: 'PENDIENTE',
    horasEstimadas: 2.0,
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '10',
    titulo: 'Módulo de Asistencia Docente',
    descripcion: 'Vista rápida donde el profesor ve lista de estudiantes y marca checkbox de asistencia. Debe mostrar contador de horas acumuladas (simulado).',
    estado: 'PENDIENTE',
    horasEstimadas: 3.0,
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '11',
    titulo: 'Vista de Gestión de Convenios',
    descripcion: "Tabla administrativa filtrada por 'Convenios'. Mostrar logos de colegios ficticios y una tabla de estudiantes asociados a ese convenio.",
    estado: 'PENDIENTE',
    horasEstimadas: 3.0,
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
  {
    id: '12',
    titulo: 'Detalle de Historial Académico',
    descripcion: "Componente visual tipo 'Timeline' o tabla histórica que muestre los niveles pasados del estudiante y sus notas finales.",
    estado: 'PENDIENTE',
    horasEstimadas: 2.5,
    tiempoGastado: 0,
    fechaCreacion: '2025-12-03T19:40:00.000Z',
    fechaActualizacion: '2025-12-03T19:40:00.000Z',
  },
];

const defaultComentarios: Comentario[] = [
  {
    id: '1',
    desarrolloId: '1',
    contenido: 'He comenzado con la implementación. Necesito revisar la estructura de la base de datos primero.',
    fechaCreacion: new Date(Date.now() - 3600000).toISOString(),
  },
];

const defaultSprints: Sprint[] = [
  {
    id: '1',
    nombre: 'Sprint 1 - Fundación',
    descripcion: 'Sprint inicial para establecer las bases del proyecto',
    fechaInicio: new Date().toISOString(),
    fechaFin: new Date(Date.now() + 14 * 86400000).toISOString(),
    estado: 'EN_CURSO',
    desarrollos: ['1', '2'],
  },
];

const defaultDailies: Daily[] = [
  {
    id: '1',
    fecha: new Date().toISOString(),
    sprintId: '1',
    desarrollos: [
      {
        desarrolloId: '1',
        trabajoAyer: 'Revisé la documentación de JWT',
        trabajoHoy: 'Implementar middleware de autenticación',
        tiempoGastado: 0,
      },
    ],
    bloqueadores: [],
    notas: 'Todo va bien, sin bloqueadores',
  },
];

// Función para migrar/actualizar datos existentes
const migrateData = async (): Promise<{ migratedDesarrollos: Desarrollo[]; migratedDailies: Daily[] }> => {
  // Migrar desarrollos: poner tiempoGastado en 0 y asegurar horasEstimadas
  const existingDesarrollos = await getFromStorage(STORAGE_KEYS.DESARROLLOS, defaultDesarrollos);
  const migratedDesarrollos = existingDesarrollos.map(desarrollo => ({
    ...desarrollo,
    tiempoGastado: desarrollo.tiempoGastado || 0,
    horasEstimadas: desarrollo.horasEstimadas || 0,
  }));
  
  // Migrar dailies: poner tiempoGastado en 0 para todos los desarrollos
  const existingDailies = await getFromStorage(STORAGE_KEYS.DAILIES, defaultDailies);
  const migratedDailies = existingDailies.map(daily => ({
    ...daily,
    desarrollos: daily.desarrollos.map(dev => ({
      ...dev,
      tiempoGastado: dev.tiempoGastado || 0,
    })),
  }));
  
  // Guardar datos migrados
  if (typeof window !== 'undefined') {
    await saveToStorage(STORAGE_KEYS.DESARROLLOS, migratedDesarrollos);
    await saveToStorage(STORAGE_KEYS.DAILIES, migratedDailies);
  }
  
  return { migratedDesarrollos, migratedDailies };
};

// Función para inicializar datos solo si no existen
const initializeDataIfNeeded = async () => {
  if (typeof window === 'undefined') return;
  
  // Intentar cargar desde Google Sheets primero
  if (USE_GOOGLE_SHEETS) {
    try {
      const sheetData = await readFromSheets();
      if (sheetData && sheetData.desarrollos && sheetData.desarrollos.length > 0) {
        // Ya hay datos en Google Sheets, no inicializar
        return;
      }
    } catch (error) {
      console.warn('Error reading from Google Sheets during init:', error);
    }
  }
  
  // Solo inicializar si realmente no hay datos en localStorage
  if (!localStorage.getItem(STORAGE_KEYS.DESARROLLOS)) {
    await saveToStorage(STORAGE_KEYS.DESARROLLOS, defaultDesarrollos);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMENTARIOS)) {
    await saveToStorage(STORAGE_KEYS.COMENTARIOS, defaultComentarios);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SPRINTS)) {
    await saveToStorage(STORAGE_KEYS.SPRINTS, defaultSprints);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DAILIES)) {
    await saveToStorage(STORAGE_KEYS.DAILIES, defaultDailies);
  }
  
  // Migrar datos existentes si hay datos en localStorage
  if (localStorage.getItem(STORAGE_KEYS.DESARROLLOS)) {
    const { migratedDesarrollos, migratedDailies } = await migrateData();
    await saveToStorage(STORAGE_KEYS.DESARROLLOS, migratedDesarrollos);
    await saveToStorage(STORAGE_KEYS.DAILIES, migratedDailies);
  }
};

// Inicializar datos solo en el cliente (async, pero no bloquea)
if (typeof window !== 'undefined') {
  initializeDataIfNeeded().catch(console.error);
}

// Cargar datos desde localStorage o usar valores por defecto
// Estas variables se actualizan en cada llamada a las APIs
let desarrollosData: Desarrollo[] = [];
let comentariosData: Comentario[] = [];
let sprintsData: Sprint[] = [];
let dailiesData: Daily[] = [];

// Funciones para Desarrollos
export const mockDesarrollosApi = {
  getAll: async (): Promise<Desarrollo[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Siempre recargar desde Google Sheets o localStorage para obtener datos actualizados
    desarrollosData = await getFromStorage(STORAGE_KEYS.DESARROLLOS, defaultDesarrollos);
    comentariosData = await getFromStorage(STORAGE_KEYS.COMENTARIOS, defaultComentarios);
    return desarrollosData.map(desarrollo => ({
      ...desarrollo,
      comentarios: comentariosData.filter(c => c.desarrolloId === desarrollo.id),
    }));
  },

  getById: async (id: string): Promise<Desarrollo> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Recargar desde Google Sheets o localStorage para obtener datos actualizados
    desarrollosData = await getFromStorage(STORAGE_KEYS.DESARROLLOS, defaultDesarrollos);
    comentariosData = await getFromStorage(STORAGE_KEYS.COMENTARIOS, defaultComentarios);
    const desarrollo = desarrollosData.find(d => d.id === id);
    if (!desarrollo) {
      throw new Error('Desarrollo no encontrado');
    }
    return {
      ...desarrollo,
      comentarios: comentariosData.filter(c => c.desarrolloId === desarrollo.id),
    };
  },

  create: async (data: Omit<Desarrollo, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'tiempoGastado'>): Promise<Desarrollo> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // Recargar datos actuales desde Google Sheets o localStorage antes de crear
    desarrollosData = await getFromStorage(STORAGE_KEYS.DESARROLLOS, defaultDesarrollos);
    const newDesarrollo: Desarrollo = {
      ...data,
      id: Date.now().toString(),
      tiempoGastado: 0,
      horasEstimadas: data.horasEstimadas || 0,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };
    desarrollosData.push(newDesarrollo);
    await saveToStorage(STORAGE_KEYS.DESARROLLOS, desarrollosData);
    return newDesarrollo;
  },

  update: async (id: string, data: Partial<Desarrollo>): Promise<Desarrollo> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Recargar datos actuales desde Google Sheets o localStorage antes de actualizar
    desarrollosData = await getFromStorage(STORAGE_KEYS.DESARROLLOS, defaultDesarrollos);
    const index = desarrollosData.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Desarrollo no encontrado');
    }
    desarrollosData[index] = {
      ...desarrollosData[index],
      ...data,
      fechaActualizacion: new Date().toISOString(),
    };
    
    // Si usa Google Sheets, actualizar la fila específica
    if (USE_GOOGLE_SHEETS) {
      try {
        await updateRowInSheets('desarrollos', id, desarrollosData[index]);
      } catch (error) {
        console.warn('Error updating in Google Sheets, using full write:', error);
        await saveToStorage(STORAGE_KEYS.DESARROLLOS, desarrollosData);
      }
    } else {
      await saveToStorage(STORAGE_KEYS.DESARROLLOS, desarrollosData);
    }
    
    return desarrollosData[index];
  },

  addTime: async (id: string, seconds: number): Promise<Desarrollo> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Recargar datos actuales desde Google Sheets o localStorage antes de actualizar
    desarrollosData = await getFromStorage(STORAGE_KEYS.DESARROLLOS, defaultDesarrollos);
    const index = desarrollosData.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Desarrollo no encontrado');
    }
    desarrollosData[index].tiempoGastado += seconds;
    desarrollosData[index].fechaActualizacion = new Date().toISOString();
    
    // Si usa Google Sheets, actualizar la fila específica
    if (USE_GOOGLE_SHEETS) {
      try {
        await updateRowInSheets('desarrollos', id, desarrollosData[index]);
      } catch (error) {
        console.warn('Error updating in Google Sheets, using full write:', error);
        await saveToStorage(STORAGE_KEYS.DESARROLLOS, desarrollosData);
      }
    } else {
      await saveToStorage(STORAGE_KEYS.DESARROLLOS, desarrollosData);
    }
    
    return desarrollosData[index];
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Recargar datos actuales desde Google Sheets o localStorage antes de eliminar
    desarrollosData = await getFromStorage(STORAGE_KEYS.DESARROLLOS, defaultDesarrollos);
    comentariosData = await getFromStorage(STORAGE_KEYS.COMENTARIOS, defaultComentarios);
    const index = desarrollosData.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Desarrollo no encontrado');
    }
    desarrollosData.splice(index, 1);
    // También eliminar comentarios asociados
    comentariosData = comentariosData.filter(c => c.desarrolloId !== id);
    
    // Si usa Google Sheets, eliminar la fila específica
    if (USE_GOOGLE_SHEETS) {
      try {
        await deleteRowFromSheets('desarrollos', id);
        // Eliminar comentarios asociados
        const comentariosAEliminar = comentariosData.filter(c => c.desarrolloId === id);
        for (const comentario of comentariosAEliminar) {
          await deleteRowFromSheets('comentarios', comentario.id);
        }
      } catch (error) {
        console.warn('Error deleting from Google Sheets, using full write:', error);
        await saveToStorage(STORAGE_KEYS.DESARROLLOS, desarrollosData);
        await saveToStorage(STORAGE_KEYS.COMENTARIOS, comentariosData);
      }
    } else {
      await saveToStorage(STORAGE_KEYS.DESARROLLOS, desarrollosData);
      await saveToStorage(STORAGE_KEYS.COMENTARIOS, comentariosData);
    }
    
    // Disparar evento para notificar a otras páginas
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('desarrolloDeleted', { detail: { desarrolloId: id } }));
    }
  },
};

// Funciones para Comentarios
export const mockComentariosApi = {
  getByDesarrollo: async (desarrolloId: string): Promise<Comentario[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    comentariosData = await getFromStorage(STORAGE_KEYS.COMENTARIOS, defaultComentarios);
    return comentariosData.filter(c => c.desarrolloId === desarrolloId);
  },

  create: async (desarrolloId: string, data: { contenido: string }): Promise<Comentario> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    comentariosData = await getFromStorage(STORAGE_KEYS.COMENTARIOS, defaultComentarios);
    const newComentario: Comentario = {
      id: Date.now().toString(),
      desarrolloId,
      contenido: data.contenido,
      fechaCreacion: new Date().toISOString(),
    };
    comentariosData.push(newComentario);
    await saveToStorage(STORAGE_KEYS.COMENTARIOS, comentariosData);
    return newComentario;
  },
};

// Funciones para Sprints
export const mockSprintsApi = {
  getAll: async (): Promise<Sprint[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    sprintsData = await getFromStorage(STORAGE_KEYS.SPRINTS, defaultSprints);
    return sprintsData;
  },

  getById: async (id: string): Promise<Sprint> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    sprintsData = await getFromStorage(STORAGE_KEYS.SPRINTS, defaultSprints);
    const sprint = sprintsData.find(s => s.id === id);
    if (!sprint) {
      throw new Error('Sprint no encontrado');
    }
    return sprint;
  },

  create: async (data: Omit<Sprint, 'id'>): Promise<Sprint> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    sprintsData = await getFromStorage(STORAGE_KEYS.SPRINTS, defaultSprints);
    const newSprint: Sprint = {
      ...data,
      id: Date.now().toString(),
    };
    sprintsData.push(newSprint);
    await saveToStorage(STORAGE_KEYS.SPRINTS, sprintsData);
    return newSprint;
  },

  update: async (id: string, data: Partial<Sprint>): Promise<Sprint> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    sprintsData = await getFromStorage(STORAGE_KEYS.SPRINTS, defaultSprints);
    const index = sprintsData.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Sprint no encontrado');
    }
    sprintsData[index] = { ...sprintsData[index], ...data };
    
    // Si usa Google Sheets, actualizar la fila específica
    if (USE_GOOGLE_SHEETS) {
      try {
        await updateRowInSheets('sprints', id, sprintsData[index]);
      } catch (error) {
        console.warn('Error updating in Google Sheets, using full write:', error);
        await saveToStorage(STORAGE_KEYS.SPRINTS, sprintsData);
      }
    } else {
      await saveToStorage(STORAGE_KEYS.SPRINTS, sprintsData);
    }
    
    return sprintsData[index];
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    sprintsData = await getFromStorage(STORAGE_KEYS.SPRINTS, defaultSprints);
    desarrollosData = await getFromStorage(STORAGE_KEYS.DESARROLLOS, defaultDesarrollos);
    const index = sprintsData.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error('Sprint no encontrado');
    }
    // Remover el sprintId de los desarrollos asociados
    desarrollosData.forEach(desarrollo => {
      if (desarrollo.sprintId === id) {
        desarrollo.sprintId = undefined;
      }
    });
    await saveToStorage(STORAGE_KEYS.DESARROLLOS, desarrollosData);
    
    sprintsData.splice(index, 1);
    
    // Si usa Google Sheets, eliminar la fila específica
    if (USE_GOOGLE_SHEETS) {
      try {
        await deleteRowFromSheets('sprints', id);
      } catch (error) {
        console.warn('Error deleting from Google Sheets, using full write:', error);
        await saveToStorage(STORAGE_KEYS.SPRINTS, sprintsData);
      }
    } else {
      await saveToStorage(STORAGE_KEYS.SPRINTS, sprintsData);
    }
    
    // Disparar evento para notificar a otras páginas
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sprintDeleted', { detail: { sprintId: id } }));
    }
  },
};

// Funciones para Dailies
export const mockDailiesApi = {
  getAll: async (): Promise<Daily[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Siempre recargar desde Google Sheets o localStorage
    dailiesData = await getFromStorage(STORAGE_KEYS.DAILIES, defaultDailies);
    return dailiesData;
  },

  getById: async (id: string): Promise<Daily> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    dailiesData = await getFromStorage(STORAGE_KEYS.DAILIES, defaultDailies);
    const daily = dailiesData.find(d => d.id === id);
    if (!daily) {
      throw new Error('Daily no encontrado');
    }
    return daily;
  },

  getBySprint: async (sprintId: string): Promise<Daily[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    dailiesData = await getFromStorage(STORAGE_KEYS.DAILIES, defaultDailies);
    return dailiesData.filter(d => d.sprintId === sprintId);
  },

  create: async (data: Omit<Daily, 'id'>): Promise<Daily> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    dailiesData = await getFromStorage(STORAGE_KEYS.DAILIES, defaultDailies);
    const newDaily: Daily = {
      ...data,
      id: Date.now().toString(),
    };
    dailiesData.push(newDaily);
    await saveToStorage(STORAGE_KEYS.DAILIES, dailiesData);
    return newDaily;
  },

  update: async (id: string, data: Partial<Daily>): Promise<Daily> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    dailiesData = await getFromStorage(STORAGE_KEYS.DAILIES, defaultDailies);
    const index = dailiesData.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Daily no encontrado');
    }
    dailiesData[index] = { ...dailiesData[index], ...data };
    
    // Si usa Google Sheets, actualizar la fila específica
    if (USE_GOOGLE_SHEETS) {
      try {
        await updateRowInSheets('dailies', id, dailiesData[index]);
      } catch (error) {
        console.warn('Error updating in Google Sheets, using full write:', error);
        await saveToStorage(STORAGE_KEYS.DAILIES, dailiesData);
      }
    } else {
      await saveToStorage(STORAGE_KEYS.DAILIES, dailiesData);
    }
    
    return dailiesData[index];
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    dailiesData = await getFromStorage(STORAGE_KEYS.DAILIES, defaultDailies);
    const index = dailiesData.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Daily no encontrado');
    }
    dailiesData.splice(index, 1);
    
    // Si usa Google Sheets, eliminar la fila específica
    if (USE_GOOGLE_SHEETS) {
      try {
        await deleteRowFromSheets('dailies', id);
      } catch (error) {
        console.warn('Error deleting from Google Sheets, using full write:', error);
        await saveToStorage(STORAGE_KEYS.DAILIES, dailiesData);
      }
    } else {
      await saveToStorage(STORAGE_KEYS.DAILIES, dailiesData);
    }
  },
};

// Funciones para Tickets
let ticketsData: Ticket[] = [];

export const mockTicketsApi = {
  getAll: async (): Promise<Ticket[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    ticketsData = await getFromStorage(STORAGE_KEYS.TICKETS, []);
    return ticketsData;
  },

  getById: async (id: string): Promise<Ticket> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    ticketsData = await getFromStorage(STORAGE_KEYS.TICKETS, []);
    const ticket = ticketsData.find(t => t.id === id);
    if (!ticket) {
      throw new Error('Ticket no encontrado');
    }
    return ticket;
  },

  create: async (data: Omit<Ticket, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<Ticket> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    ticketsData = await getFromStorage(STORAGE_KEYS.TICKETS, []);
    const newTicket: Ticket = {
      ...data,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };
    ticketsData.push(newTicket);
    await saveToStorage(STORAGE_KEYS.TICKETS, ticketsData);
    return newTicket;
  },

  update: async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    ticketsData = await getFromStorage(STORAGE_KEYS.TICKETS, []);
    const index = ticketsData.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Ticket no encontrado');
    }
    ticketsData[index] = {
      ...ticketsData[index],
      ...data,
      fechaActualizacion: new Date().toISOString(),
    };
    
    // Si usa Google Sheets, actualizar la fila específica
    if (USE_GOOGLE_SHEETS) {
      try {
        await updateRowInSheets('tickets', id, ticketsData[index]);
      } catch (error) {
        console.warn('Error updating in Google Sheets, using full write:', error);
        await saveToStorage(STORAGE_KEYS.TICKETS, ticketsData);
      }
    } else {
      await saveToStorage(STORAGE_KEYS.TICKETS, ticketsData);
    }
    
    return ticketsData[index];
  },

  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    ticketsData = await getFromStorage(STORAGE_KEYS.TICKETS, []);
    const index = ticketsData.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Ticket no encontrado');
    }
    ticketsData.splice(index, 1);
    
    // Si usa Google Sheets, eliminar la fila específica
    if (USE_GOOGLE_SHEETS) {
      try {
        await deleteRowFromSheets('tickets', id);
      } catch (error) {
        console.warn('Error deleting from Google Sheets, using full write:', error);
        await saveToStorage(STORAGE_KEYS.TICKETS, ticketsData);
      }
    } else {
      await saveToStorage(STORAGE_KEYS.TICKETS, ticketsData);
    }
  },
};
