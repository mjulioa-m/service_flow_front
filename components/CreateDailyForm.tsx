'use client';

import { useState, useEffect } from 'react';
import { mockDailiesApi, mockDesarrollosApi, mockSprintsApi, Daily, Desarrollo, Sprint } from '@/lib/mockData';

interface CreateDailyFormProps {
  onSuccess: () => void;
}

export default function CreateDailyForm({ onSuccess }: CreateDailyFormProps) {
  const [formData, setFormData] = useState<Omit<Daily, 'id'>>({
    fecha: new Date().toISOString().split('T')[0],
    sprintId: undefined,
    desarrollos: [],
    bloqueadores: [],
    notas: '',
  });
  const [desarrollos, setDesarrollos] = useState<Desarrollo[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintSeleccionado, setSprintSeleccionado] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDesarrollo, setCurrentDesarrollo] = useState({
    desarrolloId: '',
    trabajoAyer: '',
    trabajoHoy: '',
    tiempoGastado: 0,
  });
  const [currentBloqueador, setCurrentBloqueador] = useState('');

  useEffect(() => {
    loadSprints();
  }, []);

  useEffect(() => {
    if (formData.sprintId) {
      loadDesarrollosDelSprint(formData.sprintId);
      loadSprintSeleccionado(formData.sprintId);
    } else {
      setDesarrollos([]);
      setSprintSeleccionado(null);
      // Limpiar desarrollos seleccionados cuando se cambia el sprint
      setFormData(prev => ({ ...prev, desarrollos: [] }));
    }
  }, [formData.sprintId]);

  const loadDesarrollosDelSprint = async (sprintId: string) => {
    try {
      const sprint = await mockSprintsApi.getById(sprintId);
      const allDesarrollos = await mockDesarrollosApi.getAll();
      // Solo mostrar desarrollos que están en el sprint
      const desarrollosEnSprint = allDesarrollos.filter(d => 
        sprint.desarrollos.includes(d.id)
      );
      setDesarrollos(desarrollosEnSprint);
    } catch (err) {
      console.error('Error al cargar desarrollos del sprint:', err);
      setDesarrollos([]);
    }
  };

  const loadSprintSeleccionado = async (sprintId: string) => {
    try {
      const sprint = await mockSprintsApi.getById(sprintId);
      setSprintSeleccionado(sprint);
    } catch (err) {
      console.error('Error al cargar sprint:', err);
      setSprintSeleccionado(null);
    }
  };

  const loadSprints = async () => {
    try {
      const data = await mockSprintsApi.getAll();
      setSprints(data);
    } catch (err) {
      console.error('Error al cargar sprints:', err);
    }
  };

  const handleAddDesarrollo = () => {
    if (currentDesarrollo.desarrolloId && currentDesarrollo.trabajoHoy) {
      setFormData({
        ...formData,
        desarrollos: [...formData.desarrollos, { ...currentDesarrollo }],
      });
      setCurrentDesarrollo({
        desarrolloId: '',
        trabajoAyer: '',
        trabajoHoy: '',
        tiempoGastado: 0,
      });
    }
  };

  const handleRemoveDesarrollo = (index: number) => {
    setFormData({
      ...formData,
      desarrollos: formData.desarrollos.filter((_, i) => i !== index),
    });
  };

  const handleAddBloqueador = () => {
    if (currentBloqueador.trim()) {
      setFormData({
        ...formData,
        bloqueadores: [...formData.bloqueadores, currentBloqueador.trim()],
      });
      setCurrentBloqueador('');
    }
  };

  const handleRemoveBloqueador = (index: number) => {
    setFormData({
      ...formData,
      bloqueadores: formData.bloqueadores.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await mockDailiesApi.create(formData);
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        sprintId: undefined,
        desarrollos: [],
        bloqueadores: [],
        notas: '',
      });
      setCurrentDesarrollo({
        desarrolloId: '',
        trabajoAyer: '',
        trabajoHoy: '',
        tiempoGastado: 0,
      });
      setCurrentBloqueador('');
      onSuccess();
    } catch (err) {
      setError('Error al crear la daily');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDesarrolloNombre = (desarrolloId: string) => {
    const desarrollo = desarrollos.find(d => d.id === desarrolloId);
    return desarrollo ? desarrollo.titulo : `ID: ${desarrolloId}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-slideIn">
      <div className="mb-6 flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Daily</h2>
          <p className="text-sm text-gray-500 mt-1">Registra el progreso del día</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              id="fecha"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="sprintId" className="block text-sm font-medium text-gray-700 mb-1">
              Sprint *
            </label>
            <select
              id="sprintId"
              required
              value={formData.sprintId || ''}
              onChange={(e) => setFormData({ ...formData, sprintId: e.target.value || undefined, desarrollos: [] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Seleccionar sprint</option>
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.nombre}
                </option>
              ))}
            </select>
            {sprintSeleccionado && (
              <p className="text-xs text-gray-500 mt-1">
                Sprint: {sprintSeleccionado.nombre} - {desarrollos.length} desarrollo{desarrollos.length !== 1 ? 's' : ''} disponible{desarrollos.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {!formData.sprintId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Selecciona un sprint primero</strong> para ver los desarrollos disponibles.
            </p>
          </div>
        )}

        {formData.sprintId && desarrollos.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ No hay desarrollos en este sprint.</strong> Agrega desarrollos al sprint antes de crear una daily.
            </p>
          </div>
        )}

        {formData.sprintId && desarrollos.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Agregar Desarrollo del Sprint
            </h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desarrollo *
                </label>
                <select
                  value={currentDesarrollo.desarrolloId}
                  onChange={(e) =>
                    setCurrentDesarrollo({ ...currentDesarrollo, desarrolloId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar desarrollo</option>
                  {desarrollos
                    .filter(dev => !formData.desarrollos.some(d => d.desarrolloId === dev.id))
                    .map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.titulo}
                      </option>
                    ))}
                </select>
                {formData.desarrollos.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {desarrollos.length - formData.desarrollos.length} desarrollo{desarrollos.length - formData.desarrollos.length !== 1 ? 's' : ''} disponible{desarrollos.length - formData.desarrollos.length !== 1 ? 's' : ''} del sprint
                  </p>
                )}
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trabajo de Ayer
              </label>
              <textarea
                rows={2}
                value={currentDesarrollo.trabajoAyer}
                onChange={(e) =>
                  setCurrentDesarrollo({ ...currentDesarrollo, trabajoAyer: e.target.value })
                }
                placeholder="¿Qué hiciste ayer?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trabajo de Hoy *
              </label>
              <textarea
                rows={2}
                required
                value={currentDesarrollo.trabajoHoy}
                onChange={(e) =>
                  setCurrentDesarrollo({ ...currentDesarrollo, trabajoHoy: e.target.value })
                }
                placeholder="¿Qué harás hoy?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiempo Gastado (minutos)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={currentDesarrollo.tiempoGastado / 60}
                onChange={(e) =>
                  setCurrentDesarrollo({
                    ...currentDesarrollo,
                    tiempoGastado: parseInt(e.target.value) * 60 || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>

            <button
              type="button"
              onClick={handleAddDesarrollo}
              disabled={!currentDesarrollo.desarrolloId || !currentDesarrollo.trabajoHoy || formData.desarrollos.some(d => d.desarrolloId === currentDesarrollo.desarrolloId)}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              + Agregar Desarrollo
            </button>
          </div>

          {formData.desarrollos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Desarrollos agregados ({formData.desarrollos.length}):
              </p>
              <div className="space-y-2">
                {formData.desarrollos.map((dev, index) => (
                  <div key={index} className="bg-blue-50 border-l-4 border-blue-500 rounded p-3 flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {getDesarrolloNombre(dev.desarrolloId)}
                      </h4>
                      {dev.trabajoAyer && (
                        <p className="text-xs text-gray-600 mb-1">
                          <span className="font-medium">Ayer:</span> {dev.trabajoAyer.substring(0, 60)}...
                        </p>
                      )}
                      <p className="text-xs text-gray-700">
                        <span className="font-medium">Hoy:</span> {dev.trabajoHoy.substring(0, 60)}...
                      </p>
                      {dev.tiempoGastado > 0 && (
                        <p className="text-xs text-primary-600 mt-1 font-medium">
                          ⏱️ {formatTime(dev.tiempoGastado)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDesarrollo(index)}
                      className="ml-3 text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Bloqueadores
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={currentBloqueador}
              onChange={(e) => setCurrentBloqueador(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddBloqueador();
                }
              }}
              placeholder="Escribe un bloqueador y presiona Enter o haz clic en Agregar"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={handleAddBloqueador}
              disabled={!currentBloqueador.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Agregar
            </button>
          </div>
          {formData.bloqueadores.length > 0 ? (
            <div className="space-y-2">
              {formData.bloqueadores.map((bloqueador, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-500 pl-4 pr-4 py-2 rounded-r-lg flex justify-between items-center">
                  <p className="text-sm text-gray-800 font-medium">{bloqueador}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveBloqueador(index)}
                    className="ml-3 text-red-600 hover:text-red-800"
                    title="Eliminar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded p-3">No hay bloqueadores</p>
          )}
        </div>

        <div>
          <label htmlFor="notas" className="block text-sm font-medium text-gray-700 mb-1">
            Notas Adicionales
          </label>
          <textarea
            id="notas"
            rows={3}
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            placeholder="Notas adicionales sobre la daily..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || !formData.sprintId || formData.desarrollos.length === 0}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </>
            ) : (
              <>
                <span className="mr-2">✓</span>
                Crear Daily
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
