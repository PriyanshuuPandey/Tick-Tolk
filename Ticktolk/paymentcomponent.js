// PaymentComponent.jsx
import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import axios from 'axios';

const PaymentComponent = () => {
  const [amount, setAmount] = useState(10);
  const [paymentData, setPaymentData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const generateUpiLink = async () => {
    try {
      const response = await axios.post('/api/payments/generate-upi-link', { amount });
      setPaymentData(response.data);
      startPaymentPolling(response.data.txnId);
    } catch (error) {
      console.error('Error generating UPI link:', error);
    }
  };

  const startPaymentPolling = (txnId) => {
    setIsPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/payments/check-status?txnId=${txnId}`);
        if (response.data.status === 'completed') {
          clearInterval(interval);
          setIsPolling(false);
          alert('Payment successful! Coins added to your account.');
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setIsPolling(false);
          alert('Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000); // Check every 5 seconds
  };

  return (
    <div className="payment-container">
      <h2>Purchase Coins</h2>
      
      <div className="coin-packages">
        <button onClick={() => setAmount(10)}>50 Coins - ₹10</button>
        <button onClick={() => setAmount(20)}>100 Coins - ₹20</button>
        <button onClick={() => setAmount(50)}>250 Coins - ₹50</button>
        <button onClick={() => setAmount(100)}>500 Coins - ₹100</button>
        <button onClick={() => setAmount(1000)}>5000 Coins - ₹1000</button>
      </div>

      {paymentData ? (
        <div className="upi-payment-section">
          <h3>Pay with UPI</h3>
          <p>Send ₹{amount} to:</p>
          <p><strong>UPI ID:</strong> {paymentData.merchantUpiId}</p>
          <p><strong>Name:</strong> {paymentData.merchantName}</p>
          <p><strong>Note:</strong> {paymentData.note}</p>
          
          <div className="qr-code">
            <QRCode value={paymentData.qrData} size={200} />
          </div>
          
          <p>OR</p>
          
          <a href={paymentData.upiLink} className="open-upi-app">
            Open in UPI App
          </a>
          
          {isPolling && <p>Waiting for payment confirmation...</p>}
        </div>
      ) : (
        <button onClick={generateUpiLink} className="proceed-button">
          Proceed to Pay ₹{amount}
        </button>
      )}
    </div>
  );
};

export default PaymentComponent;