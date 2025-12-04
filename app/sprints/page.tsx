'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mockSprintsApi, Sprint } from '@/lib/mockData';
import CreateSprintForm from '@/components/CreateSprintForm';

export default function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSprints();
  }, []);

  // Recargar cuando se elimina un sprint
  useEffect(() => {
    const handleSprintDelete = () => {
      loadSprints();
    };
    
    window.addEventListener('sprintDeleted', handleSprintDelete);
    
    return () => {
      window.removeEventListener('sprintDeleted', handleSprintDelete);
    };
  }, []);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const data = await mockSprintsApi.getAll();
      setSprints(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los sprints');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSprintCreated = () => {
    setShowForm(false);
    loadSprints();
  };

  const handleDeleteSprint = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el sprint "${nombre}"?\n\nLos desarrollos asociados se desasignarán del sprint pero no se eliminarán.`)) {
      return;
    }

    try {
      await mockSprintsApi.delete(id);
      loadSprints();
    } catch (err) {
      setError('Error al eliminar el sprint');
      console.error(err);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PLANIFICADO':
        return 'bg-gray-100 text-gray-800';
      case 'EN_CURSO':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETADO':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sprints</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona tus sprints y organiza el trabajo en iteraciones
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            {showForm ? (
              <>
                <span className="mr-2">✕</span>
                Cancelar
              </>
            ) : (
              <>
                <span className="mr-2">+</span>
                Nuevo Sprint
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <CreateSprintForm onSuccess={handleSprintCreated} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Cargando sprints...</p>
          </div>
        </div>
      ) : sprints.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <span className="text-6xl mb-4 block">🏃</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sprints</h3>
          <p className="text-gray-600 mb-4">Comienza creando tu primer sprint</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <span className="mr-2">+</span>
              Crear Primer Sprint
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Sprint
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Desarrollos
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sprints
                  .sort((a, b) => {
                    // Ordenar por estado (EN_CURSO primero, luego PLANIFICADO, luego COMPLETADO)
                    const estadoOrder = { 'EN_CURSO': 0, 'PLANIFICADO': 1, 'COMPLETADO': 2 };
                    const estadoDiff = (estadoOrder[a.estado] || 3) - (estadoOrder[b.estado] || 3);
                    if (estadoDiff !== 0) return estadoDiff;
                    // Si mismo estado, ordenar por fecha de inicio (más reciente primero)
                    return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
                  })
                  .map((sprint, index) => (
                    <tr
                      key={sprint.id}
                      className="hover:bg-gray-50 transition-colors animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/sprints/${sprint.id}`}
                            className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {sprint.nombre}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1 max-w-md">
                            {sprint.descripcion}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                            sprint.estado,
                          )}`}
                        >
                          {sprint.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-gray-900">{formatDate(sprint.fechaInicio)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-900">{formatDate(sprint.fechaFin)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <span className="font-semibold text-gray-900">{sprint.desarrollos.length}</span>
                          <span className="text-gray-500 ml-1">desarrollo{sprint.desarrollos.length !== 1 ? 's' : ''}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/sprints/${sprint.id}`}
                            className="text-primary-600 hover:text-primary-900 font-semibold"
                          >
                            Gestionar
                          </Link>
                          <button
                            onClick={() => handleDeleteSprint(sprint.id, sprint.nombre)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Eliminar sprint"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

