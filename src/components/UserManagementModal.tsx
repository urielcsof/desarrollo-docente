import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  UserPlus, 
  Trash2, 
  AlertTriangle,
  Lock,
  Unlock,
  Check
} from 'lucide-react';
import { DatabaseState, Usuario } from '../types/database';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
  onSwitchUser: (user: Usuario) => void;
  db: DatabaseState;
  onAddUser: (user: Omit<Usuario, 'id'>) => void;
  onDeleteUser: (userId: string) => void;
  onLogout?: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  db,
  onAddUser,
  onDeleteUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'directory' | 'new_user'>('login');

  // Form login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Form nuevo usuario
  const [newUsername, setNewUsername] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newCorreo, setNewCorreo] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRol, setNewRol] = useState<'administrador' | 'coordinador'>('coordinador');
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const user = db.usuarios.find(
      (u) =>
        u.username.toUpperCase() === loginUsername.trim().toUpperCase() &&
        u.password === loginPassword
    );

    if (user) {
      onSwitchUser(user);
      setLoginSuccess(`Sesión iniciada correctamente como ${user.nombre}.`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setLoginError('Usuario o contraseña incorrectos. Revisa las credenciales ingresadas.');
    }
  };

  const handleQuickLogin = (username: string, pass: string) => {
    setLoginUsername(username);
    setLoginPassword(pass);
    const user = db.usuarios.find(
      (u) => u.username.toUpperCase() === username.toUpperCase() && u.password === pass
    );
    if (user) {
      onSwitchUser(user);
      setLoginSuccess(`Autenticado como ${user.nombre} (${user.rol.toUpperCase()}).`);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword || !newNombre) return;

    const exists = db.usuarios.some(
      (u) => u.username.toUpperCase() === newUsername.trim().toUpperCase()
    );
    if (exists) {
      setCreateMsg('El nombre de usuario ya está registrado.');
      return;
    }

    onAddUser({
      username: newUsername.trim().toUpperCase(),
      nombre: newNombre.trim(),
      correo: newCorreo.trim() || `${newUsername.toLowerCase()}@universidad.edu.mx`,
      password: newPassword,
      rol: newRol,
    });

    setCreateMsg('Usuario creado exitosamente.');
    setNewUsername('');
    setNewNombre('');
    setNewCorreo('');
    setNewPassword('');
    setTimeout(() => {
      setCreateMsg(null);
      setActiveTab('directory');
    }, 1500);
  };

  const isAdmin = currentUser.rol === 'administrador';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gestión de Usuarios y Accesos
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Sesión activa:</span>
                <strong className="text-slate-900 font-mono">{currentUser.username}</strong>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    isAdmin
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {isAdmin ? 'ADMINISTRADOR (Acceso Total)' : 'COORDINADOR (Consulta y Alta)'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                title="Cerrar sesión activa"
              >
                Cerrar Sesión
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-slate-900 text-slate-900 bg-white rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cambiar Usuario / Login
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'directory'
                ? 'border-slate-900 text-slate-900 bg-white rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Usuarios Registrados ({db.usuarios.length})
          </button>
          <button
            onClick={() => setActiveTab('new_user')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'new_user'
                ? 'border-slate-900 text-slate-900 bg-white rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            + Registrar Usuario
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* TAB 1: LOGIN / CAMBIO DE USUARIO */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Notice of privileges */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-900 mt-0.5 shrink-0" />
                <div className="leading-relaxed">
                  <strong>Políticas de Seguridad:</strong> Todos los usuarios pueden consultar y dar de alta de todo en el sistema. <strong>Únicamente el administrador (URIEL)</strong> tiene facultades para dar de baja o eliminar maestros, licenciaturas y materias.
                </div>
              </div>

              {/* Quick credential buttons */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                <span className="text-xs font-bold text-blue-950 block">
                  Acceso Rápido con Credenciales Maestras:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('URIEL', 'UCHAVEZ')}
                    className="p-2.5 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-purple-900 flex items-center gap-1">
                        <Unlock className="w-3 h-3 text-purple-700" />
                        USUARIO: URIEL
                      </div>
                      <div className="text-[11px] text-purple-700 font-mono">
                        PASS: UCHAVEZ (Admin Total)
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Iniciar
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('COORDINACION', 'COORD2026')}
                    className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                        COORDINACION
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        PASS: COORD2026 (Consulta/Alta)
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Iniciar
                    </span>
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{loginSuccess}</span>
                </div>
              )}

              {/* Form manual */}
              <form onSubmit={handleLogin} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. URIEL"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 uppercase focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: DIRECTORIO DE USUARIOS */}
          {activeTab === 'directory' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500 mb-2">
                Listado de cuentas autorizadas en el sistema académico:
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {db.usuarios.map((u) => {
                  const isUserActive = u.id === currentUser.id;
                  const isUserAdmin = u.rol === 'administrador';

                  return (
                    <div
                      key={u.id}
                      className={`p-3 text-xs flex items-center justify-between transition-colors ${
                        isUserActive ? 'bg-slate-50/80 font-medium' : 'bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-slate-900">
                            {u.username}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              isUserAdmin
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {isUserAdmin ? 'ADMIN' : 'COORDINADOR'}
                          </span>
                          {isUserActive && (
                            <span className="text-[10px] text-emerald-600 font-semibold">
                              (Sesión Actual)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {u.nombre} · {u.correo}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isUserActive && (
                          <button
                            onClick={() => {
                              onSwitchUser(u);
                              onClose();
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          >
                            Activar
                          </button>
                        )}

                        {isAdmin && u.username.toUpperCase() !== 'URIEL' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Dar de baja al usuario ${u.username}?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REGISTRAR NUEVO USUARIO */}
          {activeTab === 'new_user' && (
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              {createMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{createMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombre de Usuario (Login)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. COORDINADOR_ISW"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rol en la Institución
                  </label>
                  <select
                    value={newRol}
                    onChange={(e) =>
                      setNewRol(e.target.value as 'administrador' | 'coordinador')
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="coordinador">Coordinador (Consultar y Dar de Alta)</option>
                    <option value="administrador">Administrador (Control Total con Bajas)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo del Titular
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Mtro. Sergio Alanís Gómez"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="ej. s.alanis@universidad.edu.mx"
                    value={newCorreo}
                    onChange={(e) => setNewCorreo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contraseña de Acceso
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full font-mono bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('directory')}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Crear Usuario</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
