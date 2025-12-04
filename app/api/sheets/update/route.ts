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

export async function POST(request: Request) {
  try {
    const { sheetName, id, data } = await request.json();

    if (!SPREADSHEET_ID || !sheetName || !id || !data) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const sheetNameFormatted = SHEET_NAMES[sheetName] || sheetName;
    const headers = HEADERS[sheetName] || [];

    // Leer todos los datos
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetNameFormatted}!A:Z`,
    });

    const values = response.data.values || [];
    if (values.length < 2) {
      return NextResponse.json({ error: 'Sheet is empty' }, { status: 404 });
    }

    // Encontrar la fila con el ID
    const idColumnIndex = headers.indexOf('id');
    let rowIndex = -1;
    for (let i = 1; i < values.length; i++) {
      if (values[i][idColumnIndex] === id) {
        rowIndex = i + 1; // +1 porque las filas en Sheets empiezan en 1
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Row not found' }, { status: 404 });
    }

    // Actualizar la fila
    const row = headers.map(header => {
      const value = data[header] ?? values[rowIndex - 1][headers.indexOf(header)] ?? '';
      return Array.isArray(value) ? JSON.stringify(value) : value;
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetNameFormatted}!A${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating in Google Sheets:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar en Google Sheets' },
      { status: 500 }
    );
  }
}

