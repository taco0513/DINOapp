// Visa Expiry Email Templates
// 비자 만료 이메일 템플릿 시스템

interface VisaTemplateData {
  userName?: string;
  countryName: string;
  visaType: string;
  expiryDate: string;
  daysUntilExpiry: number;
  urgencyLevel: 'reminder' | 'warning' | 'urgent' | 'expired';
  renewalInfo?: {
    isRenewalPossible: boolean;
    renewalDeadline?: string;
    renewalUrl?: string;
  };
  tripInfo?: {
    hasUpcomingTrip: boolean;
    tripDate?: string;
    destination?: string;
  };
}

export class VisaEmailTemplates {
  /**
   * 기본 비자 만료 알림 템플릿
   */
  static getExpiryAlertTemplate(data: VisaTemplateData): { subject: string; html: string; text: string } {
    const { userName, countryName, visaType, expiryDate, daysUntilExpiry, urgencyLevel } = data;
    
    let subject = '';
    let urgencyIcon = '';
    let urgencyColor = '';
    let urgencyMessage = '';

    switch (urgencyLevel) {
      case 'urgent':
        subject = `🚨 긴급: ${countryName} 비자 ${daysUntilExpiry}일 후 만료!`;
        urgencyIcon = '🚨';
        urgencyColor = '#dc2626';
        urgencyMessage = '즉시 조치가 필요합니다!';
        break;
      case 'warning':
        subject = `⚠️ 주의: ${countryName} 비자 ${daysUntilExpiry}일 후 만료`;
        urgencyIcon = '⚠️';
        urgencyColor = '#ea580c';
        urgencyMessage = '갱신 또는 출국 준비를 시작하세요.';
        break;
      case 'expired':
        subject = `❌ 만료됨: ${countryName} 비자가 만료되었습니다`;
        urgencyIcon = '❌';
        urgencyColor = '#dc2626';
        urgencyMessage = '긴급 조치가 필요합니다!';
        break;
      default:
        subject = `📅 알림: ${countryName} 비자 ${daysUntilExpiry}일 후 만료`;
        urgencyIcon = '📅';
        urgencyColor = '#2563eb';
        urgencyMessage = '미리 갱신 계획을 세우세요.';
    }

    const html = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}dd 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .header .icon { font-size: 48px; margin-bottom: 16px; }
          .content { padding: 40px 30px; }
          .visa-info { background: #f1f5f9; border-radius: 8px; padding: 24px; margin: 24px 0; }
          .visa-info h3 { margin: 0 0 16px 0; color: #1e293b; font-size: 18px; }
          .info-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .info-label { color: #64748b; font-weight: 500; }
          .info-value { color: #1e293b; font-weight: 600; }
          .urgency-message { background: ${urgencyColor}15; color: ${urgencyColor}; padding: 16px; border-radius: 8px; text-align: center; font-weight: 600; margin: 24px 0; }
          .actions { margin: 32px 0; text-align: center; }
          .btn { display: inline-block; background: ${urgencyColor}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 0 8px; }
          .btn:hover { opacity: 0.9; }
          .footer { background: #f8fafc; padding: 24px; border-radius: 0 0 12px 12px; text-align: center; color: #64748b; font-size: 14px; }
          .footer a { color: ${urgencyColor}; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">${urgencyIcon}</div>
            <h1>비자 만료 알림</h1>
            <p>${urgencyMessage}</p>
          </div>
          
          <div class="content">
            ${userName ? `<p>안녕하세요, ${userName}님!</p>` : '<p>안녕하세요!</p>'}
            
            <div class="visa-info">
              <h3>비자 정보</h3>
              <div class="info-row">
                <span class="info-label">국가</span>
                <span class="info-value">${countryName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">비자 종류</span>
                <span class="info-value">${visaType}</span>
              </div>
              <div class="info-row">
                <span class="info-label">만료일</span>
                <span class="info-value">${expiryDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">남은 일수</span>
                <span class="info-value" style="color: ${urgencyColor};">
                  ${daysUntilExpiry >= 0 ? `${daysUntilExpiry}일` : `${Math.abs(daysUntilExpiry)}일 전 만료`}
                </span>
              </div>
            </div>

            <div class="urgency-message">
              ${urgencyMessage}
            </div>

            ${data.tripInfo?.hasUpcomingTrip ? `
              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <h4 style="margin: 0 0 8px 0; color: #92400e;">⚠️ 예정된 여행이 있습니다!</h4>
                <p style="margin: 0; color: #92400e;">
                  ${data.tripInfo.destination}로의 여행 (${data.tripInfo.tripDate})이 계획되어 있습니다. 
                  비자 상태를 확인하시기 바랍니다.
                </p>
              </div>
            ` : ''}

            <div class="actions">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-visas" class="btn">내 비자 관리</a>
              ${data.renewalInfo?.renewalUrl ? `<a href="${data.renewalInfo.renewalUrl}" class="btn">비자 갱신하기</a>` : ''}
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              이 알림은 DINO 여행 관리 시스템에서 자동으로 발송됩니다. 
              비자 정보가 잘못되었거나 이미 갱신하셨다면 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-visas" style="color: ${urgencyColor};">내 비자</a> 
              페이지에서 정보를 업데이트해주세요.
            </p>
          </div>

          <div class="footer">
            <p>
              <strong>DINO - Digital Nomad Travel Manager</strong><br>
              스마트한 여행 관리를 위한 플랫폼<br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}">웹사이트 방문</a> | 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings">알림 설정</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
${urgencyIcon} 비자 만료 알림 ${urgencyIcon}

${userName ? `안녕하세요, ${userName}님!` : '안녕하세요!'}

${countryName} ${visaType} 비자가 ${daysUntilExpiry >= 0 ? `${daysUntilExpiry}일 후` : `${Math.abs(daysUntilExpiry)}일 전`} 만료됩니다.
만료일: ${expiryDate}

${urgencyMessage}

${data.tripInfo?.hasUpcomingTrip ? `
⚠️ 예정된 여행: ${data.tripInfo.destination} (${data.tripInfo.tripDate})
비자 상태를 확인하시기 바랍니다.
` : ''}

비자 관리: ${process.env.NEXT_PUBLIC_APP_URL}/my-visas
${data.renewalInfo?.renewalUrl ? `비자 갱신: ${data.renewalInfo.renewalUrl}` : ''}

---
DINO - Digital Nomad Travel Manager
스마트한 여행 관리를 위한 플랫폼
    `;

    return { subject, html, text };
  }

  /**
   * 주간 비자 요약 템플릿
   */
  static getWeeklySummaryTemplate(visas: VisaTemplateData[]): { subject: string; html: string; text: string } {
    const expiringCount = visas.filter(v => v.daysUntilExpiry <= 30).length;
    const urgentCount = visas.filter(v => v.daysUntilExpiry <= 7).length;
    
    const subject = `📊 주간 비자 현황 요약 ${urgentCount > 0 ? `(긴급 ${urgentCount}개)` : ''}`;

    const html = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
          .content { padding: 30px; }
          .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 24px 0; }
          .summary-card { background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; }
          .summary-number { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
          .visa-list { margin: 24px 0; }
          .visa-item { background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 12px 0; }
          .visa-item.urgent { background: #fef2f2; border-left: 4px solid #dc2626; }
          .visa-item.warning { background: #fef3c7; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 주간 비자 현황 요약</h1>
            <p>이번 주 비자 만료 현황을 확인하세요</p>
          </div>
          
          <div class="content">
            <div class="summary-cards">
              <div class="summary-card">
                <div class="summary-number" style="color: #2563eb;">${visas.length}</div>
                <div>전체 비자</div>
              </div>
              <div class="summary-card">
                <div class="summary-number" style="color: #f59e0b;">${expiringCount}</div>
                <div>30일 내 만료</div>
              </div>
              <div class="summary-card">
                <div class="summary-number" style="color: #dc2626;">${urgentCount}</div>
                <div>7일 내 만료</div>
              </div>
            </div>

            ${expiringCount > 0 ? `
              <h3>만료 예정 비자</h3>
              <div class="visa-list">
                ${visas.filter(v => v.daysUntilExpiry <= 30).map(visa => `
                  <div class="visa-item ${visa.daysUntilExpiry <= 7 ? 'urgent' : 'warning'}">
                    <strong>${visa.countryName} ${visa.visaType}</strong><br>
                    만료일: ${visa.expiryDate} (${visa.daysUntilExpiry}일 후)
                  </div>
                `).join('')}
              </div>
            ` : '<p>✅ 30일 내 만료되는 비자가 없습니다.</p>'}

            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-visas" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                전체 비자 관리
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
📊 주간 비자 현황 요약

전체 비자: ${visas.length}개
30일 내 만료: ${expiringCount}개
7일 내 만료: ${urgentCount}개

${expiringCount > 0 ? `
만료 예정 비자:
${visas.filter(v => v.daysUntilExpiry <= 30).map(visa => 
  `- ${visa.countryName} ${visa.visaType}: ${visa.expiryDate} (${visa.daysUntilExpiry}일 후)`
).join('\n')}
` : '✅ 30일 내 만료되는 비자가 없습니다.'}

비자 관리: ${process.env.NEXT_PUBLIC_APP_URL}/my-visas

---
DINO - Digital Nomad Travel Manager
    `;

    return { subject, html, text };
  }

  /**
   * 비자 갱신 성공 확인 템플릿
   */
  static getRenewalSuccessTemplate(data: VisaTemplateData): { subject: string; html: string; text: string } {
    const subject = `✅ ${data.countryName} 비자 갱신 완료 확인`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f0fdf4;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
            <h1 style="margin: 0; font-size: 24px;">비자 갱신 완료!</h1>
          </div>
          
          <div style="padding: 40px 30px; text-align: center;">
            ${data.userName ? `<p>축하합니다, ${data.userName}님!</p>` : '<p>축하합니다!</p>'}
            <p><strong>${data.countryName} ${data.visaType}</strong> 비자가 성공적으로 갱신되었습니다.</p>
            <p>새로운 만료일: <strong>${data.expiryDate}</strong></p>
            
            <div style="margin: 32px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/my-visas" 
                 style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
                업데이트된 비자 확인
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
✅ 비자 갱신 완료!

${data.userName ? `축하합니다, ${data.userName}님!` : '축하합니다!'}

${data.countryName} ${data.visaType} 비자가 성공적으로 갱신되었습니다.
새로운 만료일: ${data.expiryDate}

비자 확인: ${process.env.NEXT_PUBLIC_APP_URL}/my-visas

---
DINO - Digital Nomad Travel Manager
    `;

    return { subject, html, text };
  }
}

// 템플릿 타입 정의
export type VisaEmailTemplate = 'expiry_alert' | 'weekly_summary' | 'renewal_success';

// 편의 함수들
export const generateVisaExpiryEmail = (data: VisaTemplateData) => 
  VisaEmailTemplates.getExpiryAlertTemplate(data);

export const generateWeeklySummaryEmail = (visas: VisaTemplateData[]) => 
  VisaEmailTemplates.getWeeklySummaryTemplate(visas);

export const generateRenewalSuccessEmail = (data: VisaTemplateData) => 
  VisaEmailTemplates.getRenewalSuccessTemplate(data);