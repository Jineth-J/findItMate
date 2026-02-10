// API Service for FindItMate
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Token management
const getToken = (): string | null => localStorage.getItem('token');
const setToken = (token: string): void => localStorage.setItem('token', token);
const removeToken = (): void => localStorage.removeItem('token');

// Generic fetch wrapper
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; pagination?: any }> {
    const token = getToken();

    const isFormData = options.body instanceof FormData;
    const headers: HeadersInit = {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    if (!isFormData) {
        // @ts-ignore
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    register: (userData: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        nic?: string;
        userType: 'student' | 'landlord';
        university?: string;
        businessName?: string;
    }) => fetchAPI<{ user: any; token: string; profile: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    login: (credentials: { email: string; password: string }) =>
        fetchAPI<{ user: any; token: string; profile: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    logout: () => {
        removeToken();
        return Promise.resolve({ success: true });
    },

    verifyEmail: (token: string) => fetchAPI<{ token: string; user: any; profile: any }>(`/auth/verify/${token}`, {
        method: 'PUT'
    }),
};

// Users API
export const usersAPI = {
    getMe: () => fetchAPI<{ user: any; profile: any }>('/users/me'),

    updateMe: (data: {
        name?: string;
        phone?: string;
        avatar?: string;
        // Student fields
        university?: string;
        studentId?: string;
        course?: string;
        yearOfStudy?: number;
        budget?: number;
        preferredRoomType?: string;
        aboutMe?: string;
        // Landlord fields
        businessName?: string;
        businessAddress?: string;
        numberOfProperties?: number;
        yearsOfExperience?: number;
        aboutProperties?: string;
    }) =>
        fetchAPI('/users/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        fetchAPI('/users/me/password', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    deleteMe: () => fetchAPI<{ success: boolean; message: string }>('/users/me', { method: 'DELETE' }),
};

// Properties API
export const propertiesAPI = {
    getAll: (params?: {
        search?: string;
        type?: string;
        minPrice?: number;
        maxPrice?: number;
        capacity?: number;
        city?: string;
        page?: number;
        limit?: number;
    }) => {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, String(value));
                }
            });
        }
        return fetchAPI<any[]>(`/properties?${searchParams.toString()}`);
    },

    getById: (id: string) => fetchAPI<any>(`/properties/${id}`),

    create: (propertyData: any) =>
        fetchAPI('/properties', {
            method: 'POST',
            body: JSON.stringify(propertyData),
        }),

    update: (id: string, propertyData: any) =>
        fetchAPI(`/properties/${id}`, {
            method: 'PUT',
            body: JSON.stringify(propertyData),
        }),

    delete: (id: string) =>
        fetchAPI(`/properties/${id}`, { method: 'DELETE' }),

    getByLandlord: (landlordId: string) =>
        fetchAPI<any[]>(`/properties/landlord/${landlordId}`),
};

