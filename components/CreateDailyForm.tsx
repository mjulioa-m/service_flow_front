'use client';

import { useState, useEffect } from 'react';
import { mockDailiesApi, mockDesarrollosApi, Daily, Desarrollo } from '@/lib/mockData';

interface CreateDailyFormProps {
  onSuccess: () => void;
}

export default function CreateDailyForm({ onSuccess }: CreateDailyFormProps) {
  const [formData, setFormData] = useState<Omit<Daily, 'id'>>({
    fecha: new Date().toISOString().split('T')[0],
    sprintId: '',
    desarrollos: [],
    bloqueadores: [],
    notas: '',
  });
  const [desarrollos, setDesarrollos] = useState<Desarrollo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDesarrollo, setCurrentDesarrollo] = useState({
    desarrolloId: '',
    trabajoAyer: '',
    trabajoHoy: '',
    tiempoGastado: 0,
  });

  useEffect(() => {
    loadDesarrollos();
  }, []);

  const loadDesarrollos = async () => {
    try {
      const data = await mockDesarrollosApi.getAll();
      setDesarrollos(data);
    } catch (err) {
      console.error('Error al cargar desarrollos:', err);
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

  const handleAddBloqueador = () => {
    const bloqueador = prompt('Agregar bloqueador:');
    if (bloqueador) {
      setFormData({
        ...formData,
        bloqueadores: [...formData.bloqueadores, bloqueador],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await mockDailiesApi.create(formData);
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        sprintId: '',
        desarrollos: [],
        bloqueadores: [],
        notas: '',
      });
      onSuccess();
    } catch (err) {
      setError('Error al crear la daily');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Crear Nueva Daily</h2>
        <p className="text-sm text-gray-500 mt-1">Registra el progreso del día</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
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
              Sprint (opcional)
            </label>
            <input
              type="text"
              id="sprintId"
              value={formData.sprintId}
              onChange={(e) => setFormData({ ...formData, sprintId: e.target.value })}
              placeholder="ID del Sprint"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Agregar Desarrollo</h3>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desarrollo
              </label>
              <select
                value={currentDesarrollo.desarrolloId}
                onChange={(e) =>
                  setCurrentDesarrollo({ ...currentDesarrollo, desarrolloId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleccionar desarrollo</option>
                {desarrollos.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.titulo}
                  </option>
                ))}
              </select>
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
                value={currentDesarrollo.tiempoGastado / 60}
                onChange={(e) =>
                  setCurrentDesarrollo({
                    ...currentDesarrollo,
                    tiempoGastado: parseInt(e.target.value) * 60 || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              type="button"
              onClick={handleAddDesarrollo}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              + Agregar Desarrollo
            </button>
          </div>

          {formData.desarrollos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Desarrollos agregados ({formData.desarrollos.length}):
              </p>
              <div className="space-y-2">
                {formData.desarrollos.map((dev, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                    Dev #{dev.desarrolloId} - {dev.trabajoHoy.substring(0, 50)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Bloqueadores
            </label>
            <button
              type="button"
              onClick={handleAddBloqueador}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              + Agregar
            </button>
          </div>
          {formData.bloqueadores.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 bg-red-50 border border-red-200 rounded p-3">
              {formData.bloqueadores.map((bloqueador, index) => (
                <li key={index} className="text-sm text-gray-700">{bloqueador}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No hay bloqueadores</p>
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
            disabled={loading}
            className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Daily'}
          </button>
        </div>
      </form>
    </div>
  );
}

