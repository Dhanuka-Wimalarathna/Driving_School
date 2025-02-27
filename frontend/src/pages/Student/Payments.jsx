import React from 'react';

const Payments = () => {
  const mockPayments = [
    { id: 1, date: "2023-10-01", amount: "$50", status: "Paid" },
  ];

  return (
    <div className="payments-page">
      <h2>Payment History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockPayments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.date}</td>
              <td>{payment.amount}</td>
              <td>{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;