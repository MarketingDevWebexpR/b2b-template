'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Mock employees data
 */
const employees = [
  {
    id: 'emp-001',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@bijouterie-parisienne.fr',
    jobTitle: 'Responsable Achats',
    role: 'manager',
    roleLabel: 'Manager',
    status: 'active',
    spendingLimit: 15000,
    currentSpending: 8500,
    lastLogin: '15 dec. 2024, 08:45',
    avatar: 'MD',
  },
  {
    id: 'emp-002',
    firstName: 'Pierre',
    lastName: 'Martin',
    email: 'pierre.martin@bijouterie-parisienne.fr',
    jobTitle: 'Acheteur',
    role: 'purchaser',
    roleLabel: 'Acheteur',
    status: 'active',
    spendingLimit: 5000,
    currentSpending: 3200,
    lastLogin: '14 dec. 2024, 16:30',
    avatar: 'PM',
  },
  {
    id: 'emp-003',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@bijouterie-parisienne.fr',
    jobTitle: 'Assistante Achats',
    role: 'purchaser',
    roleLabel: 'Acheteur',
    status: 'active',
    spendingLimit: 2000,
    currentSpending: 1800,
    lastLogin: '15 dec. 2024, 10:15',
    avatar: 'SB',
  },
  {
    id: 'emp-004',
    firstName: 'Julie',
    lastName: 'Leroy',
    email: 'julie.leroy@bijouterie-parisienne.fr',
    jobTitle: 'Comptable',
    role: 'viewer',
    roleLabel: 'Consultant',
    status: 'active',
    spendingLimit: 0,
    currentSpending: 0,
    lastLogin: '13 dec. 2024, 14:20',
    avatar: 'JL',
  },
  {
    id: 'emp-005',
    firstName: 'Thomas',
    lastName: 'Petit',
    email: 'thomas.petit@bijouterie-parisienne.fr',
    jobTitle: 'Stagiaire',
    role: 'viewer',
    roleLabel: 'Consultant',
    status: 'pending',
    spendingLimit: 0,
    currentSpending: 0,
    lastLogin: '-',
    avatar: 'TP',
  },
];

const roleColors = {
  owner: 'bg-purple-100 text-purple-800',
  admin: 'bg-blue-100 text-blue-800',
  manager: 'bg-hermes-100 text-hermes-800',
  purchaser: 'bg-green-100 text-green-800',
  viewer: 'bg-gray-100 text-gray-800',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  suspended: 'bg-red-100 text-red-800',
};

/**
 * Employees Management Page
 */
export default function EmployesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || employee.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-heading-3 text-text-primary">
            Employes
          </h1>
          <p className="mt-1 font-sans text-body text-text-muted">
            Gerez les acces et les limites de depenses de vos collaborateurs
          </p>
        </div>
        <button
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2',
            'bg-hermes-500 text-white rounded-soft',
            'font-sans text-body-sm font-medium',
            'hover:bg-hermes-600 transition-colors duration-200'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Inviter un employe
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2',
                'bg-white border border-border-light rounded-soft',
                'font-sans text-body-sm text-text-primary',
                'placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500'
              )}
            />
          </div>
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className={cn(
            'px-4 py-2',
            'bg-white border border-border-light rounded-soft',
            'font-sans text-body-sm text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-hermes-200 focus:border-hermes-500'
          )}
        >
          <option value="all">Tous les roles</option>
          <option value="manager">Manager</option>
          <option value="purchaser">Acheteur</option>
          <option value="viewer">Consultant</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-soft border border-border-light overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light bg-background-muted">
                <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                  Employe
                </th>
                <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                  Limite mensuelle
                </th>
                <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                  Derniere connexion
                </th>
                <th className="px-4 py-3 text-left font-sans text-caption font-medium text-text-muted">
                  Statut
                </th>
                <th className="px-4 py-3 text-right font-sans text-caption font-medium text-text-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-background-muted transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-hermes-100 flex items-center justify-center flex-shrink-0">
                        <span className="font-sans text-body-sm font-medium text-hermes-600">
                          {employee.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-sans text-body-sm font-medium text-text-primary">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="font-sans text-caption text-text-muted">
                          {employee.email}
                        </p>
                        <p className="font-sans text-caption text-text-muted">
                          {employee.jobTitle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded-full',
                        'font-sans text-caption font-medium',
                        roleColors[employee.role as keyof typeof roleColors]
                      )}
                    >
                      {employee.roleLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {employee.spendingLimit > 0 ? (
                      <div>
                        <p className="font-sans text-body-sm text-text-primary">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(employee.currentSpending)}
                          {' / '}
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(employee.spendingLimit)}
                        </p>
                        <div className="mt-1 h-1.5 w-24 bg-background-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              (employee.currentSpending / employee.spendingLimit) > 0.8
                                ? 'bg-amber-500'
                                : 'bg-hermes-500'
                            )}
                            style={{ width: `${Math.min(100, (employee.currentSpending / employee.spendingLimit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="font-sans text-caption text-text-muted">
                        Pas de limite
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-sans text-body-sm text-text-secondary">
                    {employee.lastLogin}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded-full',
                        'font-sans text-caption font-medium',
                        statusColors[employee.status as keyof typeof statusColors]
                      )}
                    >
                      {employee.status === 'active' ? 'Actif' : employee.status === 'pending' ? 'En attente' : 'Suspendu'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className={cn(
                          'p-2 rounded-soft',
                          'text-text-muted hover:text-text-primary hover:bg-background-muted',
                          'transition-colors duration-200'
                        )}
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className={cn(
                          'p-2 rounded-soft',
                          'text-text-muted hover:text-red-600 hover:bg-red-50',
                          'transition-colors duration-200'
                        )}
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="p-8 text-center">
            <p className="font-sans text-body text-text-muted">
              Aucun employe trouve
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-soft border border-border-light p-4">
          <p className="font-sans text-caption text-text-muted">Total employes</p>
          <p className="mt-1 font-serif text-heading-4 text-text-primary">{employees.length}</p>
        </div>
        <div className="bg-white rounded-soft border border-border-light p-4">
          <p className="font-sans text-caption text-text-muted">Actifs</p>
          <p className="mt-1 font-serif text-heading-4 text-green-600">
            {employees.filter((e) => e.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-soft border border-border-light p-4">
          <p className="font-sans text-caption text-text-muted">En attente</p>
          <p className="mt-1 font-serif text-heading-4 text-amber-600">
            {employees.filter((e) => e.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-soft border border-border-light p-4">
          <p className="font-sans text-caption text-text-muted">Limite totale mensuelle</p>
          <p className="mt-1 font-serif text-heading-4 text-text-primary">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
              employees.reduce((sum, e) => sum + e.spendingLimit, 0)
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
