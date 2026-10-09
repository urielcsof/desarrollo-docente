import React from 'react';
import { 
  GraduationCap, 
  FileSpreadsheet, 
  UserPlus, 
  Database, 
  BarChart3, 
  Users, 
  Layers, 
  BookPlus, 
  Shield, 
  UserCheck, 
  LogOut 
} from 'lucide-react';
import { Usuario } from '../types/database';

interface HeaderProps {
  activeTab: 'malla' | 'directorio' | 'analitica' | 'gestion';
  setActiveTab: (tab: 'malla' | 'directorio' | 'analitica' | 'gestion') => void;
  currentUser: Usuario;
  onOpenUserManagement: () => void;
  onOpenNewLicenciatura: () => void;
  onOpenNewProfessor: () => void;
  onOpenDatabaseManager: () => void;
  onExportCSV: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenUserManagement,
  onOpenNewLicenciatura,
  onOpenNewProfessor,
  onOpenDatabaseManager,
  onExportCSV,
  onLogout,
}) => {
  const isAdmin = currentUser.rol === 'administrador';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                SIAC Académico
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-normal">
                Control y Asignación Docente
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('malla')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'malla'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Asignación por Grupos</span>
            </button>

            <button
              onClick={() => setActiveTab('directorio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'directorio'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Directorio Docente</span>
            </button>

            <button
              onClick={() => setActiveTab('analitica')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'analitica'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analítica y Reportes</span>
            </button>

            <button
              onClick={() => setActiveTab('gestion')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'gestion'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Administrar BD</span>
            </button>
          </nav>

          {/* Zone 3: Actions & User Session Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Altas rápidas: Carrera y Docente */}
            <button
              onClick={onOpenNewLicenciatura}
              title="Dar de alta una nueva Licenciatura o Carrera"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
            >
              <BookPlus className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">+ Carrera</span>
            </button>

            <button
              onClick={onOpenNewProfessor}
              title="Dar de alta un nuevo Maestro o Docente"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">+ Maestro</span>
            </button>

            <button
              onClick={onExportCSV}
              title="Descargar matriz en formato CSV para Excel"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            {/* User Session Button with Role Indicator */}
            <button
              onClick={onOpenUserManagement}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors shadow-2xs ${
                isAdmin
                  ? 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
              }`}
              title="Gestión de usuarios y permisos (Clic para cambiar usuario)"
            >
              {isAdmin ? (
                <Shield className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
              <span className="font-bold font-mono truncate max-w-[80px] sm:max-w-none">
                {currentUser.username}
              </span>
              <span
                className={`hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                  isAdmin ? 'bg-purple-200/70 text-purple-800' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isAdmin ? 'ADMIN' : 'COORDINADOR'}
              </span>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
              title="Cerrar sesión e ir a pantalla de inicio"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Subnavigation */}
        <div className="flex lg:hidden items-center justify-between py-2 border-t border-slate-100 overflow-x-auto text-xs gap-1">
          <button
            onClick={() => setActiveTab('malla')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'malla' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Asignación
          </button>
          <button
            onClick={() => setActiveTab('directorio')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'directorio' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Directorio Docente
          </button>
          <button
            onClick={() => setActiveTab('analitica')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'analitica' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Analítica
          </button>
          <button
            onClick={() => setActiveTab('gestion')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap ${
              activeTab === 'gestion' ? 'bg-slate-900 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Base de Datos
          </button>
        </div>
      </div>
    </header>
  );
};
