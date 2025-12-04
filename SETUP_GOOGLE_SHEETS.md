# 🚀 Configuración Rápida de Google Sheets

## Pasos Simples

### 1. Crear Google Sheet
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea un nuevo Sheet
3. Copia el **ID del Sheet** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
   ```

### 2. Configurar Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita **Google Sheets API**
4. Crea una **Service Account**:
   - Ve a "APIs & Services" > "Credentials"
   - "Create Credentials" > "Service Account"
   - Descarga el JSON de la key

### 3. Compartir el Sheet
1. Abre el JSON descargado
2. Copia el `client_email` (ejemplo: `service-account@proyecto.iam.gserviceaccount.com`)
3. Abre tu Google Sheet
4. Haz clic en "Compartir" (Share)
5. Pega el email de la Service Account
6. Dale permisos de "Editor"

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
GOOGLE_SHEET_ID=tu_sheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=service-account@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Importante**: 
- El `GOOGLE_PRIVATE_KEY` debe estar entre comillas
- Debe incluir los `\n` (saltos de línea) exactamente como están en el JSON

### 5. Instalar Dependencias

```bash
npm install
```

### 6. ¡Listo!

La aplicación usará automáticamente Google Sheets cuando detecte las credenciales. Si no están configuradas, usará localStorage como respaldo.

## Estructura del Sheet

Las hojas se crearán automáticamente cuando guardes datos por primera vez. No necesitas crearlas manualmente, pero si quieres puedes crear estas hojas:

- **Desarrollos**
- **Sprints**  
- **Dailies**
- **Comentarios**
- **Tickets**

## Ventajas de Google Sheets

✅ Los datos se guardan en la nube  
✅ No se pierden con limpiezas de cache  
✅ Puedes ver/editar datos directamente en Sheets  
✅ Sincronización automática  
✅ Backup automático de Google  

## Troubleshooting

**Error: "Google Sheets credentials not configured"**
- Verifica que `.env.local` existe y tiene las variables correctas
- Reinicia el servidor después de agregar las variables

**Error: "Permission denied"**
- Verifica que compartiste el Sheet con el email de la Service Account
- Asegúrate de dar permisos de "Editor"

**Los datos no aparecen**
- Verifica que el `GOOGLE_SHEET_ID` sea correcto
- Revisa la consola del navegador para ver errores

