import sqldb from '../config/sqldb.js';

// Helper function to format end date to include full day
const formatEndDate = (dateString) => {
  // If dateString already includes time, return as is
  if (dateString.includes(':')) return dateString;
  
  // Otherwise, append 23:59:59 to include the full day
  return `${dateString} 23:59:59`;
};

// Get individual payment transactions for a specific date range with optional filters
export const getPaymentTransactions = (startDate, endDate, filter = {}) => {
  return new Promise((resolve, reject) => {
    let whereConditions = ["p.status = 'paid'"];
    let queryParams = [];
    
    // Add date range filter with formatted end date
    whereConditions.push("p.transaction_date BETWEEN ? AND ?");
    queryParams.push(startDate, formatEndDate(endDate));
    
    // Add package filter if provided
    if (filter.packageId) {
      whereConditions.push("p.package_id = ?");
      queryParams.push(filter.packageId);
    }
    
    // Add payment method filter if provided
    if (filter.paymentMethod) {
      whereConditions.push("p.payment_method = ?");
      queryParams.push(filter.paymentMethod);
    }
    
    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : '';
    
    const query = `
      SELECT 
        p.payment_id,
        p.student_id,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        p.package_id,
        pkg.title AS package_name,
        p.amount,
        p.status,
        p.payment_method,
        p.transaction_id,
        DATE_FORMAT(p.transaction_date, '%Y-%m-%d') AS payment_date
      FROM payments p
      LEFT JOIN student s ON p.student_id = s.STU_ID
      LEFT JOIN packages pkg ON p.package_id = pkg.package_id
      ${whereClause}
      ORDER BY p.transaction_date DESC
    `;
    
    sqldb.query(query, queryParams, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Get revenue data for a specific date range with optional filters
export const getRevenueData = (startDate, endDate, filter = {}) => {
  return new Promise((resolve, reject) => {
    let whereConditions = ["p.status = 'paid'"];
    let queryParams = [];
    
    // Add date range filter with formatted end date
    whereConditions.push("p.transaction_date BETWEEN ? AND ?");
    queryParams.push(startDate, formatEndDate(endDate));
    
    // Add package filter if provided
    if (filter.packageId) {
      whereConditions.push("p.package_id = ?");
      queryParams.push(filter.packageId);
    }
    
    // Add payment method filter if provided
    if (filter.paymentMethod) {
      whereConditions.push("p.payment_method = ?");
      queryParams.push(filter.paymentMethod);
    }
    
    const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(" AND ")}` : '';
    
    // Query to get total sum of all payments within date range
    const totalQuery = `
      SELECT 
        SUM(p.amount) AS total_all_revenue,
        COUNT(*) AS total_transactions
      FROM payments p
      ${whereClause}
    `;
    
    // Monthly breakdown query
    const monthlyQuery = `
      SELECT 
        SUM(p.amount) AS total_revenue,
        COUNT(*) AS transaction_count,
        DATE_FORMAT(p.transaction_date, '%Y-%m') AS month,
        MONTHNAME(p.transaction_date) AS month_name,
        YEAR(p.transaction_date) AS year
      FROM payments p
      ${whereClause}
      GROUP BY DATE_FORMAT(p.transaction_date, '%Y-%m'), MONTHNAME(p.transaction_date), YEAR(p.transaction_date)
      ORDER BY month
    `;
    
    // Execute both queries
    sqldb.query(totalQuery, queryParams, (totalErr, totalResults) => {
      if (totalErr) return reject(totalErr);
      
      sqldb.query(monthlyQuery, queryParams, (monthlyErr, monthlyResults) => {
        if (monthlyErr) return reject(monthlyErr);
        
        // Combine the results
        const result = {
          totalAllRevenue: parseFloat(totalResults[0]?.total_all_revenue) || 0,
          totalTransactions: parseInt(totalResults[0]?.total_transactions) || 0,
          monthlyData: monthlyResults.map(month => ({
            ...month,
            total_revenue: parseFloat(month.total_revenue) || 0,
          }))
        };
        
        resolve(result);
      });
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
        AND p.transaction_date BETWEEN ? AND ?
      GROUP BY p.package_id, pkg.title
      ORDER BY revenue DESC
    `;
    
    const queryParams = [startDate, formatEndDate(endDate)];
    
    sqldb.query(query, queryParams, (err, results) => {
      if (err) return reject(err);
      
      const formattedResults = results.map(item => ({
        ...item,
        revenue: parseFloat(item.revenue) || 0,
        average_sale: parseFloat(item.average_sale) || 0,
        total_sales: parseInt(item.total_sales) || 0
      }));
      
      resolve(formattedResults);
    });
  });
};

// Get payment method distribution
export const getPaymentMethodDistribution = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.payment_method,
        COUNT(*) AS transaction_count,
        SUM(p.amount) AS total_amount,
        ROUND(
          (SUM(p.amount) / (
            SELECT SUM(amount) 
            FROM payments 
            WHERE status = 'paid' AND transaction_date BETWEEN ? AND ?
          )) * 100, 
          2
        ) AS percentage
      FROM payments p
      WHERE p.status = 'paid'
        AND p.transaction_date BETWEEN ? AND ?
      GROUP BY p.payment_method
      ORDER BY total_amount DESC
    `;
    
    const formattedEndDate = formatEndDate(endDate);
    const queryParams = [startDate, formattedEndDate, startDate, formattedEndDate];
    
    sqldb.query(query, queryParams, (err, results) => {
      if (err) return reject(err);
      
      const formattedResults = results.map(item => ({
        ...item,
        total_amount: parseFloat(item.total_amount) || 0,
        percentage: parseFloat(item.percentage) || 0,
        transaction_count: parseInt(item.transaction_count) || 0
      }));
      
      resolve(formattedResults);
    });
  });
};

// Helper function to calculate days between dates
const calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
};

// Calculate estimated costs and profit
export const calculateProfitMetrics = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    // Fetch total revenue for the period
    const revenueQuery = `
      SELECT SUM(amount) AS total_revenue
      FROM payments
      WHERE status = 'paid'
        AND transaction_date BETWEEN ? AND ?
    `;
    
    const queryParams = [startDate, formatEndDate(endDate)];
    
    sqldb.query(revenueQuery, queryParams, (err, revenueResults) => {
      if (err) return reject(err);
      
      const totalRevenue = parseFloat(revenueResults[0].total_revenue) || 0;
      
      // Calculate number of days in the period
      const daysInPeriod = calculateDays(startDate, endDate);
      
      // Monthly fixed costs (rent, utilities, admin, etc.)
      const monthlyFixedCosts = 25000;
      
      // Calculate prorated fixed costs based on the actual period
      const dailyFixedCosts = monthlyFixedCosts / 30; // Assuming 30 days per month
      const totalFixedCosts = dailyFixedCosts * daysInPeriod;
      
      // You can add actual expense tracking here if you have an expenses table
      // For now, using the fixed costs calculation
      const totalExpenses = totalFixedCosts;
      
      // Calculate profit
      const netProfit = totalRevenue - totalExpenses;
      
      // Calculate profit margin
      const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      // Since we're not tracking variable costs separately, gross profit = net profit
      const grossProfit = netProfit;
      const grossProfitMargin = netProfitMargin;
      
      resolve({
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        fixedCosts: Math.round(totalFixedCosts * 100) / 100,
        variableCosts: 0,
        totalCosts: Math.round(totalExpenses * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100, // Added for report compatibility
        grossProfit: Math.round(grossProfit * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        grossProfitMargin: Math.round(grossProfitMargin * 100) / 100,
        netProfitMargin: Math.round(netProfitMargin * 100) / 100,
        daysInPeriod,
        dailyFixedCosts: Math.round(dailyFixedCosts * 100) / 100
      });
    });
  });
};

// Get monthly profit trends (corrected to use same calculation method)
export const getMonthlyProfitTrends = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,
        SUM(amount) AS monthly_revenue,
        COUNT(*) AS transaction_count,
        MONTHNAME(transaction_date) AS month_name,
        YEAR(transaction_date) AS year
      FROM payments
      WHERE status = 'paid'
        AND transaction_date BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), MONTHNAME(transaction_date), YEAR(transaction_date)
      ORDER BY month ASC
    `;
    
    const queryParams = [startDate, formatEndDate(endDate)];
    
    sqldb.query(query, queryParams, (err, results) => {
      if (err) return reject(err);
      
      // Calculate estimated costs and profits for each month
      const monthlyTrends = results.map(month => {
        const monthlyRevenue = parseFloat(month.monthly_revenue) || 0;
        
        // Use the same fixed cost calculation as in calculateProfitMetrics
        const monthlyFixedCosts = 25000; // Fixed monthly costs
        
        // For monthly trends, we use full monthly costs since we're grouping by month
        const totalCosts = monthlyFixedCosts;
        const netProfit = monthlyRevenue - totalCosts;
        const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;
        
        return {
          month: month.month,
          month_name: month.month_name,
          year: month.year,
          revenue: Math.round(monthlyRevenue * 100) / 100,
          costs: Math.round(totalCosts * 100) / 100,
          profit: Math.round(netProfit * 100) / 100,
          profitMargin: Math.round(profitMargin * 100) / 100,
          transactionCount: parseInt(month.transaction_count) || 0
        };
      });
      
      resolve(monthlyTrends);
    });
  });
};

// Get expenses breakdown (if you have an expenses table)
export const getExpensesBreakdown = (startDate, endDate) => {
  return new Promise((resolve, reject) => {
    // If you have an expenses table, you can query it here
    // For now, returning the fixed cost breakdown
    
    const daysInPeriod = calculateDays(startDate, endDate);
    const monthlyFixedCosts = 25000;
    const dailyFixedCosts = monthlyFixedCosts / 30;
    const totalFixedCosts = dailyFixedCosts * daysInPeriod;
    
    // This is a placeholder - replace with actual expense categories if you have them
    const expenseBreakdown = [
      {
        category: 'Fixed Costs (Rent, Utilities, Admin)',
        amount: Math.round(totalFixedCosts * 100) / 100,
        percentage: 100.00
      }
      // Add more expense categories here if you have an expenses table
    ];
    
    resolve(expenseBreakdown);
  });
};