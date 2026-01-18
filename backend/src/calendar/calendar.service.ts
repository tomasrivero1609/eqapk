import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createSign } from 'crypto';

interface CalendarEventInput {
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime?: string | null;
}

export interface CalendarAvailabilityResult {
  available: boolean;
  status: 'ok' | 'disabled' | 'error';
  busyCount?: number;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private readonly configService: ConfigService) {}

  async createEvent(input: CalendarEventInput): Promise<string | null> {
    if (!this.isEnabled()) {
      return null;
    }

    const token = await this.getAccessToken();
    if (!token) {
      return null;
    }

    const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID');
    if (!calendarId) {
      this.logger.warn('Missing GOOGLE_CALENDAR_ID');
      return null;
    }

    const payload = this.buildEventPayload(input);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId,
      )}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.warn(`Calendar create failed: ${errorText}`);
      return null;
    }

    const data = (await response.json()) as { id?: string };
    return data.id || null;
  }

  async updateEvent(
    calendarEventId: string,
    input: CalendarEventInput,
  ): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const token = await this.getAccessToken();
    if (!token) {
      return;
    }

    const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID');
    if (!calendarId) {
      this.logger.warn('Missing GOOGLE_CALENDAR_ID');
      return;
    }

    const payload = this.buildEventPayload(input);
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId,
      )}/events/${encodeURIComponent(calendarEventId)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.warn(`Calendar update failed: ${errorText}`);
    }
  }

  async deleteEvent(calendarEventId: string): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const token = await this.getAccessToken();
    if (!token) {
      return;
    }

    const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID');
    if (!calendarId) {
      this.logger.warn('Missing GOOGLE_CALENDAR_ID');
      return;
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId,
      )}/events/${encodeURIComponent(calendarEventId)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.warn(`Calendar delete failed: ${errorText}`);
    }
  }

  async checkDateAvailability(date: string): Promise<CalendarAvailabilityResult> {
    if (!this.isEnabled()) {
      return { available: true, status: 'disabled' };
    }

    const token = await this.getAccessToken();
    if (!token) {
      return { available: true, status: 'error' };
    }

    const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID');
    if (!calendarId) {
      this.logger.warn('Missing GOOGLE_CALENDAR_ID');
      return { available: true, status: 'error' };
    }

    const timezone =
      this.configService.get<string>('GOOGLE_CALENDAR_TIMEZONE') ||
      'America/Mexico_City';

    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59`);
    const response = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone: timezone,
        items: [{ id: calendarId }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.warn(`Calendar availability failed: ${errorText}`);
      return { available: true, status: 'error' };
    }

    const data = (await response.json()) as {
      calendars?: Record<string, { busy?: Array<{ start: string; end: string }> }>;
    };
    const busy =
      data.calendars?.[calendarId]?.busy?.length ?? 0;

    return { available: busy === 0, status: 'ok', busyCount: busy };
  }

  private isEnabled(): boolean {
    return this.configService.get<string>('GOOGLE_CALENDAR_ENABLED') === 'true';
  }

  private buildEventPayload(input: CalendarEventInput) {
    const timezone =
      this.configService.get<string>('GOOGLE_CALENDAR_TIMEZONE') ||
      'America/Mexico_City';

    const dateString = input.date.toISOString().slice(0, 10);
    const { startDateTime, endDateTime } = this.buildDateTimes(
      dateString,
      input.startTime,
      input.endTime || undefined,
    );

    return {
      summary: input.title,
      description: input.description,
      start: {
        dateTime: startDateTime,
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timezone,
      },
    };
  }

  private buildDateTimes(date: string, startTime: string, endTime?: string) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    let endHour = startHour + 2;
    let endMinute = startMinute;

    if (endTime) {
      const [endH, endM] = endTime.split(':').map(Number);
      endHour = endH;
      endMinute = endM;
    }

    let endDayOffset = 0;
    if (endHour >= 24) {
      endHour -= 24;
      endDayOffset = 1;
    }

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute + endDayOffset * 24 * 60;
    if (endTotal <= startTotal) {
      endDayOffset = 1;
    }

    const startDateTime = `${date}T${this.pad(startHour)}:${this.pad(
      startMinute,
    )}:00`;
    const endDateTime = `${this.addDaysToDate(date, endDayOffset)}T${this.pad(
      endHour,
    )}:${this.pad(endMinute)}:00`;

    return { startDateTime, endDateTime };
  }

  private addDaysToDate(date: string, days: number) {
    if (!days) {
      return date;
    }
    const base = new Date(date + 'T00:00:00');
    base.setDate(base.getDate() + days);
    return base.toISOString().slice(0, 10);
  }

  private pad(value: number) {
    return value.toString().padStart(2, '0');
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const clientEmail = this.configService.get<string>('GOOGLE_CLIENT_EMAIL');
      const privateKeyRaw = this.configService.get<string>('GOOGLE_PRIVATE_KEY');

      if (!clientEmail || !privateKeyRaw) {
        this.logger.warn('Missing Google service account credentials');
        return null;
      }

      const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
      const jwt = this.createServiceAccountJwt(clientEmail, privateKey);
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(`Token request failed: ${errorText}`);
        return null;
      }

      const data = (await response.json()) as { access_token?: string };
      return data.access_token || null;
    } catch (error) {
      this.logger.warn(`Token error: ${(error as Error).message}`);
      return null;
    }
  }

  private createServiceAccountJwt(clientEmail: string, privateKey: string) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: clientEmail,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const unsignedToken = `${encodedHeader}.${encodedPayload}`;

    const signer = createSign('RSA-SHA256');
    signer.update(unsignedToken);
    const signature = signer.sign(privateKey, 'base64');

    return `${unsignedToken}.${this.base64UrlEncode(signature, true)}`;
  }

  private base64UrlEncode(value: string, isBase64 = false) {
    const base64 = isBase64 ? value : Buffer.from(value).toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
}
