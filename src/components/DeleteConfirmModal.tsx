import React from 'react';
import { AlertTriangle, Lock, Trash2, X } from 'lucide-react';
import { Usuario } from '../types/database';

export interface DeleteItemTarget {
  tipo: 'maestro' | 'licenciatura' | 'asignatura';
  id: string;
  nombre: string;
  detallesExtra?: string;
}

interface DeleteConfirmModalProps {
  target: DeleteItemTarget | null;
  onClose: () => void;
  onConfirm: (tipo: DeleteItemTarget['tipo'], id: string) => void;
  currentUser: Usuario;
  onOpenUserManagement: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  target,
  onClose,
  onConfirm,
  currentUser,
  onOpenUserManagement,
}) => {
  if (!target) return null;

  const isAdmin = currentUser.rol === 'administrador';

  const tipoLabel =
    target.tipo === 'maestro'
      ? 'Docente / Maestro'
      : target.tipo === 'licenciatura'
      ? 'Licenciatura / Carrera'
      : 'Asignatura / Materia';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
              {isAdmin ? <Trash2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Control de Bajas
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Dar de Baja {tipoLabel}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isAdmin ? (
            /* Restricted state for non-admin */
            <div className="space-y-3">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                <div className="leading-relaxed">
                  <strong>Permiso Restringido:</strong> Tu usuario actual ({currentUser.nombre}) tiene privilegios de consulta y alta, pero <strong>únicamente el administrador (URIEL)</strong> tiene facultades para dar de baja o eliminar registros.
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Si requieres dar de baja "{target.nombre}", inicia sesión con las credenciales de administrador (USUARIO: URIEL, PASS: UCHAVEZ).
              </p>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Entendido
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUserManagement();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Iniciar como URIEL
                </button>
              </div>
            </div>
          ) : (
            /* Admin Confirmation State */
            <div className="space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div className="leading-relaxed">
                  ¿Confirmas que deseas dar de baja definitivamente este registro del sistema?
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Elemento a eliminar:
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {target.nombre}
                </div>
                {target.detallesExtra && (
                  <div className="text-slate-500 text-[11px]">
                    {target.detallesExtra}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-500">
                {target.tipo === 'licenciatura' &&
                  'Aviso: Al eliminar esta licenciatura, se darán de baja automáticamente todas sus asignaturas, grupos y asignaciones correspondientes.'}
                {target.tipo === 'maestro' &&
                  'Aviso: Al dar de baja a este profesor, las materias que impartía quedarán vacantes para asignar un nuevo titular.'}
                {target.tipo === 'asignatura' &&
                  'Aviso: Al dar de baja esta materia, se removerá de los horarios y asignaciones de grupos activos.'}
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm(target.tipo, target.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Confirmar Baja</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
