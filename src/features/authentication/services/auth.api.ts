import { z } from 'zod';
import { apiClient } from '../../../shared/services/apiClient';

export const GenerateOtpResponseSchema = z.object({
  success: z.boolean().optional().default(true),
  is_new_user: z.boolean().optional(),
  message: z.string().optional(),
});
export type GenerateOtpResponse = z.infer<typeof GenerateOtpResponseSchema>;

export const VerifyOtpResponseSchema = z.object({
  success: z.boolean().optional().default(true),
  access: z.string().optional(),
  refresh: z.string().optional(),
  is_new_user: z.boolean().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  message: z.string().optional(),
});
export type VerifyOtpResponse = z.infer<typeof VerifyOtpResponseSchema>;

export const ProfileCompleteResponseSchema = z.object({
  success: z.boolean().optional().default(true),
  username: z.string().optional(),
  message: z.string().optional(),
});
export type ProfileCompleteResponse = z.infer<typeof ProfileCompleteResponseSchema>;

export const authApi = {
  generateOtp: async (email: string): Promise<GenerateOtpResponse> => {
    try {
      const response = await apiClient.post('/otp/generate/', { email });
      return GenerateOtpResponseSchema.parse(response.data);
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message || 'Network error' };
    }
  },

  verifyOtp: async (email: string, otp: string): Promise<VerifyOtpResponse> => {
    try {
      const response = await apiClient.post('/otp/verify/', { email, otp });
      return VerifyOtpResponseSchema.parse(response.data);
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message || 'Invalid OTP' };
    }
  },

  completeProfile: async (username: string): Promise<ProfileCompleteResponse> => {
    try {
      const response = await apiClient.post('/profile/complete/', { username });
      return ProfileCompleteResponseSchema.parse(response.data);
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message || 'Network error' };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/logout/');
    } catch {
      // Ignore errors on logout
    }
  }
};
