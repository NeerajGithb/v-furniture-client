// Audit logging for security events
// In production, send these to a logging service (e.g., Winston, Datadog, CloudWatch)

export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'REGISTER'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'PASSWORD_CHANGE'
  | 'EMAIL_VERIFICATION'
  | 'ACCOUNT_LOCKED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'TOKEN_REFRESH'
  | 'OAUTH_LOGIN';

export interface AuditLogEntry {
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, any>;
  message?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 10000; // Keep last 10k logs in memory

  log(entry: Omit<AuditLogEntry, 'timestamp'>): void {
    const logEntry: AuditLogEntry = {
      ...entry,
      timestamp: new Date(),
    };

    this.logs.push(logEntry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to logging service (e.g., Winston, Datadog, CloudWatch)
      console.log('[AUDIT]', JSON.stringify(logEntry));
    } else {
      // Development: console log
      const emoji = entry.success ? '✅' : '❌';
      console.log(`${emoji} [AUDIT] ${entry.eventType}:`, {
        email: entry.email,
        userId: entry.userId,
        ip: entry.ipAddress,
        message: entry.message,
      });
    }
  }

  getRecentLogs(limit: number = 100): AuditLogEntry[] {
    return this.logs.slice(-limit);
  }

  getLogsByUser(userId: string, limit: number = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit);
  }

  getLogsByEmail(email: string, limit: number = 50): AuditLogEntry[] {
    return this.logs
      .filter(log => log.email === email)
      .slice(-limit);
  }

  getFailedLoginAttempts(email: string, since: Date): AuditLogEntry[] {
    return this.logs.filter(
      log =>
        log.eventType === 'LOGIN_FAILED' &&
        log.email === email &&
        log.timestamp >= since
    );
  }
}

export const auditLogger = new AuditLogger();

// Helper functions for common audit events
export function logLoginSuccess(userId: string, email: string, ipAddress?: string, userAgent?: string): void {
  auditLogger.log({
    eventType: 'LOGIN_SUCCESS',
    userId,
    email,
    ipAddress,
    userAgent,
    success: true,
    message: 'User logged in successfully',
  });
}

export function logLoginFailed(email: string, reason: string, ipAddress?: string, userAgent?: string): void {
  auditLogger.log({
    eventType: 'LOGIN_FAILED',
    email,
    ipAddress,
    userAgent,
    success: false,
    message: reason,
  });
}

export function logLogout(userId: string, email: string, ipAddress?: string): void {
  auditLogger.log({
    eventType: 'LOGOUT',
    userId,
    email,
    ipAddress,
    success: true,
    message: 'User logged out',
  });
}

export function logRegistration(userId: string, email: string, ipAddress?: string, userAgent?: string): void {
  auditLogger.log({
    eventType: 'REGISTER',
    userId,
    email,
    ipAddress,
    userAgent,
    success: true,
    message: 'New user registered',
  });
}

export function logAccountLocked(email: string, reason: string, ipAddress?: string): void {
  auditLogger.log({
    eventType: 'ACCOUNT_LOCKED',
    email,
    ipAddress,
    success: false,
    message: reason,
  });
}

export function logPasswordReset(email: string, success: boolean, ipAddress?: string): void {
  auditLogger.log({
    eventType: success ? 'PASSWORD_RESET_SUCCESS' : 'PASSWORD_RESET_REQUEST',
    email,
    ipAddress,
    success,
    message: success ? 'Password reset successfully' : 'Password reset requested',
  });
}