'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockSprintsApi, mockDesarrollosApi, mockDailiesApi, Sprint, Desarrollo, Daily } from '@/lib/mockData';

export default function SprintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = params.id as string;

  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [desarrollos, setDesarrollos] = useState<Desarrollo[]>([]);
  const [desarrollosDisponibles, setDesarrollosDisponibles] = useState<Desarrollo[]>([]);
  const [dailies, setDailies] = useState<Daily[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sprintId) {
      loadSprint();
      loadDesarrollos();
      loadDailies();
    }
  }, [sprintId]);

  const loadSprint = async () => {
    try {
      setLoading(true);
      const data = await mockSprintsApi.getById(sprintId);
      setSprint(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el sprint');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDesarrollos = async () => {
    try {
      const allDesarrollos = await mockDesarrollosApi.getAll();
      const sprintData = await mockSprintsApi.getById(sprintId);
      
      // Desarrollos que están en el sprint
      const desarrollosEnSprint = allDesarrollos.filter(d => 
        sprintData.desarrollos.includes(d.id)
      );
      setDesarrollos(desarrollosEnSprint);
      
      // Desarrollos disponibles: todos los desarrollos que no están en este sprint
      // (pueden estar en otro sprint o sin sprint)
      setDesarrollosDisponibles(allDesarrollos);
    } catch (err) {
      console.error('Error al cargar desarrollos:', err);
    }
  };

  const loadDailies = async () => {
    try {
      const dailiesData = await mockDailiesApi.getBySprint(sprintId);
      setDailies(dailiesData);
    } catch (err) {
      console.error('Error al cargar dailies:', err);
    }
  };

  const handleAddDesarrollo = async (desarrolloId: string) => {
    try {
      // Obtener el desarrollo actual para ver si está en otro sprint
      const desarrolloActual = await mockDesarrollosApi.getById(desarrolloId);
      
      // Si el desarrollo está en otro sprint, removerlo de ese sprint primero
      if (desarrolloActual.sprintId && desarrolloActual.sprintId !== sprintId) {
        const otroSprint = await mockSprintsApi.getById(desarrolloActual.sprintId);
        await mockSprintsApi.update(desarrolloActual.sprintId, {
          desarrollos: otroSprint.desarrollos.filter(id => id !== desarrolloId),
        });
      }
      
      // Actualizar el desarrollo para asignarlo al sprint actual
      await mockDesarrollosApi.update(desarrolloId, { sprintId });
      
      // Actualizar el sprint para incluir el desarrollo
      const updatedSprint = await mockSprintsApi.getById(sprintId);
      if (!updatedSprint.desarrollos.includes(desarrolloId)) {
        await mockSprintsApi.update(sprintId, {
          desarrollos: [...updatedSprint.desarrollos, desarrolloId],
        });
      }
      
      loadDesarrollos();
      loadSprint();
    } catch (err) {
      console.error('Error al agregar desarrollo:', err);
      setError('Error al agregar el desarrollo al sprint');
    }
  };

  const handleRemoveDesarrollo = async (desarrolloId: string) => {
    try {
      // Remover el sprintId del desarrollo
      await mockDesarrollosApi.update(desarrolloId, { sprintId: undefined });
      
      // Remover del array de desarrollos del sprint
      const updatedSprint = await mockSprintsApi.getById(sprintId);
      await mockSprintsApi.update(sprintId, {
        desarrollos: updatedSprint.desarrollos.filter(id => id !== desarrolloId),
      });
      
      loadDesarrollos();
      loadSprint();
    } catch (err) {
      console.error('Error al remover desarrollo:', err);
    }
  };

  const handleDeleteSprint = async () => {
    if (!sprint) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar el sprint "${sprint.nombre}"?\n\nLos desarrollos asociados se desasignarán del sprint pero no se eliminarán.`)) {
      return;
    }

    try {
      await mockSprintsApi.delete(sprintId);
      router.push('/sprints');
    } catch (err) {
      setError('Error al eliminar el sprint');
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
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
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

  const getDesarrolloEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-gray-100 text-gray-800';
      case 'EN_SOPORTE':
        return 'bg-blue-100 text-blue-800';
      case 'ENTREGADO_AL_CLIENTE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Cargando sprint...</p>
        </div>
      </div>
    );
  }

  if (error || !sprint) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/sprints" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <span className="mr-2">←</span>
          Volver a sprints
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{error || 'Sprint no encontrado'}</p>
        </div>
      </div>
    );
  }

  const totalHorasEstimadas = desarrollos.reduce((sum, d) => sum + d.horasEstimadas, 0);
  const totalHorasGastadas = desarrollos.reduce((sum, d) => sum + d.tiempoGastado / 3600, 0);
  const desarrollosNoEnSprint = desarrollosDisponibles.filter(d => !sprint.desarrollos.includes(d.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/sprints" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <span className="mr-2">←</span>
          Volver a sprints
        </Link>
        <button
          onClick={handleDeleteSprint}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all transform hover:scale-105"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar Sprint
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{sprint.nombre}</h1>
            <p className="text-gray-600 mb-4">{sprint.descripcion}</p>
            <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full ${getEstadoColor(sprint.estado)}`}>
              {sprint.estado}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">Inicio</p>
                <p className="text-lg font-bold text-gray-900">{formatDate(sprint.fechaInicio)}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">Fin</p>
                <p className="text-lg font-bold text-gray-900">{formatDate(sprint.fechaFin)}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">Desarrollos</p>
                <p className="text-lg font-bold text-gray-900">{desarrollos.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-medium text-gray-700 mb-1">Horas Estimadas</p>
            <p className="text-2xl font-bold text-blue-900">{totalHorasEstimadas}h</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-sm font-medium text-gray-700 mb-1">Horas Gastadas</p>
            <p className="text-2xl font-bold text-green-900">{totalHorasGastadas.toFixed(1)}h</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Desarrollos en el Sprint ({desarrollos.length})
            </h2>

            {desarrollos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <p className="text-gray-600">No hay desarrollos en este sprint</p>
                <p className="text-sm text-gray-400 mt-1">Agrega desarrollos desde el panel lateral</p>
              </div>
            ) : (
              <div className="space-y-4">
                {desarrollos.map((desarrollo) => (
                  <div
                    key={desarrollo.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <Link
                          href={`/desarrollos/${desarrollo.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {desarrollo.titulo}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{desarrollo.descripcion}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveDesarrollo(desarrollo.id)}
                        className="ml-4 text-red-600 hover:text-red-700 transition-colors"
                        title="Remover del sprint"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDesarrolloEstadoColor(desarrollo.estado)}`}>
                        {desarrollo.estado}
                      </span>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Estimado: </span>
                          <span className="font-semibold text-gray-900">{desarrollo.horasEstimadas}h</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Gastado: </span>
                          <span className="font-semibold text-primary-600">{formatTime(desarrollo.tiempoGastado)}</span>
                        </div>
                      </div>
                    </div>

                    {desarrollo.horasEstimadas > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            desarrollo.tiempoGastado / 3600 > desarrollo.horasEstimadas
                              ? 'bg-red-500'
                              : desarrollo.tiempoGastado / 3600 > desarrollo.horasEstimadas * 0.8
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(100, ((desarrollo.tiempoGastado / 3600) / desarrollo.horasEstimadas) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Dailies ({dailies.length})
            </h2>
            <Link
              href="/dailies"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <span className="mr-2">+</span>
              Nueva Daily
            </Link>
          </div>

          {dailies.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
              <p className="text-gray-600 font-medium">No hay dailies para este sprint</p>
              <p className="text-sm text-gray-400 mt-1">Crea una daily para registrar el progreso diario</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dailies
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                .map((daily) => (
                  <Link
                    key={daily.id}
                    href={`/dailies/${daily.id}`}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50"
                  >
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-900">
                        {new Date(daily.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {daily.desarrollos.length} desarrollo{daily.desarrollos.length !== 1 ? 's' : ''}
                      </div>
                      {daily.bloqueadores.length > 0 && (
                        <div className="flex items-center text-red-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          {daily.bloqueadores.length} bloqueador{daily.bloqueadores.length !== 1 ? 'es' : ''}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Agregar Desarrollos</h3>
            
            {desarrollosNoEnSprint.length === 0 ? (
              <p className="text-sm text-gray-500">No hay desarrollos disponibles</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {desarrollosNoEnSprint.map((desarrollo) => (
                  <div
                    key={desarrollo.id}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-gray-900 mb-1">{desarrollo.titulo}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{desarrollo.horasEstimadas}h estimadas</span>
                      {desarrollo.sprintId && desarrollo.sprintId !== sprintId && (
                        <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          En otro sprint
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddDesarrollo(desarrollo.id)}
                      className="w-full px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {desarrollo.sprintId && desarrollo.sprintId !== sprintId ? 'Mover a este sprint' : '+ Agregar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

