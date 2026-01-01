/**
 * SAP HANA Connection Test API Route
 * @governance COMPONENT-001, SEC-001
 *
 * Tests connectivity to SAP HANA by attempting a simple
 * database connection test via HTTP API.
 *
 * Note: Direct HANA connections require hdb driver which
 * doesn't work in Edge runtime. This route validates
 * the connection parameters format and tests network
 * reachability. Full HANA testing requires the backend.
 */
import { NextRequest, NextResponse } from 'next/server';

interface SAPTestRequest {
  hostUrl: string;
  systemId: string;
  client: string;
  username: string;
  password: string;
}

interface SAPTestResponse {
  success: boolean;
  message: string;
  details?: {
    host?: string;
    port?: number;
    systemId?: string;
    client?: string;
    responseTime?: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<SAPTestResponse>> {
  const startTime = Date.now();

  try {
    const body: SAPTestRequest = await request.json();
    const { hostUrl, systemId, client, username, password } = body;

    // Validate required fields
    if (!hostUrl || !systemId || !client || !username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: hostUrl, systemId, client, username, password',
      }, { status: 400 });
    }

    // Parse host and port from URL
    let host: string;
    let port: number;

    try {
      // Handle formats: "10.0.1.105:30015" or "https://hana.company.com:30015"
      const cleanUrl = hostUrl.replace(/^https?:\/\//, '');
      const parts = cleanUrl.split(':');
      host = parts[0];
      port = parseInt(parts[1] || '30015', 10);

      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('Invalid port number');
      }
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Invalid host URL format. Expected: hostname:port (e.g., 10.0.1.105:30015)',
        details: { responseTime: Date.now() - startTime },
      });
    }

    // Validate SID format (3 characters)
    if (!/^[A-Z0-9]{3}$/i.test(systemId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid System ID (SID). Must be exactly 3 alphanumeric characters.',
        details: { responseTime: Date.now() - startTime },
      });
    }

    // Validate client number (3 digits)
    if (!/^\d{3}$/.test(client)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid client number. Must be exactly 3 digits (e.g., 100, 400).',
        details: { responseTime: Date.now() - startTime },
      });
    }

    console.log(`[SAP Test] Testing connection to ${host}:${port}, SID: ${systemId}, Client: ${client}`);

    // Test 1: Network reachability via TCP connect
    // Since we can't do raw TCP in Edge runtime, we'll try HTTP(S)
    // SAP HANA XS/XSA typically has HTTP endpoints we can probe

    // Try HANA XSA healthcheck endpoint (common patterns)
    const testUrls = [
      `https://${host}:${port}/sap/hana/xs/formLogin/logout.html`,
      `https://${host}:${port}/sap/bc/ping`,
      `http://${host}:${port - 2}/`, // Instance 00 HTTP port pattern
    ];

    let reachable = false;
    let reachableUrl = '';

    for (const testUrl of testUrls) {
      try {
        const response = await fetch(testUrl, {
          method: 'HEAD',
          // @ts-expect-error - Next.js fetch supports this
          rejectUnauthorized: false,
          signal: AbortSignal.timeout(5000),
        });

        // Any response (even 401/403) means server is reachable
        if (response.status < 500) {
          reachable = true;
          reachableUrl = testUrl;
          break;
        }
      } catch {
        // Try next URL
        continue;
      }
    }

    const responseTime = Date.now() - startTime;

    // If no HTTP endpoints responded, try a basic socket test
    // Note: In serverless, we can't do raw TCP - report as validation-only
    if (!reachable) {
      // Since this is a private IP (10.0.1.105), it's likely only reachable
      // from within the corporate network
      if (host.startsWith('10.') || host.startsWith('192.168.') || host.startsWith('172.')) {
        return NextResponse.json({
          success: false,
          message: `SAP HANA server at ${host}:${port} is not reachable from this location. This appears to be an internal IP - you may need to be on the corporate network or VPN.`,
          details: {
            host,
            port,
            systemId,
            client,
            responseTime,
          },
        });
      }

      return NextResponse.json({
        success: false,
        message: `Unable to reach SAP HANA server at ${host}:${port}. Please verify the host and port are correct and that the server is running.`,
        details: {
          host,
          port,
          systemId,
          client,
          responseTime,
        },
      });
    }

    // Server is reachable - we validated format and connectivity
    // Full authentication test would require the HANA database driver
    // which needs the Python/Node backend

    return NextResponse.json({
      success: true,
      message: `SAP HANA server is reachable at ${host}:${port}. Credentials will be validated when sync starts.`,
      details: {
        host,
        port,
        systemId,
        client,
        responseTime,
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('[SAP Test] Error:', error);

    return NextResponse.json({
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { responseTime },
    });
  }
}
