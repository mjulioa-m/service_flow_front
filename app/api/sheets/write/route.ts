import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const SHEET_NAMES: Record<string, string> = {
  desarrollos: 'Desarrollos',
  sprints: 'Sprints',
  dailies: 'Dailies',
  comentarios: 'Comentarios',
  tickets: 'Tickets',
};

const HEADERS: Record<string, string[]> = {
  desarrollos: ['id', 'titulo', 'descripcion', 'estado', 'horasEstimadas', 'sprintId', 'tiempoGastado', 'fechaCreacion', 'fechaActualizacion', 'soportista'],
  sprints: ['id', 'nombre', 'descripcion', 'fechaInicio', 'fechaFin', 'estado', 'desarrollos'],
  dailies: ['id', 'fecha', 'sprintId', 'desarrollos', 'bloqueadores', 'notas'],
  comentarios: ['id', 'desarrolloId', 'contenido', 'fechaCreacion'],
  tickets: ['id', 'titulo', 'descripcion', 'estado', 'prioridad', 'fechaCreacion', 'fechaActualizacion'],
};

async function getAuth() {
  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Sheets credentials not configured');
  }

  return new google.auth.JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function convertToRow(data: any, headers: string[]): any[] {
  return headers.map(header => {
    const value = data[header];
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return value ?? '';
  });
}

export async function POST(request: Request) {
  try {
    const { sheetName, data } = await request.json();

    if (!SPREADSHEET_ID || !sheetName || !data) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const sheetNameFormatted = SHEET_NAMES[sheetName] || sheetName;
    const headers = HEADERS[sheetName] || [];

    // Convertir datos a filas
    const rows = data.map((item: any) => convertToRow(item, headers));

    // Limpiar la hoja y escribir nuevos datos
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetNameFormatted}!A:Z`,
    });

    // Escribir headers y datos
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetNameFormatted}!A1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error writing to Google Sheets:', error);
    return NextResponse.json(
      { error: error.message || 'Error al escribir en Google Sheets' },
      { status: 500 }
    );
  }
}

