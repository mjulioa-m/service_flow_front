import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Configuración de Google Sheets
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Nombres de las hojas en Google Sheets
const SHEET_NAMES = {
  DESARROLLOS: 'Desarrollos',
  SPRINTS: 'Sprints',
  DAILIES: 'Dailies',
  COMENTARIOS: 'Comentarios',
  TICKETS: 'Tickets',
};

async function getAuth() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Sheets credentials not configured');
  }

  const auth = new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

function parseSheetData(values: any[][], headers: string[]): any[] {
  if (!values || values.length === 0) return [];
  
  return values.slice(1).map((row) => {
    const obj: any = {};
    headers.forEach((header, index) => {
      let value = row[index];
      
      // Parsear valores según el tipo
      if (value === '' || value === undefined) {
        value = null;
      } else if (header === 'desarrollos' || header === 'bloqueadores') {
        // Arrays almacenados como JSON strings
        try {
          value = JSON.parse(value);
        } catch {
          value = [];
        }
      } else if (header === 'tiempoGastado' || header === 'horasEstimadas') {
        value = parseFloat(value) || 0;
      } else if (header === 'desarrollos' && Array.isArray(value)) {
        // Ya es un array
      }
      
      obj[header] = value;
    });
    return obj;
  });
}

export async function GET() {
  try {
    if (!SPREADSHEET_ID) {
      return NextResponse.json({
        desarrollos: [],
        sprints: [],
        dailies: [],
        comentarios: [],
        tickets: [],
      });
    }

    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Leer todas las hojas en paralelo
    const [desarrollosRes, sprintsRes, dailiesRes, comentariosRes, ticketsRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.DESARROLLOS}!A:O`,
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.SPRINTS}!A:G`,
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.DAILIES}!A:F`,
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.COMENTARIOS}!A:D`,
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.TICKETS}!A:G`,
      }).catch(() => ({ data: { values: [] } })),
    ]);

    // Parsear datos
    const desarrollosHeaders = ['id', 'titulo', 'descripcion', 'estado', 'horasEstimadas', 'sprintId', 'tiempoGastado', 'fechaCreacion', 'fechaActualizacion', 'soportista'];
    const sprintsHeaders = ['id', 'nombre', 'descripcion', 'fechaInicio', 'fechaFin', 'estado', 'desarrollos'];
    const dailiesHeaders = ['id', 'fecha', 'sprintId', 'desarrollos', 'bloqueadores', 'notas'];
    const comentariosHeaders = ['id', 'desarrolloId', 'contenido', 'fechaCreacion'];
    const ticketsHeaders = ['id', 'titulo', 'descripcion', 'estado', 'prioridad', 'fechaCreacion', 'fechaActualizacion'];

    const desarrollos = parseSheetData(desarrollosRes.data.values || [], desarrollosHeaders);
    const sprints = parseSheetData(sprintsRes.data.values || [], sprintsHeaders);
    const dailies = parseSheetData(dailiesRes.data.values || [], dailiesHeaders);
    const comentarios = parseSheetData(comentariosRes.data.values || [], comentariosHeaders);
    const tickets = parseSheetData(ticketsRes.data.values || [], ticketsHeaders);

    return NextResponse.json({
      desarrollos,
      sprints,
      dailies,
      comentarios,
      tickets,
    });
  } catch (error: any) {
    console.error('Error reading from Google Sheets:', error);
    return NextResponse.json(
      { error: error.message || 'Error al leer desde Google Sheets' },
      { status: 500 }
    );
  }
}

