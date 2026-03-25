import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../../services/userService';
import { PermissionModule, PermissionAction, UserPermissions } from '../../types';
import Screen from '../../components/ui/Screen';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const MODULES: { key: PermissionModule; label: string; icon: string }[] = [
  { key: 'eventos', label: 'Eventos', icon: 'calendar' },
  { key: 'entrevistas', label: 'Entrevistas', icon: 'people' },
  { key: 'francos', label: 'Francos', icon: 'sunny' },
  { key: 'clientes', label: 'Clientes', icon: 'person-circle' },
  { key: 'ingresos', label: 'Ingresos', icon: 'stats-chart' },
  { key: 'demostraciones', label: 'Demostraciones', icon: 'images' },
  { key: 'usuarios', label: 'Usuarios', icon: 'people-circle' },
];

const ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: 'ver', label: 'Ver' },
  { key: 'crear', label: 'Crear' },
  { key: 'editar', label: 'Editar' },
  { key: 'eliminar', label: 'Eliminar' },
];

const MODULE_ACTIONS: Record<PermissionModule, PermissionAction[]> = {
  eventos: ['ver', 'crear', 'editar', 'eliminar'],
  entrevistas: ['ver', 'crear', 'editar', 'eliminar'],
  francos: ['ver', 'crear', 'editar', 'eliminar'],
  clientes: ['ver', 'crear', 'editar', 'eliminar'],
  ingresos: ['ver'],
  demostraciones: ['ver'],
  usuarios: ['ver', 'crear', 'editar', 'eliminar'],
};

