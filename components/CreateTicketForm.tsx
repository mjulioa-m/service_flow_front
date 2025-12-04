'use client';

import { useState } from 'react';
import { mockTicketsApi, Ticket } from '@/lib/mockData';

type CreateTicketDto = Omit<Ticket, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

interface CreateTicketFormProps {
  onSuccess: () => void;
}

export default function CreateTicketForm({ onSuccess }: CreateTicketFormProps) {
  const [formData, setFormData] = useState<CreateTicketDto>({
    titulo: '',
    descripcion: '',
    estado: 'NUEVO',
    prioridad: 'MEDIA',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await mockTicketsApi.create(formData);
      setFormData({
        titulo: '',
        descripcion: '',
        estado: 'NUEVO',
        prioridad: 'MEDIA',
      });
      onSuccess();
    } catch (err) {
      setError('Error al crear el ticket');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Ticket</h2>
        <p className="text-sm text-gray-500 mt-1">Completa el formulario para crear un nuevo ticket de soporte</p>
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
                setFormData({ ...formData, estado: e.target.value as 'NUEVO' | 'EN_CURSO' | 'CERRADO' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="NUEVO">NUEVO</option>
              <option value="EN_CURSO">EN_CURSO</option>
              <option value="CERRADO">CERRADO</option>
            </select>
          </div>

          <div>
            <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 mb-1">
              Prioridad
            </label>
            <select
              id="prioridad"
              value={formData.prioridad}
              onChange={(e) =>
                setFormData({ ...formData, prioridad: e.target.value as 'BAJA' | 'MEDIA' | 'ALTA' })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="BAJA">BAJA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="ALTA">ALTA</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                Crear Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

