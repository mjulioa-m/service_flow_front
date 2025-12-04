'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockDailiesApi, mockSprintsApi, Daily, Sprint } from '@/lib/mockData';
import CreateDailyForm from '@/components/CreateDailyForm';

export default function DailiesPage() {
  const router = useRouter();
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadDailies();
    loadSprints();
  }, []);

  const loadDailies = async () => {
    try {
      setLoading(true);
      const data = await mockDailiesApi.getAll();
      setDailies(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los dailies');
      console.error(err);
    } finally {
      setLoading(false);
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

  const handleDailyCreated = () => {
    setShowForm(false);
    loadDailies();
  };

  const handleDeleteDaily = async (id: string, fecha: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la daily del ${formatDate(fecha)}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await mockDailiesApi.delete(id);
      loadDailies();
    } catch (err) {
      setError('Error al eliminar la daily');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getSprintNombre = (sprintId?: string) => {
    if (!sprintId) return null;
    const sprint = sprints.find(s => s.id === sprintId);
    return sprint ? sprint.nombre : null;
  };

  // Agrupar dailies por sprint
  const dailiesPorSprint = dailies.reduce((acc, daily) => {
    const sprintKey = daily.sprintId || 'sin-sprint';
    if (!acc[sprintKey]) {
      acc[sprintKey] = [];
    }
    acc[sprintKey].push(daily);
    return acc;
  }, {} as Record<string, Daily[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dailies</h1>
            <p className="mt-2 text-sm text-gray-600">
              Entregas diarias de los desarrollos del sprint
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
                Nueva Daily
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-8">
          <CreateDailyForm onSuccess={handleDailyCreated} />
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
            <p className="text-gray-600">Cargando dailies...</p>
          </div>
        </div>
      ) : dailies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <span className="text-6xl mb-4 block">📅</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay dailies</h3>
          <p className="text-gray-600 mb-4">Comienza creando tu primera daily</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <span className="mr-2">+</span>
              Crear Primera Daily
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(dailiesPorSprint)
            .sort(([a], [b]) => {
              if (a === 'sin-sprint') return 1;
              if (b === 'sin-sprint') return -1;
              return 0;
            })
            .map(([sprintKey, dailiesDelSprint]) => {
              const sprintId = sprintKey === 'sin-sprint' ? null : sprintKey;
              const sprintNombre = sprintId ? getSprintNombre(sprintId) : null;
              
              return (
                <div key={sprintKey} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 border-b border-primary-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {sprintNombre ? (
                          <Link
                            href={`/sprints/${sprintId}`}
                            className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {sprintNombre}
                          </Link>
                        ) : (
                          <h2 className="text-xl font-bold text-gray-900">Sin Sprint</h2>
                        )}
                        <span className="ml-3 px-3 py-1 text-xs font-semibold rounded-full bg-primary-200 text-primary-800">
                          {dailiesDelSprint.length} daily{dailiesDelSprint.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dailiesDelSprint
                        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                        .map((daily) => (
                          <div
                            key={daily.id}
                            className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center mb-2">
                                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatDate(daily.fecha)}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteDaily(daily.id, daily.fecha)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Eliminar daily"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-center text-sm">
                                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span className="font-semibold text-gray-900">{daily.desarrollos.length}</span>
                                <span className="text-gray-500 ml-1">desarrollo{daily.desarrollos.length !== 1 ? 's' : ''}</span>
                              </div>

                              {daily.bloqueadores.length > 0 && (
                                <div className="flex items-center text-sm">
                                  <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  <span className="font-semibold text-red-600">{daily.bloqueadores.length}</span>
                                  <span className="text-gray-500 ml-1">bloqueador{daily.bloqueadores.length !== 1 ? 'es' : ''}</span>
                                </div>
                              )}

                              <div className="flex items-center text-sm">
                                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-700">
                                  {formatTime(daily.desarrollos.reduce((sum, d) => sum + d.tiempoGastado, 0))}
                                </span>
                              </div>
                            </div>

                            {daily.notas && (
                              <p className="text-xs text-gray-600 line-clamp-2 mb-4 bg-gray-50 p-2 rounded">
                                {daily.notas}
                              </p>
                            )}

                            <Link
                              href={`/dailies/${daily.id}`}
                              className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              Ver detalles
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
