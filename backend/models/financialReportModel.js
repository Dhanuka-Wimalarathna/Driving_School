import sqldb from '../config/sqldb.js';

// Get revenue data for a specific date range with optional filters
export const getRevenueData = (startDate, endDate, filter = {}) => {
  return new Promise((resolve, reject) => {
    let whereConditions = ["status = 'paid'"];
    let queryParams = [];
    
    // Add date range filter
    if (startDate && endDate) {
      whereConditions.push("transaction_date BETWEEN ? AND ?");
      queryParams.push(startDate, endDate);
    }
    
    // Add package filter if provided
    if (filter.packageId) {
      whereConditions.push("package_id = ?");
      queryParams.push(filter.packageId);
    }
    
    // Add payment method filter if provided
    if (filter.paymentMethod) {
      whereConditions.push("payment_method = ?");
      queryParams.push(filter.paymentMethod);
    }
    
    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : '';
    
    const query = `
      SELECT 
        SUM(amount) AS total_revenue,
        COUNT(*) AS transaction_count,
        AVG(amount) AS average_transaction,
        DATE_FORMAT(transaction_date, '%Y-%m') AS month
      FROM payments
      ${whereClause}
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month
    `;
    
    sqldb.query(query, queryParams, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get detailed revenue by package
export const getRevenueByPackage = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.package_id,
        pkg.title AS package_name,
        COUNT(*) AS total_sales,
        SUM(p.amount) AS revenue,
        AVG(p.amount) AS average_sale
      FROM payments p
      JOIN packages pkg ON p.package_id = pkg.package_id
      WHERE p.status = 'paid'
        ${startDate && endDate ? 'AND p.transaction_date BETWEEN ? AND ?' : ''}
      GROUP BY p.package_id, pkg.title
      ORDER BY revenue DESC
    `;
    
    const queryParams = startDate && endDate ? [startDate, endDate] : [];
    
    sqldb.query(query, queryParams, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get payment method distribution
export const getPaymentMethodDistribution = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        payment_method,
        COUNT(*) AS transaction_count,
        SUM(amount) AS total_amount,
        (SUM(amount) / (SELECT SUM(amount) FROM payments WHERE status = 'paid'
          ${startDate && endDate ? 'AND transaction_date BETWEEN ? AND ?' : ''}
        )) * 100 AS percentage
      FROM payments
      WHERE status = 'paid'
        ${startDate && endDate ? 'AND transaction_date BETWEEN ? AND ?' : ''}
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `;
    
    const queryParams = startDate && endDate ? [startDate, endDate, startDate, endDate] : [];
    
    sqldb.query(query, queryParams, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Calculate estimated costs and profit
export const calculateProfitMetrics = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    // Fetch total revenue for the period
    const revenueQuery = `
      SELECT SUM(amount) AS total_revenue
      FROM payments
      WHERE status = 'paid'
        ${startDate && endDate ? 'AND transaction_date BETWEEN ? AND ?' : ''}
    `;
    
    const queryParams = startDate && endDate ? [startDate, endDate] : [];
    
    sqldb.query(revenueQuery, queryParams, (err, revenueResults) => {
      if (err) return reject(err);
      
      const totalRevenue = revenueResults[0].total_revenue || 0;
      
      // Monthly fixed costs (rent, utilities, admin, etc.)
      const fixedCosts = 25000;
      
      // Calculate monthly profits directly without variable costs
      // This assumes monthly profit is simply revenue minus fixed costs
      const monthlyProfit = totalRevenue - fixedCosts;
      
      // Net profit is the same as monthly profit in this model
      const netProfit = monthlyProfit;
      
      // Calculate profit margin
      const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      resolve({
        totalRevenue,
        fixedCosts,
        // Remove variableCosts from the response or set to zero
        variableCosts: 0, // Set to zero instead of removing to prevent the error
        totalCosts: fixedCosts, // Total costs are just fixed costs now
        // Set gross profit to same as net profit since we're not using variable costs
        grossProfit: netProfit,
        netProfit,
        grossProfitMargin: netProfitMargin, // Same as net profit margin in this model
        netProfitMargin
      });
    });
  });
};

// Get monthly profit trends
export const getMonthlyProfitTrends = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,
        SUM(amount) AS monthly_revenue
      FROM payments
      WHERE status = 'paid'
        ${startDate && endDate ? 'AND transaction_date BETWEEN ? AND ?' : ''}
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month ASC
    `;
    
    const queryParams = startDate && endDate ? [startDate, endDate] : [];
    
    sqldb.query(query, queryParams, (err, results) => {
      if (err) return reject(err);
      
      // Calculate estimated costs and profits for each month
      const monthlyTrends = results.map(month => {
        const monthlyRevenue = parseFloat(month.monthly_revenue) || 0;
        const fixedCosts = 25000 / results.length; // Distribute fixed costs evenly
        const variableCosts = monthlyRevenue * 0.4;
        const totalCosts = fixedCosts + variableCosts;
        const grossProfit = monthlyRevenue - variableCosts;
        const netProfit = monthlyRevenue - totalCosts;
        
        return {
          month: month.month,
          revenue: monthlyRevenue,
          costs: totalCosts,
          profit: netProfit,
          profitMargin: monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0
        };
      });
      
      resolve(monthlyTrends);
    });
  });
}; 