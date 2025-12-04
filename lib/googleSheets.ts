// Integración con Google Sheets como base de datos
// Las funciones intentan usar Google Sheets a través de API routes, con fallback a localStorage

const GOOGLE_SHEETS_API_URL = '/api/sheets';

export interface SheetData {
  desarrollos: any[];
  sprints: any[];
  dailies: any[];
  comentarios: any[];
  tickets: any[];
}

// Verificar si Google Sheets está configurado
const isGoogleSheetsConfigured = (): boolean => {
  // En el cliente, siempre intentamos usar las API routes
  // Las API routes verificarán si hay credenciales configuradas
  return typeof window !== 'undefined';
};

// Función para leer datos desde Google Sheets
export const readFromSheets = async (): Promise<SheetData | null> => {
  if (!isGoogleSheetsConfigured()) return null;
  
  try {
    const response = await fetch(`${GOOGLE_SHEETS_API_URL}/read`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    // Si hay un error en la respuesta, retornar null
    if (data.error) {
      return null;
    }
    return data;
  } catch (error) {
    // Silenciosamente fallar y usar localStorage
    return null;
  }
};

// Función para escribir datos en Google Sheets
export const writeToSheets = async (sheetName: string, data: any[]): Promise<boolean> => {
  if (!isGoogleSheetsConfigured()) return false;
  
  try {
    const response = await fetch(`${GOOGLE_SHEETS_API_URL}/write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetName,
        data,
      }),
    });
    if (!response.ok) {
      return false;
    }
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    return false;
  }
};

// Función para actualizar una fila específica
export const updateRowInSheets = async (sheetName: string, id: string, data: any): Promise<boolean> => {
  if (!isGoogleSheetsConfigured()) return false;
  
  try {
    const response = await fetch(`${GOOGLE_SHEETS_API_URL}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetName,
        id,
        data,
      }),
    });
    if (!response.ok) {
      return false;
    }
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    return false;
  }
};

// Función para eliminar una fila
export const deleteRowFromSheets = async (sheetName: string, id: string): Promise<boolean> => {
  if (!isGoogleSheetsConfigured()) return false;
  
  try {
    const response = await fetch(`${GOOGLE_SHEETS_API_URL}/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetName,
        id,
      }),
    });
    if (!response.ok) {
      return false;
    }
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    return false;
  }
};

