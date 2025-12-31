import nodemailer from 'nodemailer';

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 发送订单确认邮件
export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  totalAmount: number,
  items: Array<{ name: string; quantity: number; price: number }>
): Promise<void> {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>¥${item.price.toFixed(2)}</td>
      <td>¥${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: '订单确认 - 感谢您的购买',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">订单确认</h2>
        <p>感谢您的购买！您的订单已成功创建。</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <p><strong>订单号：</strong>${orderId}</p>
          <p><strong>订单总额：</strong>¥${totalAmount.toFixed(2)}</p>
        </div>

        <h3>订单详情：</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #333; color: white;">
              <th style="padding: 10px; text-align: left;">商品名称</th>
              <th style="padding: 10px; text-align: left;">数量</th>
              <th style="padding: 10px; text-align: left;">单价</th>
              <th style="padding: 10px; text-align: left;">小计</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <p style="color: #666; font-size: 14px;">
          我们会在订单发货后及时通知您。如有任何问题，请联系客服。
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`订单确认邮件已发送至: ${email}`);
  } catch (error) {
    console.error('发送邮件失败:', error);
    throw error;
  }
}

// 测试邮件连接
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('邮件服务连接成功');
    return true;
  } catch (error) {
    console.error('邮件服务连接失败:', error);
    return false;
  }
}


