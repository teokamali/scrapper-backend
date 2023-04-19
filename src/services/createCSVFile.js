const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ExcelJS = require('exceljs');
const logger = require('../config/logger');
const { Product, Company } = require('../models');

const fetchDataFromDataBase = async (companyName) => {
  logger.info(companyName);
  const company = await Company.findOne({ name: companyName });
  const products = await Product.find({ companyId: company._id });

  const allProduct = products.map((product, index) => {
    const { name, image, price, description } = product;
    return {
      id: index,
      type: 'simple',
      sku: '',
      name,
      published: '1',
      special: '0',
      visible: 'visible',
      shortDescription: '',
      description,
      sales_start: '',
      sales_end: '',
      taxable: 'taxable',
      taxClass: '',
      stock: '1',
      warehouse: '',
      warehouseLow: '',
      preSale: '0',
      separateSate: '0',
      weight: '',
      length: '',
      width: '',
      height: '',
      commentAllowed: '0',
      note: '',
      specialSalePrice: '',
      price,
      categories: '',
      tags: '',
      shipping: '',
      images: image,
      download: '',
      downloadExpire: '',
      parent: '',
      groupProduct: '',
      offer: '',
      relatedProducts: '',
      thirdPartyAddress: '',
      buttonText: '',
      position: '0',
    };
  });
  return allProduct;
};

const createCSVFile = async (companyName) => {
  const allProduct = await fetchDataFromDataBase(companyName);
  try {
    // Create a CSV file
    const csvWriter = createCsvWriter({
      path: `public/products.csv`,
      header: [
        { id: 'id', title: 'شناسه' },
        { id: 'type', title: 'نوع' },
        { id: 'sku', title: 'شناسه محصول' },
        { id: 'name', title: 'نام' },
        { id: 'published', title: 'منتشر شده' },
        { id: 'special', title: 'آیا ویژه است؟' },
        { id: 'visible', title: 'قابل مشاهده در کاتالوگ' },
        { id: 'shortDescription', title: 'توضیح کوتاه' },
        { id: 'description', title: 'توضیحات' },
        { id: 'sales_start', title: 'تاریخ شروع فروش ویژه' },
        { id: 'sales_end', title: 'تاریخ پایان فروش ویژه' },
        { id: 'taxable', title: 'وضعیت مالیات' },
        { id: 'taxClass', title: 'کلاس مالیاتی' },
        { id: 'stock', title: 'در انبار؟' },
        { id: 'warehouse', title: 'انبار' },
        { id: 'warehouseLow', title: 'موجودی انبار کم' },
        { id: 'preSale', title: 'پیش‌فروش مجاز است؟' },
        { id: 'separateSate', title: 'فروش به صورت جداگانه؟' },
        { id: 'weight', title: 'وزن (کیلوگرم)' },
        { id: 'length', title: 'درازا (سانتیمتر)' },
        { id: 'width', title: 'پهنا (سانتیمتر)' },
        { id: 'height', title: 'بلندا (سانتیمتر)' },
        { id: 'commentAllowed', title: 'آیا به مشتری اجازه نوشتن نقد داده شود؟' },
        { id: 'note', title: 'یادداشت خرید' },
        { id: 'specialSalePrice', title: 'قیمت فروش ویژه' },
        { id: 'price', title: 'قیمت عادی' },
        { id: 'categories', title: 'دسته‌ها' },
        { id: 'tags', title: 'برچسب‌ها' },
        { id: 'shipping', title: 'کلاس حمل و نقل' },
        { id: 'images', title: 'تصاویر' },
        { id: 'download', title: 'محدودیت دانلود' },
        { id: 'downloadExpire', title: 'روز انقضای دانلود' },
        { id: 'parent', title: 'مادر' },
        { id: 'groupProduct', title: 'محصولات گروهی' },
        { id: 'offer', title: 'تشویق برای خرید بیشتر' },
        { id: 'relatedProducts', title: 'محصولات مشابه (Cross-Sells)' },
        { id: 'thirdPartyAddress', title: 'آدرس خارجی' },
        { id: 'buttonText', title: 'متن دکمه' },
        { id: 'position', title: 'موقعیت' },
      ],
    });
    await csvWriter.writeRecords(allProduct);
    logger.info('CSV file created successfully');

    // Convert the CSV file to an Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers to worksheet
    worksheet.columns = [
      { key: 'id', header: 'شناسه' },
      { key: 'type', header: 'نوع' },
      { key: 'sku', header: 'شناسه محصول' },
      { key: 'name', header: 'نام' },
      { key: 'published', header: 'منتشر شده' },
      { key: 'special', header: 'آیا ویژه است؟' },
      { key: 'visible', header: 'قابل مشاهده در کاتالوگ' },
      { key: 'shortDescription', header: 'توضیح کوتاه' },
      { key: 'description', header: 'توضیحات' },
      { key: 'sales_start', header: 'تاریخ شروع فروش ویژه' },
      { key: 'sales_end', header: 'تاریخ پایان فروش ویژه' },
      { key: 'taxable', header: 'وضعیت مالیات' },
      { key: 'taxClass', header: 'کلاس مالیاتی' },
      { key: 'stock', header: 'در انبار؟' },
      { key: 'warehouse', header: 'انبار' },
      { key: 'warehouseLow', header: 'موجودی انبار کم' },
      { key: 'preSale', header: 'پیش‌فروش مجاز است؟' },
      { key: 'separateSate', header: 'فروش به صورت جداگانه؟' },
      { key: 'weight', header: 'وزن (کیلوگرم)' },
      { key: 'length', header: 'درازا (سانتیمتر)' },
      { key: 'wkeyth', header: 'پهنا (سانتیمتر)' },
      { key: 'height', header: 'بلندا (سانتیمتر)' },
      { key: 'commentAllowed', header: 'آیا به مشتری اجازه نوشتن نقد داده شود؟' },
      { key: 'note', header: 'یادداشت خرید' },
      { key: 'specialSalePrice', header: 'قیمت فروش ویژه' },
      { key: 'price', header: 'قیمت عادی' },
      { key: 'categories', header: 'دسته‌ها' },
      { key: 'tags', header: 'برچسب‌ها' },
      { key: 'shipping', header: 'کلاس حمل و نقل' },
      { key: 'images', header: 'تصاویر' },
      { key: 'download', header: 'محدودیت دانلود' },
      { key: 'downloadExpire', header: 'روز انقضای دانلود' },
      { key: 'parent', header: 'مادر' },
      { key: 'groupProduct', header: 'محصولات گروهی' },
      { key: 'offer', header: 'تشویق برای خرید بیشتر' },
      { key: 'relatedProducts', header: 'محصولات مشابه (Cross-Sells)' },
      { key: 'thirdPartyAddress', header: 'آدرس خارجی' },
      { key: 'buttonText', header: 'متن دکمه' },
      { key: 'position', header: 'موقعیت' },
    ];

    // Add data to worksheet
    worksheet.addRows(allProduct);

    // Write JSON data to Excel file
    await workbook.xlsx.writeFile('public/products.xlsx');
    logger.info('Excel file created successfully');
  } catch (error) {
    logger.error(`Error creating CSV file: ${error}`);
  }
};

module.exports = createCSVFile;
