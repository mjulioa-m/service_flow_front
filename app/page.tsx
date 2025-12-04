'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { mockDesarrollosApi } from '@/lib/mockData';

export default function Home() {
  const [totalHoras, setTotalHoras] = useState(0);
  const [totalDesarrollos, setTotalDesarrollos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Recargar cuando se actualiza un desarrollo
    const handleUpdate = () => {
      loadStats();
    };
    
    window.addEventListener('desarrolloUpdated', handleUpdate);
    window.addEventListener('desarrolloDeleted', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    
    return () => {
      window.removeEventListener('desarrolloUpdated', handleUpdate);
      window.removeEventListener('desarrolloDeleted', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const loadStats = async () => {
    try {
      const desarrollos = await mockDesarrollosApi.getAll();
      const total = desarrollos.reduce((sum, d) => sum + d.tiempoGastado, 0);
      setTotalHoras(total);
      setTotalDesarrollos(desarrollos.length);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
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

  const totalHorasDecimal = (totalHoras / 3600).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Contador Total de Horas */}
      <div className="mb-12 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl shadow-2xl p-8 text-white animate-fadeIn">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-primary-100 mb-2">Total de Horas Trabajadas</p>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <>
              <p className="text-6xl font-bold mb-2">{totalHorasDecimal}h</p>
              <p className="text-xl text-primary-100">{formatTime(totalHoras)}</p>
            </>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white border-opacity-20">
          <div className="text-center">
            <p className="text-sm text-primary-100 mb-1">Desarrollos</p>
            <p className="text-3xl font-bold">{totalDesarrollos}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-primary-100 mb-1">Promedio por Desarrollo</p>
            <p className="text-3xl font-bold">
              {totalDesarrollos > 0 ? (totalHoras / totalDesarrollos / 3600).toFixed(1) : '0'}h
            </p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Bienvenido a</span>
          <span className="block text-primary-600">ServiceFlow</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Sistema de seguimiento de desarrollos. Gestiona sprints, dailies y rastrea el tiempo de trabajo de manera eficiente.
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 gap-4">
          <div className="rounded-md shadow">
            <Link
              href="/desarrollos"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors"
            >
              Ver Desarrollos
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="-mt-6">
                <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md">
                  <span className="text-3xl">💻</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Desarrollos</h3>
                <p className="mt-2 text-base text-gray-500">
                  Gestiona y rastrea el progreso de tus desarrollos con temporizador integrado.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="-mt-6">
                <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md">
                  <span className="text-3xl">⏱️</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Temporizador</h3>
                <p className="mt-2 text-base text-gray-500">
                  Registra el tiempo gastado en cada desarrollo de forma manual y precisa.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="-mt-6">
                <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md">
                  <span className="text-3xl">🏃</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Sprints</h3>
                <p className="mt-2 text-base text-gray-500">
                  Organiza el trabajo en sprints y gestiona iteraciones de desarrollo.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="-mt-6">
                <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-md">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Dailies</h3>
                <p className="mt-2 text-base text-gray-500">
                  Facilita las reuniones diarias con seguimiento estructurado del progreso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