// Bookings API
export const bookingsAPI = {
    getAll: () => fetchAPI<any[]>('/bookings'),

    create: (bookingData: {
        propertyId: string;
        checkIn: string;
        checkOut?: string;
        guests: number;
        guestName?: string;
        guestEmail?: string;
        guestPhone?: string;
    }) =>
        fetchAPI('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        }),

    update: (id: string, data: { status?: string; notes?: string }) =>
        fetchAPI(`/bookings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    cancel: (id: string) =>
        fetchAPI(`/bookings/${id}`, { method: 'DELETE' }),

    getAvailability: (propertyId: string) =>
        fetchAPI<{ start: string; end: string }[]>(`/bookings/availability/${propertyId}`),
};

// Reviews API
export const reviewsAPI = {
    getAll: () => fetchAPI<any[]>('/reviews'),

    getByProperty: (propertyId: string) =>
        fetchAPI<any[]>(`/reviews/property/${propertyId}`),

    create: (data: { propertyId: string; rating: number; comment: string }) =>
        fetchAPI('/reviews', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchAPI(`/reviews/${id}`, { method: 'DELETE' }),
};

// Messages API
export const messagesAPI = {
    getConversations: () => fetchAPI<any[]>('/conversations'),

    getMessages: (conversationId: string) =>
        fetchAPI<any[]>(`/conversations/${conversationId}/messages`),

    send: (data: { conversationId?: string; recipientId?: string; propertyId?: string; content: string }) =>
        fetchAPI('/messages', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

// Notifications API
export const notificationsAPI = {
    getAll: (unreadOnly?: boolean, search?: string, page?: number) => {
        const params = new URLSearchParams();
        if (unreadOnly) params.append('unreadOnly', 'true');
        if (search) params.append('search', search);
        if (page) params.append('page', String(page));
        return fetchAPI<any[]>(`/notifications?${params.toString()}`);
    },

    markAsRead: (id: string) =>
        fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),

    markAllAsRead: () =>
        fetchAPI('/notifications/read-all', { method: 'PUT' }),
};

// Subscriptions API
export const subscriptionsAPI = {
    getPlans: () => fetchAPI<any>('/subscriptions/plans'),

    getMy: () => fetchAPI<any>('/subscriptions/me'),

    subscribe: (plan: 'free' | 'premium') =>
        fetchAPI('/subscriptions', {
            method: 'POST',
            body: JSON.stringify({ plan }),
        }),

    cancel: () =>
        fetchAPI('/subscriptions', { method: 'DELETE' }),
};

// Favorites API
export const favoritesAPI = {
    getAll: () => fetchAPI<any[]>('/favorites'),

    add: (propertyId: string) =>
        fetchAPI('/favorites', {
            method: 'POST',
            body: JSON.stringify({ propertyId }),
        }),

    remove: (propertyId: string) =>
        fetchAPI(`/favorites/${propertyId}`, { method: 'DELETE' }),
};

// Tours API
export const toursAPI = {
    getAll: () => fetchAPI<any[]>('/tours'),

    create: (data: { name?: string; properties: string[]; scheduledDate?: string; notes?: string }) =>
        fetchAPI('/tours', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        fetchAPI(`/tours/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        fetchAPI(`/tours/${id}`, { method: 'DELETE' }),
};

// Issues API
export const issuesAPI = {
    getAll: () => fetchAPI<any[]>('/issues'),

    create: (data: {
        propertyId?: string;
        leaseId?: string;
        type: string;
        priority?: string;
        title: string;
        description: string;
    }) =>
        fetchAPI('/issues', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: { status?: string; resolution?: string }) =>
        fetchAPI(`/issues/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// Verifications API
export const verificationsAPI = {
    getAll: () => fetchAPI<any[]>('/verifications'),

    submit: (verificationData: any) =>
        fetchAPI('/verifications/submit', {
            method: 'POST',
            body: JSON.stringify({ verificationData }),
        }),
};

// Upload API
export const uploadAPI = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return fetchAPI<{ url: string; filename: string }>('/upload', {
            method: 'POST',
            body: formData,
        });
    },

    uploadMultiple: (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        return fetchAPI<any[]>('/upload/multiple', {
            method: 'POST',
            body: formData,
        });
    },
};

// Admin API
export const adminAPI = {
    getUsers: (userType?: string, page?: number, search?: string) => {
        const params = new URLSearchParams();
        if (userType) params.append('userType', userType);
        if (page) params.append('page', String(page));
        if (search) params.append('search', search);
        return fetchAPI<any[]>(`/admin/users?${params.toString()}`);
    },

    verifyUser: (id: string) =>
        fetchAPI(`/admin/users/${id}/verify`, { method: 'PUT' }),

    suspendUser: (id: string) =>
        fetchAPI(`/admin/users/${id}/suspend`, { method: 'PUT' }),

    deleteUser: (id: string) =>
        fetchAPI(`/admin/users/${id}`, { method: 'DELETE' }),

    getProperties: (status?: string, page?: number, search?: string) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (page) params.append('page', String(page));
        if (search) params.append('search', search);
        return fetchAPI<any[]>(`/admin/properties?${params.toString()}`);
    },

    verifyProperty: (id: string) =>
        fetchAPI(`/admin/properties/${id}/verify`, { method: 'PUT' }),

    getAnalytics: () => fetchAPI<any>('/admin/analytics'),

    getSecurityLogs: (severity?: string, page?: number, search?: string) => {
        const params = new URLSearchParams();
        if (severity) params.append('severity', severity);
        if (page) params.append('page', String(page));
        if (search) params.append('search', search);
        return fetchAPI<any[]>(`/admin/security-logs?${params.toString()}`);
    },

    getVerifications: (status?: string) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        return fetchAPI<any[]>(`/admin/verifications?${params.toString()}`);
    },

    reviewVerification: (id: string, data: { status: 'approved' | 'rejected'; reviewNotes?: string }) =>
        fetchAPI(`/verifications/${id}/review`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    getChats: () => fetchAPI<any[]>('/admin/chats'),

    getPayments: (status?: string, page?: number) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (page) params.append('page', String(page));
        return fetchAPI<any[]>(`/admin/payments?${params.toString()}`);
    },

    createUser: (userData: any) =>
        fetchAPI('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    updateProperty: (id: string, data: any) =>
        fetchAPI(`/admin/properties/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// Chatbot API
export const chatbotAPI = {
    getConversation: (sessionId?: string) => {
        const params = sessionId ? `?sessionId=${sessionId}` : '';
        return fetchAPI<{
            id: string;
            messages: Array<{
                role: 'user' | 'bot';
                content: string;
                timestamp: string;
                suggestions?: string[];
            }>;
            language: string;
            userType: string;
        }>(`/chatbot/conversation${params}`);
    },

    sendMessage: (content: string, language: string, sessionId?: string) =>
        fetchAPI<{
            userMessage: { role: 'user'; content: string; timestamp: string };
            botMessage: { role: 'bot'; content: string; suggestions: string[]; timestamp: string };
            conversationId: string;
        }>('/chatbot/message', {
            method: 'POST',
            body: JSON.stringify({ content, language, sessionId }),
        }),

    clearConversation: (sessionId?: string) => {
        const params = sessionId ? `?sessionId=${sessionId}` : '';
        return fetchAPI(`/chatbot/clear${params}`, { method: 'DELETE' });
    },
};

// Helper functions
export const setAuthToken = setToken;
export const getAuthToken = getToken;
export const clearAuthToken = removeToken;

// Export all as default for convenience
export default {
    auth: authAPI,
    users: usersAPI,
    properties: propertiesAPI,
    bookings: bookingsAPI,
    reviews: reviewsAPI,
    messages: messagesAPI,
    notifications: notificationsAPI,
    subscriptions: subscriptionsAPI,
    favorites: favoritesAPI,
    tours: toursAPI,
    issues: issuesAPI,
    verifications: verificationsAPI,
    upload: uploadAPI,
    admin: adminAPI,
    chatbot: chatbotAPI,
};
