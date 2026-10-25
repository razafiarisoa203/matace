import React, { useState, useEffect } from 'react';
import { roleService } from '../../services/api/roleService';
import { getUsers } from '../../services/api/userService';
import { toast } from 'react-toastify';
import axios from 'axios';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [editingRoles, setEditingRoles] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [photos, setPhotos] = useState({}); // { [id_citizen]: photo_url }

  useEffect(() => {
    users.forEach((user) => {
      if (user.id_citizen && !photos[user.id_citizen]) {
        axios
          .get(`https://gateway.tsirylab.com/serviceauth/users/user-citizen/${user.id_citizen}`)
          .then((res) => {
            const photoPath = res.data.citizen?.citizen_photo;
            let fullPhotoUrl = null;

            if (photoPath) {
              // If the path already includes the full URL, use it as is
              if (photoPath.startsWith('http')) {
                fullPhotoUrl = photoPath.split("hello/").join("preview/hello%2F");
              } else if (photoPath.includes('hello')) {
                // Handle the original pattern: extract part after "hello" and URL encode
                const pathAfterHello = photoPath.split('hello')[1];
                if (pathAfterHello) {
                  const encodedPath = pathAfterHello.replace(/\//g, '%2F');
                  fullPhotoUrl = `https://gateway.tsirylab.com/serviceupload/file/preview/hello${encodedPath}`;
                }
              } else {
                // Fallback: assume it's a simple filename and construct URL
                fullPhotoUrl = `https://gateway.tsirylab.com/serviceupload/file/preview/${photoPath.replace(/^\//, '')}`;
              }
            }

                console.log("-------",fullPhotoUrl)
            console.log(`Photo URL construite pour user ${user.id_citizen}:`, { photoPath, fullPhotoUrl });
            setPhotos((prev) => ({
              ...prev,
              [user.id_citizen]: fullPhotoUrl,
            }));
          })
          .catch((err) => {
            console.error("Erreur fetch photo:", err);
            setPhotos((prev) => ({ ...prev, [user.id_citizen]: null }));
          });
      }
    });
  }, [users]);

  // Chargement des rôles au montage
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await roleService.getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('Erreur lors du chargement des rôles:', error);
        toast.error('Erreur lors du chargement des rôles');
      } finally {
        setRolesLoading(false);
      }
    };
    loadRoles();
  }, []);

  // Debounce du terme de recherche
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Chargement des utilisateurs
  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getUsers(page, limit, debouncedSearchTerm);

        if (!isMounted) return;

        const usersData = response.data || response.users || [];
        setUsers(usersData.map(u => u._raw || u));

        const newPagination = {
          page: response.page || page,
          limit: response.limit || limit,
          total: response.total || 0,
          totalPages: response.totalPages || 1
        };
        setPagination(prev => {
          if (
            prev.page === newPagination.page &&
            prev.limit === newPagination.limit &&
            prev.total === newPagination.total &&
            prev.totalPages === newPagination.totalPages
          ) {
            return prev;
          }
          return newPagination;
        });
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        if (isMounted) {
          toast.error('Erreur lors du chargement des utilisateurs');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [page, debouncedSearchTerm, limit]);

  // Gestion recherche
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // Gestion édition des rôles
  const handleRoleEdit = (user) => {
    const userId = user.user_id || user.id;
    setEditingRoles(userId);
    const currentRoleIds = Array.isArray(user.appUserRoles)
      ? user.appUserRoles
          .map((assignment) => assignment.role?.role_id ?? assignment.role?.id ?? assignment.role_id)
          .filter((roleId) => roleId != null)
          .map(String)
      : [];
    setSelectedRoleIds(currentRoleIds);
  };

  const handleRoleChange = (roleId, checked) => {
    setSelectedRoleIds((currentRoleIds) =>
      checked
        ? [...new Set([...currentRoleIds, roleId])]
        : currentRoleIds.filter((currentRoleId) => currentRoleId !== roleId)
    );
  };

  const saveUserRoles = async (userId) => {
    try {
      setSavingRoles(true);
      const user = users.find((item) => (item.user_id || item.id) === userId);
      const currentRoleIds = Array.isArray(user?.appUserRoles)
        ? user.appUserRoles
            .map((assignment) => assignment.role?.role_id ?? assignment.role?.id ?? assignment.role_id)
            .filter((roleId) => roleId != null)
            .map(Number)
            .filter(Number.isSafeInteger)
        : [];
      const nextRoleIds = selectedRoleIds.map(Number).filter(Number.isSafeInteger);
      const removedRoleIds = currentRoleIds.filter((roleId) => !nextRoleIds.includes(roleId));

      if (nextRoleIds.length > 0) {
        await roleService.assignUserRoles(userId, nextRoleIds);
      }
      if (removedRoleIds.length > 0) {
        await roleService.removeUserRoles(userId, removedRoleIds);
      }

      toast.success('Rôle mis à jour avec succès');
      setEditingRoles(null);
      setSelectedRoleIds([]);

      const response = await getUsers(page, limit, debouncedSearchTerm);
      const usersData = response.data || response.users || [];
      setUsers(usersData.map(u => u._raw || u));

      const newPagination = {
        page: response.page || page,
        limit: response.limit || limit,
        total: response.total || 0,
        totalPages: response.totalPages || 1
      };
      setPagination(prev => ({ ...prev, ...newPagination }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast.error(`Erreur lors de la mise à jour du rôle: ${error?.response?.data?.message || error?.message || 'Erreur inconnue'}`);
    } finally {
      setSavingRoles(false);
    }
  };

  const cancelEdit = () => {
    setEditingRoles(null);
    setSelectedRoleIds([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex">
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700"
        >
          Rechercher
        </button>
      </form>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-x-scroll">
        {loading ? (
          <div className="p-4 text-center">Chargement...</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôles</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Aucun utilisateur trouvé</td>
                  </tr>
                ) : (
                  users.map(user => {
                    const userId = user.user_id || user.id;
                    const photoUrl = photos[user.id_citizen];
                    
                    
                    return (
                      <tr key={userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={`Photo de ${user.user_pseudo}`}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                console.error('Erreur de chargement de l\'image:', photoUrl);
                                e.target.style.display = 'none';
                              }}
                              onLoad={() => {
                                console.log('Image chargée avec succès:', photoUrl);
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">Aucune photo</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.user_pseudo || 'Non défini'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.user_email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.user_phone || 'Non défini'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingRoles === userId ? (
                            <div className="min-w-48 space-y-2">
                              {rolesLoading ? (
                                <span className="text-sm text-gray-500">Chargement des rôles...</span>
                              ) : roles.length > 0 ? (
                                roles.map((role, index) => {
                                  const roleId = String(role.role_id ?? role.id);
                                  const inputId = `user-${userId}-role-${roleId}`;
                                  return (
                                    <label key={`role-option-${roleId}-${index}`} htmlFor={inputId} className="flex items-center gap-2 text-sm text-gray-700">
                                      <input
                                        id={inputId}
                                        type="checkbox"
                                        value={roleId}
                                        checked={selectedRoleIds.includes(roleId)}
                                        onChange={(event) => handleRoleChange(roleId, event.target.checked)}
                                        disabled={savingRoles}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                      />
                                      {role.role_name || role.name || `Rôle ${roleId}`}
                                    </label>
                                  );
                                })
                              ) : (
                                <span className="text-sm text-gray-500">Aucun rôle disponible</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(user.appUserRoles) && user.appUserRoles.length > 0 ? user.appUserRoles.map((assignment, index) => (
                                <span key={assignment.role?.role_id ?? assignment.role_id ?? index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {assignment.role?.role_name || assignment.role_name || 'Rôle'}
                                </span>
                              )) : <span className="text-sm text-gray-500">Aucun rôle</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {editingRoles === userId ? (
                            <>
                              <button onClick={() => saveUserRoles(userId)} disabled={savingRoles || rolesLoading || roles.length === 0} className="text-green-600 hover:text-green-900 disabled:cursor-not-allowed disabled:opacity-50 mr-2">{savingRoles ? 'Enregistrement...' : 'Enregistrer'}</button>
                              <button onClick={cancelEdit} disabled={savingRoles} className="text-gray-600 hover:text-gray-900 disabled:opacity-50">Annuler</button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRoleEdit(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              {Array.isArray(user.appUserRoles) && user.appUserRoles.length > 0 ? 'Modifier les rôles' : 'Assigner un rôle'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-3 border-t">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className={`px-4 py-2 border rounded-md ${
                    pagination.page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} sur {pagination.totalPages} ({pagination.total} utilisateurs)
                </span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  className={`px-4 py-2 border rounded-md ${
                    pagination.page === pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersList;