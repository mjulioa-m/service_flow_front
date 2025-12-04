# Configuración de Google Sheets como Base de Datos

## Pasos para Configurar Google Sheets

### 1. Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Sheets API**:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Sheets API"
   - Haz clic en "Enable"

### 2. Crear una Service Account

1. Ve a "APIs & Services" > "Credentials"
2. Haz clic en "Create Credentials" > "Service Account"
3. Completa el formulario:
   - **Name**: Service Flow API
   - **Description**: Service account para acceder a Google Sheets
4. Haz clic en "Create and Continue"
5. En "Grant this service account access to project":
   - Role: "Editor" (o "Viewer" si solo necesitas leer)
6. Haz clic en "Done"

### 3. Crear y Descargar la Key

1. En la lista de Service Accounts, haz clic en la que acabas de crear
2. Ve a la pestaña "Keys"
3. Haz clic en "Add Key" > "Create new key"
4. Selecciona "JSON"
5. Descarga el archivo JSON

### 4. Configurar las Variables de Entorno

Del archivo JSON descargado, necesitas:

- `client_email`: Este es tu `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key`: Este es tu `GOOGLE_PRIVATE_KEY`

Crea un archivo `.env.local` en la raíz del proyecto:

```env
GOOGLE_SHEET_ID=tu_sheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Importante**: El `GOOGLE_PRIVATE_KEY` debe incluir los `\n` (saltos de línea) como están en el JSON.

### 5. Crear y Configurar el Google Sheet

1. Crea un nuevo Google Sheet
2. Copia el **Sheet ID** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_AQUI/edit
   ```
3. Crea las siguientes hojas (tabs) en tu Sheet:
   - **Desarrollos**
   - **Sprints**
   - **Dailies**
   - **Comentarios**
   - **Tickets**

4. **Comparte el Sheet** con el email de tu Service Account:
   - Haz clic en "Share" (Compartir)
   - Agrega el email de la Service Account (el `GOOGLE_SERVICE_ACCOUNT_EMAIL`)
   - Dale permisos de "Editor"
   - Haz clic en "Send"

### 6. Estructura de las Hojas

Las hojas se crearán automáticamente con los headers correctos cuando guardes datos por primera vez. Pero puedes crearlas manualmente:

#### Hoja "Desarrollos"
Headers: `id`, `titulo`, `descripcion`, `estado`, `horasEstimadas`, `sprintId`, `tiempoGastado`, `fechaCreacion`, `fechaActualizacion`, `soportista`

#### Hoja "Sprints"
Headers: `id`, `nombre`, `descripcion`, `fechaInicio`, `fechaFin`, `estado`, `desarrollos`

#### Hoja "Dailies"
Headers: `id`, `fecha`, `sprintId`, `desarrollos`, `bloqueadores`, `notas`

#### Hoja "Comentarios"
Headers: `id`, `desarrolloId`, `contenido`, `fechaCreacion`

#### Hoja "Tickets"
Headers: `id`, `titulo`, `descripcion`, `estado`, `prioridad`, `fechaCreacion`, `fechaActualizacion`

### 7. Instalar Dependencias

```bash
npm install
```

### 8. Usar la Aplicación

Una vez configurado, la aplicación usará automáticamente Google Sheets como base de datos. Si no está configurado, usará localStorage como fallback.

## Notas Importantes

- Los datos se guardan en tiempo real en Google Sheets
- Puedes ver y editar los datos directamente en Google Sheets
- Los arrays (como `desarrollos` en Sprints) se guardan como JSON strings
- Si hay un error al conectar con Google Sheets, la app usará localStorage como respaldo

## Troubleshooting

### Error: "Google Sheets credentials not configured"
- Verifica que las variables de entorno estén en `.env.local`
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo después de agregar las variables

### Error: "Permission denied"
- Verifica que hayas compartido el Google Sheet con el email de la Service Account
- Asegúrate de que la Service Account tenga permisos de "Editor"

### Error: "Sheet not found"
- Verifica que el `GOOGLE_SHEET_ID` sea correcto
- Asegúrate de que las hojas tengan los nombres exactos: Desarrollos, Sprints, Dailies, Comentarios, Tickets

