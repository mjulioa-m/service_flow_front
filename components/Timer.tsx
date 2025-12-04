'use client';

import { useState, useEffect, useRef } from 'react';
import { mockDesarrollosApi } from '@/lib/mockData';

interface TimerProps {
  desarrolloId: string;
  tiempoGastado: number;
  onTimeUpdate: (seconds: number) => void;
}

export default function Timer({ desarrolloId, tiempoGastado, onTimeUpdate }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const newElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsed(newElapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, elapsed]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = async () => {
    setIsRunning(false);
    if (elapsed > 0) {
      await mockDesarrollosApi.addTime(desarrolloId, elapsed);
      const newTotalTime = tiempoGastado + elapsed;
      onTimeUpdate(newTotalTime);
      setElapsed(0);
      startTimeRef.current = null;
      
      // Disparar evento personalizado para notificar a otras páginas
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('desarrolloUpdated', { 
          detail: { desarrolloId, tiempoGastado: newTotalTime } 
        }));
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    startTimeRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = tiempoGastado + elapsed;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Temporizador</h3>
      </div>
      
      <div className="space-y-6">
        <div className="text-center bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border-2 border-primary-200 overflow-hidden">
          <div className={`text-4xl sm:text-5xl font-mono font-bold mb-2 transition-all break-words ${isRunning ? 'text-primary-600 animate-pulse' : 'text-gray-700'}`}>
            {formatTime(elapsed)}
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
            {isRunning ? '⏱️ En ejecución' : '⏸️ Detenido'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Tiempo total:</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900 font-mono whitespace-nowrap">{formatTime(totalTime)}</span>
          </div>
        </div>

        <div className="space-y-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Iniciar
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-105 flex items-center justify-center shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pausar
            </button>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleStop}
              disabled={elapsed === 0}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-lg"
            >
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Guardar
            </button>
            
            <button
              onClick={handleReset}
              disabled={elapsed === 0}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

