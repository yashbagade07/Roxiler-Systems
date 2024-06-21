const ProductTransaction = require('../models/ProductTransaction');

class ProductControler {
  async initializeDatabase(req, res) {
    try {
      const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      const data = response.data;
      data.forEach(item => {
        const productTransaction = new ProductTransaction({
          title: item.title,
          description: item.description,
          price: item.price,
          dateOfSale: new Date(item.dateOfSale),
          category: item.category,
          sold: item.sold
        });
        productTransaction.save();
      });
      res.json({ message: 'Database initialized successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async listTransactions(req, res) {
    const { month, search, page, perPage } = req.query;
    const query = {};
    if (month) {
      query.dateOfSale = { $month: month };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } }
      ];
    }
    const transactions = await ProductTransaction.find(query)
     .skip((page - 1) * perPage)
     .limit(perPage);
    res.json(transactions);
  }

  async getStatistics(req, res) {
    const { month } = req.query;
    const query = { dateOfSale: { $month: month } };
    const transactions = await ProductTransaction.find(query);
    const totalSaleAmount = transactions.reduce((acc, transaction) => acc + transaction.price, 0);
    const totalSoldItems = transactions.filter(transaction => transaction.sold).length;
    const totalNotSoldItems = transactions.filter(transaction =>!transaction.sold).length;
    res.json({
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems
    });
  }

  async getBarChart(req, res) {
    const { month } = req.query;
    const query = { dateOfSale: { $month: month } };
    const transactions = await ProductTransaction.find(query);
    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity }
    ];
    const data = priceRanges.map(range => {
      const count = transactions.filter(transaction => transaction.price >= range.min && transaction.price <= range.max).length;
      return { range: `${range.min} - ${range.max}`, count };
    });
    res.json(data);
  }

  async getPieChart(req, res) {
    const { month } = req.query;
    const query = { dateOfSale: { $month: month } };
    const transactions = await ProductTransaction.find(query);
    const categories = {};
    transactions.forEach(transaction => {
      if (!categories[transaction.category]) {
        categories[transaction.category] = 0;
      }
      categories[transaction.category]++;
    });
    const data = Object.keys(categories).map(category => ({ category, count: categories[category] }));
    res.json(data);
  }

  async getCombinedData(req, res) {
    const { month } = req.query;
    const statistics = await this.getStatistics(req, res);
    const barChart = await this.getBarChart(req, res);
    const pieChart = await this.getPieChart(req, res);
    res.json({ statistics, barChart, pieChart });
  }
}

module.exports = ProductControler;