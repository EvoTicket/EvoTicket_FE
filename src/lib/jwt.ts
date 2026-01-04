// Utility function to decode JWT token
export interface JWTPayload {
    organizationId: number;
    roles: string[];
    userId: number;
    isOrganization: boolean;
    sub: string;
    iat: number;
    exp: number;
}

export function decodeJWT(token: string): JWTPayload | null {
    try {
        // JWT có 3 phần: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        // Decode phần payload (phần thứ 2)
        const payload = parts[1];

        // Base64 decode
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

        // Parse JSON
        return JSON.parse(decodedPayload) as JWTPayload;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeJWT(token);
    if (!payload) return true;

    // exp là timestamp tính bằng giây, Date.now() tính bằng milliseconds
    return payload.exp * 1000 < Date.now();
}
