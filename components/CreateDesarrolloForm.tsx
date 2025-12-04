'use client';

import { useState } from 'react';
import { mockDesarrollosApi, Desarrollo } from '@/lib/mockData';

interface CreateDesarrolloFormProps {
  onSuccess: () => void;
}

export default function CreateDesarrolloForm({ onSuccess }: CreateDesarrolloFormProps) {
  const [formData, setFormData] = useState<Omit<Desarrollo, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'tiempoGastado'>>({
    titulo: '',
    descripcion: '',
    estado: 'PENDIENTE',
    horasEstimadas: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await mockDesarrollosApi.create(formData);
      setFormData({
        titulo: '',
        descripcion: '',
        estado: 'PENDIENTE',
        horasEstimadas: 0,
      });
      onSuccess();
    } catch (err) {
      setError('Error al crear el desarrollo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 animate-slideIn">
      <div className="mb-6 flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Desarrollo</h2>
          <p className="text-sm text-gray-500 mt-1">Completa el formulario para crear un nuevo desarrollo</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            id="titulo"
            required
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            required
            rows={4}
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value as Desarrollo['estado'] })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="EN_DESARROLLO">EN_DESARROLLO</option>
              <option value="EN_REVISION">EN_REVISION</option>
              <option value="COMPLETADO">COMPLETADO</option>
            </select>
          </div>

          <div>
            <label htmlFor="horasEstimadas" className="block text-sm font-medium text-gray-700 mb-1">
              Horas Estimadas
            </label>
            <input
              type="number"
              id="horasEstimadas"
              min="0"
              step="0.5"
              value={formData.horasEstimadas}
              onChange={(e) =>
                setFormData({ ...formData, horasEstimadas: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: 8"
            />
            <p className="text-xs text-gray-500 mt-1">Tiempo estimado para completar el desarrollo</p>
          </div>
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
                Crear Desarrollo
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