export default function UserEditScreen({ route, navigation }: any) {
  const userId = route.params?.userId || null;
  const isNew = !userId;
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STAFF' | 'SUPERADMIN'>('STAFF');
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const { data: existingUser, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getOne(userId!),
    enabled: !!userId,
  });

  useEffect(() => {
    if (existingUser) {
      setName(existingUser.name);
      setEmail(existingUser.email);
      setRole(existingUser.role as 'STAFF' | 'SUPERADMIN');
      setPermissions((existingUser.permissions as UserPermissions) || {});
    }
  }, [existingUser]);

  const createMutation = useMutation({
    mutationFn: () =>
      userService.create({ email, password, name, role, permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Alert.alert('Listo', 'Usuario creado', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo crear');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => userService.update(userId!, { name, role, permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      Alert.alert('Listo', 'Usuario actualizado');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar');
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => userService.changePassword(userId!, newPassword),
    onSuccess: () => {
      setNewPassword('');
      setShowPasswordChange(false);
      Alert.alert('Listo', 'Contraseña actualizada');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo cambiar');
    },
  });

  const togglePermission = (mod: PermissionModule, action: PermissionAction) => {
    setPermissions((prev) => {
      const current = prev[mod] || [];
      const has = current.includes(action);
      let updated: PermissionAction[];

      if (has) {
        updated = current.filter((a) => a !== action);
        if (action === 'ver') updated = [];
      } else {
        updated = [...current, action];
        if (action !== 'ver' && !current.includes('ver')) {
          updated = ['ver', ...updated];
        }
      }

      return { ...prev, [mod]: updated };
    });
  };

  const toggleAllModule = (mod: PermissionModule) => {
    setPermissions((prev) => {
      const current = prev[mod] || [];
      const allActions = MODULE_ACTIONS[mod];
      const hasAll = allActions.every((a) => current.includes(a));
      return { ...prev, [mod]: hasAll ? [] : [...allActions] };
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (isNew) {
      if (!email.trim() || !password.trim()) {
        Alert.alert('Error', 'Email y contraseña son obligatorios');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
        return;
      }
      createMutation.mutate();
    } else {
      updateMutation.mutate();
    }
  };

  if (!isNew && isLoading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </Screen>
    );
  }

  const isSuperAdmin = role === 'SUPERADMIN';

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isNew ? 'Nuevo usuario' : 'Editar usuario'}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nombre"
            placeholder="Nombre del usuario"
            value={name}
            onChangeText={setName}
          />

          {isNew ? (
            <>
              <Input
                label="Email"
                placeholder="email@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Input
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </>
          ) : (
            <View style={styles.emailReadonly}>
              <Text style={styles.emailLabel}>Email</Text>
              <Text style={styles.emailValue}>{email}</Text>
            </View>
          )}

          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>Rol</Text>
            <View style={styles.roleToggle}>
              <TouchableOpacity
                style={[styles.roleOption, role === 'STAFF' && styles.roleOptionActive]}
                onPress={() => setRole('STAFF')}
              >
                <Text style={[styles.roleOptionText, role === 'STAFF' && styles.roleOptionTextActive]}>
                  Staff
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, role === 'SUPERADMIN' && styles.roleOptionActiveSuper]}
                onPress={() => setRole('SUPERADMIN')}
              >
                <Text style={[styles.roleOptionText, role === 'SUPERADMIN' && styles.roleOptionTextActive]}>
                  Super Admin
                </Text>
              </TouchableOpacity>
            </View>
            {isSuperAdmin && (
              <Text style={styles.superNote}>
                Los Super Admin tienen acceso total a todos los módulos
              </Text>
            )}
          </View>
        </View>

        {!isSuperAdmin && (
          <View style={styles.permissionsSection}>
            <Text style={styles.permissionsTitle}>Permisos por módulo</Text>
            <Text style={styles.permissionsSubtitle}>
              Activá los permisos que este usuario necesita
            </Text>

            {MODULES.map((mod) => {
              const currentPerms = permissions[mod.key] || [];
              const availableActions = MODULE_ACTIONS[mod.key];
              const hasAny = currentPerms.length > 0;
              const hasAll = availableActions.every((a) => currentPerms.includes(a));

              return (
                <View key={mod.key} style={styles.moduleCard}>
                  <TouchableOpacity
                    style={styles.moduleHeader}
                    onPress={() => toggleAllModule(mod.key)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.moduleHeaderLeft}>
                      <View style={[styles.moduleIcon, hasAny && styles.moduleIconActive]}>
                        <Ionicons
                          name={mod.icon as any}
                          size={18}
                          color={hasAny ? '#c4b5fd' : '#475569'}
                        />
                      </View>
                      <Text style={[styles.moduleLabel, hasAny && styles.moduleLabelActive]}>
                        {mod.label}
                      </Text>
                    </View>
                    <View style={[styles.toggleAll, hasAll && styles.toggleAllActive]}>
                      <Text style={[styles.toggleAllText, hasAll && styles.toggleAllTextActive]}>
                        {hasAll ? 'Todo' : hasAny ? 'Parcial' : 'Ninguno'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {hasAny && (
                    <View style={styles.actionsRow}>
                      {ACTIONS.filter((a) => availableActions.includes(a.key)).map(
                        (action) => {
                          const isActive = currentPerms.includes(action.key);
                          return (
                            <View key={action.key} style={styles.actionToggle}>
                              <Text style={styles.actionLabel}>{action.label}</Text>
                              <Switch
                                value={isActive}
                                onValueChange={() =>
                                  togglePermission(mod.key, action.key)
                                }
                                trackColor={{ false: '#1e293b', true: '#7c3aed80' }}
                                thumbColor={isActive ? '#7c3aed' : '#475569'}
                              />
                            </View>
                          );
                        },
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {!isNew && (
          <View style={styles.passwordSection}>
            {!showPasswordChange ? (
              <TouchableOpacity
                style={styles.changePasswordBtn}
                onPress={() => setShowPasswordChange(true)}
              >
                <Ionicons name="key-outline" size={16} color="#94a3b8" />
                <Text style={styles.changePasswordText}>Cambiar contraseña</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.passwordForm}>
                <Input
                  label="Nueva contraseña"
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <View style={styles.passwordButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowPasswordChange(false);
                      setNewPassword('');
                    }}
                    style={styles.cancelBtn}
                  >
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      if (newPassword.length < 6) {
                        Alert.alert('Error', 'Mínimo 6 caracteres');
                        return;
                      }
                      passwordMutation.mutate();
                    }}
                    style={styles.confirmBtn}
                  >
                    <Text style={styles.confirmBtnText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.saveSection}>
          <Button
            label={isNew ? 'Crear usuario' : 'Guardar cambios'}
            onPress={handleSave}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  form: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  emailReadonly: {
    gap: 4,
  },
  emailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  emailValue: {
    fontSize: 15,
    color: '#64748b',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  roleSection: {
    marginTop: 8,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#1e293b',
  },
  roleOptionActiveSuper: {
    backgroundColor: '#7c3aed20',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  roleOptionTextActive: {
    color: '#f1f5f9',
  },
  superNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#c4b5fd',
    fontStyle: 'italic',
  },
  permissionsSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  permissionsSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  moduleCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  moduleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconActive: {
    backgroundColor: '#7c3aed20',
  },
  moduleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  moduleLabelActive: {
    color: '#f1f5f9',
  },
  toggleAll: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1e293b',
  },
  toggleAllActive: {
    backgroundColor: '#7c3aed30',
  },
  toggleAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  toggleAllTextActive: {
    color: '#c4b5fd',
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 4,
  },
  actionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '48%',
    paddingVertical: 4,
  },
  actionLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  passwordSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  changePasswordText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  passwordForm: {
    gap: 12,
  },
  passwordButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 12,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  saveSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
});
