export const getEmailVerificationTemplate = (code: string) => `
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
  <h2 style="color: #0a7ea4;">Підтвердіть ваш email</h2>
  <p>Ваш код підтвердження:</p>
  <div style="
    display: inline-block;
    background: #f0f4f8;
    border-radius: 12px;
    padding: 16px 32px;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: 8px;
    color: #11181C;
    margin: 16px 0;
  ">${code}</div>
  <p style="color: #687076; font-size: 14px;">Код дійсний 15 хвилин. Не передавайте його нікому.</p>
</div>
`;
