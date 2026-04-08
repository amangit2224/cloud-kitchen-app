const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Send password reset email
const sendPasswordResetEmail = async (to, resetToken, userName) => {
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'Cloud Kitchen <noreply@cloudkitchen.com>',
    to: to,
    subject: 'Password Reset Request - Cloud Kitchen',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f43f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>We received a request to reset your password for your Cloud Kitchen account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="background: white; padding: 15px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <p>Thanks,<br>Cloud Kitchen Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Cloud Kitchen. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (to, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'Cloud Kitchen <noreply@cloudkitchen.com>',
    to: to,
    subject: 'Welcome to Cloud Kitchen! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f43f5e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Cloud Kitchen!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Welcome aboard! We're excited to have you join our Cloud Kitchen family.</p>
            <p>Start exploring our delicious menu and place your first order today!</p>
            <p style="text-align: center;">
              <a href="http://localhost:3000/menu" class="button">Browse Menu</a>
            </p>
            <p>If you have any questions, feel free to reach out to us anytime.</p>
            <p>Happy eating! 🍔🍕🍝</p>
            <p>Cheers,<br>Cloud Kitchen Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', to);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

const sendOrderConfirmationEmail = async (to, userName, order) => {
  const itemsHtml = order.orderItems.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}× ${item.menuItem?.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: process.env.EMAIL_USER || 'Cloud Kitchen <noreply@cloudkitchen.com>',
    to: to,
    subject: `Order Confirmed! 🍽️ - Order #${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f43f5e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          .total { font-size: 18px; font-weight: bold; color: #f43f5e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Your order <strong>#${order.id}</strong> has been placed successfully!</p>
            
            <h3>Order Summary:</h3>
            <table>
              <thead>
                <tr><th>Item</th><th style="text-align: right">Price</th></tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr><td style="padding: 12px 0 0 0;"><strong>Total</strong></td><td style="padding: 12px 0 0 0; text-align: right;"><strong class="total">₹${parseFloat(order.totalAmount).toFixed(2)}</strong></td></tr>
              </tfoot>
            </table>

            <h3>Delivery Details:</h3>
            <p><strong>Address:</strong> ${order.deliveryAddress}</p>
            <p><strong>Phone:</strong> ${order.phoneNumber}</p>
            ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}

            <p style="margin-top: 20px;">You can track your order status in real-time from your orders page.</p>
            
            <p style="text-align: center;">
              <a href="http://localhost:3000/orders/${order.id}" class="button">Track Order</a>
            </p>
            
            <p>Thanks for ordering from Cloud Kitchen! 🍔🍕</p>
            <p>Cheers,<br>Cloud Kitchen Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', to);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return false;
  }
};

// Send order status update email
const sendOrderStatusEmail = async (to, userName, order, oldStatus, newStatus) => {
  const statusMessages = {
    confirmed: '✅ Your order has been confirmed by the restaurant!',
    preparing: '👨‍🍳 Your order is being prepared in the kitchen!',
    ready: '📦 Your order is ready for pickup! A rider will be assigned shortly.',
    out_for_delivery: '🛵 Your rider is on the way with your order!',
    delivered: '🎉 Your order has been delivered! Enjoy your meal!',
    cancelled: '❌ Your order has been cancelled.'
  };

  const mailOptions = {
    from: process.env.EMAIL_USER || 'Cloud Kitchen <noreply@cloudkitchen.com>',
    to: to,
    subject: `Order Update - Order #${order.id}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f43f5e 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f43f5e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Status Update</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Your order <strong>#${order.id}</strong> status has changed from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong>.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <p style="font-size: 18px; margin: 0;">${statusMessages[newStatus] || `Order is now ${newStatus}`}</p>
            </div>

            <p style="text-align: center;">
              <a href="http://localhost:3000/orders/${order.id}" class="button">Track Your Order</a>
            </p>
            
            <p>Thank you for choosing Cloud Kitchen!</p>
            <p>Cheers,<br>Cloud Kitchen Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order status email sent to:', to);
    return true;
  } catch (error) {
    console.error('Error sending order status email:', error);
    return false;
  }
};

// Send rider approval email
const sendRiderApprovalEmail = async (to, riderName, status) => {
  const isApproved = status === 'approved';
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'Cloud Kitchen <noreply@cloudkitchen.com>',
    to: to,
    subject: isApproved ? '🎉 Rider Application Approved!' : 'Rider Application Update',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${isApproved ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f43f5e; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isApproved ? '🎉 Congratulations!' : 'Application Update'}</h1>
          </div>
          <div class="content">
            <p>Hello ${riderName},</p>
            ${isApproved ? `
              <p>Great news! Your rider application has been <strong>approved</strong>! 🎉</p>
              <p>You can now log in to your rider account and start delivering orders.</p>
              <p style="text-align: center;">
                <a href="http://localhost:3000/login" class="button">Login to Dashboard</a>
              </p>
              <p><strong>Next steps:</strong></p>
              <ul>
                <li>Log in to your account</li>
                <li>Go online to start receiving delivery requests</li>
                <li>Accept orders and earn 10% of each order value</li>
              </ul>
            ` : `
              <p>We regret to inform you that your rider application has been <strong>rejected</strong>.</p>
              <p>This could be due to incomplete information or not meeting our requirements.</p>
              <p>Please contact support for more information or to reapply.</p>
            `}
            <p>Thank you for your interest in joining Cloud Kitchen!</p>
            <p>Cheers,<br>Cloud Kitchen Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`${status} email sent to rider:`, to);
    return true;
  } catch (error) {
    console.error('Error sending rider approval email:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendRiderApprovalEmail
};
