/**
 * P6 Connection Test API Route
 * @governance COMPONENT-001, SEC-001
 *
 * Tests connectivity to Primavera P6 SOAP API by attempting
 * to authenticate and retrieve the AuthenticationService WSDL.
 */
import { NextRequest, NextResponse } from 'next/server';

interface P6TestRequest {
  wsdlBaseUrl: string;
  databaseInstance: string;
  username: string;
  password: string;
}

interface P6TestResponse {
  success: boolean;
  message: string;
  details?: {
    serverVersion?: string;
    databaseInstance?: string;
    responseTime?: number;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<P6TestResponse>> {
  const startTime = Date.now();

  try {
    const body: P6TestRequest = await request.json();
    const { wsdlBaseUrl, databaseInstance, username, password } = body;

    // Validate required fields
    if (!wsdlBaseUrl || !databaseInstance || !username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: wsdlBaseUrl, databaseInstance, username, password',
      }, { status: 400 });
    }

    // Normalize WSDL URL
    const baseUrl = wsdlBaseUrl.replace(/\/+$/, '');
    const authServiceUrl = `${baseUrl}/AuthenticationService?wsdl`;

    // Step 1: Test WSDL endpoint accessibility
    console.log(`[P6 Test] Testing WSDL endpoint: ${authServiceUrl}`);

    const wsdlResponse = await fetch(authServiceUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/xml, application/xml',
      },
      // Skip SSL verification for self-signed certs (common in enterprise P6)
      // @ts-expect-error - Next.js fetch supports this in Node runtime
      rejectUnauthorized: false,
    });

    if (!wsdlResponse.ok) {
      return NextResponse.json({
        success: false,
        message: `P6 server unreachable: HTTP ${wsdlResponse.status} ${wsdlResponse.statusText}`,
        details: {
          responseTime: Date.now() - startTime,
        },
      });
    }

    const wsdlContent = await wsdlResponse.text();

    // Verify it's actually a WSDL
    if (!wsdlContent.includes('definitions') && !wsdlContent.includes('wsdl:')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid response from P6 server - not a valid WSDL document',
        details: {
          responseTime: Date.now() - startTime,
        },
      });
    }

    // Step 2: Test authentication with SOAP login request
    const loginSoapEnvelope = buildLoginSoapRequest(username, password, databaseInstance);
    const loginUrl = `${baseUrl}/AuthenticationService`;

    console.log(`[P6 Test] Testing authentication for user: ${username}`);

    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml;charset=UTF-8',
        'SOAPAction': '""',
      },
      body: loginSoapEnvelope,
      // @ts-expect-error - Next.js fetch supports this in Node runtime
      rejectUnauthorized: false,
    });

    const loginResult = await loginResponse.text();
    const responseTime = Date.now() - startTime;

    // Check for successful login (P6 returns token or success)
    if (loginResult.includes('Fault') || loginResult.includes('fault')) {
      // Extract fault message
      const faultMatch = loginResult.match(/<faultstring[^>]*>([^<]+)<\/faultstring>/i);
      const faultMessage = faultMatch ? faultMatch[1] : 'Authentication failed';

      return NextResponse.json({
        success: false,
        message: `P6 Authentication failed: ${faultMessage}`,
        details: {
          databaseInstance,
          responseTime,
        },
      });
    }

    // Success - connection and auth working
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to P6 and authenticated',
      details: {
        databaseInstance,
        responseTime,
        serverVersion: extractServerVersion(wsdlContent),
      },
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('[P6 Test] Error:', error);

    // Handle specific error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        success: false,
        message: 'Network error: Unable to reach P6 server. Check URL and firewall settings.',
        details: { responseTime },
      });
    }

    return NextResponse.json({
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: { responseTime },
    });
  }
}

/**
 * Build SOAP envelope for P6 Login request
 */
function buildLoginSoapRequest(username: string, password: string, databaseInstance: string): string {
  const timestamp = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:v1="http://xmlns.oracle.com/Primavera/P6/WS/Authentication/V1">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${escapeXml(username)}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${escapeXml(password)}</wsse:Password>
        <wsu:Created xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">${timestamp}</wsu:Created>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <v1:Login>
      <v1:DatabaseInstanceId>${escapeXml(databaseInstance)}</v1:DatabaseInstanceId>
    </v1:Login>
  </soapenv:Body>
</soapenv:Envelope>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Extract P6 server version from WSDL if available
 */
function extractServerVersion(wsdlContent: string): string | undefined {
  // P6 WSDL sometimes includes version in comments or documentation
  const versionMatch = wsdlContent.match(/P6\s*([\d.]+)/i) ||
                       wsdlContent.match(/version["\s:]*([0-9.]+)/i);
  return versionMatch ? versionMatch[1] : undefined;
}
