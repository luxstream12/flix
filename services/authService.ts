import { supabase } from './supabaseClient';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  isPrimary: boolean;
  createdAt: string;
  createdBy?: string;
}

export const authService = {
  async loginAdmin(emailOrUsername: string, password: string) {
    try {
      // Buscar admin por email ou username usando a função do banco
      const { data: adminData, error: fetchError } = await supabase.rpc(
        'get_admin_by_login',
        { login_identifier: emailOrUsername }
      );

      if (fetchError) throw fetchError;
      if (!adminData || adminData.length === 0) {
        throw new Error('Usuário não encontrado');
      }

      const admin = adminData[0];

      // Verificar senha
      const { data: isValid, error: authError } = await supabase.rpc(
        'verify_admin_password',
        { login_identifier: emailOrUsername, password_input: password }
      );

      if (authError || !isValid) {
        throw new Error('Senha incorreta');
      }

      const result: AdminUser = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        isPrimary: admin.is_primary,
        createdAt: admin.created_at,
      };

      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async createAdmin(
    username: string,
    email: string,
    password: string,
    createdBy: string
  ) {
    try {
      const { data, error } = await supabase.rpc('create_admin_user', {
        p_username: username,
        p_email: email,
        p_password: password,
        p_created_by: createdBy,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async getAdminById(id: string) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as AdminUser, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async listAdmins() {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, email, is_primary, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const admins = data?.map(item => ({
        id: item.id,
        username: item.username,
        email: item.email || '',
        isPrimary: item.is_primary,
        createdAt: item.created_at,
      })) || [];
      
      return { data: admins as AdminUser[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  async deleteAdmin(adminId: string) {
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId)
        .eq('is_primary', false); // Impedir deleção do admin principal

      if (error) throw error;
      return { data: true, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
