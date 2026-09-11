import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import FoodDonation from '../models/FoodDonation.js';

class ExportService {
  async generatePDFReport(res, startDate, endDate) {
    const query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const donations = await FoodDonation.find(query)
      .populate('donorId', 'name email')
      .populate('volunteerId', 'name')
      .populate('ngoId', 'organizationName')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=annsetu_rescue_report.pdf');

    doc.pipe(res);

    // Title
    doc.fontSize(22).fillColor('#16a34a').text('AnnSetu Food Rescue Platform', { align: 'center' });
    doc.fontSize(14).fillColor('#333333').text('Donation & Impact Analytics Summary', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#666666').text(`Report Generated On: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Table Header
    doc.fontSize(10).fillColor('#000000').text('Title | Category | Qty (Kg) | Status | Date', { underline: true });
    doc.moveDown(0.5);

    let totalKg = 0;
    donations.forEach((item) => {
      totalKg += item.quantityKg || 0;
      doc
        .fontSize(9)
        .text(
          `${item.title.substring(0, 20)} | ${item.foodCategory} | ${item.quantityKg} Kg | ${item.status} | ${new Date(item.createdAt).toLocaleDateString()}`
        );
    });

    doc.moveDown();
    doc.fontSize(12).fillColor('#16a34a').text(`Total Rescued Food: ${totalKg} Kg (${totalKg * 4} Meals Served)`);
    doc.end();
  }

  async generateExcelReport(res, startDate, endDate) {
    const query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const donations = await FoodDonation.find(query)
      .populate('donorId', 'name email phone')
      .populate('volunteerId', 'name phone')
      .populate('ngoId', 'organizationName')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Food Rescue Logs');

    worksheet.columns = [
      { header: 'Donation ID', key: 'id', width: 25 },
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Quantity (Kg)', key: 'quantity', width: 15 },
      { header: 'Freshness Score', key: 'freshness', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Donor Name', key: 'donor', width: 20 },
      { header: 'Volunteer', key: 'volunteer', width: 20 },
      { header: 'NGO', key: 'ngo', width: 20 },
      { header: 'Created Date', key: 'date', width: 20 }
    ];

    donations.forEach((d) => {
      worksheet.addRow({
        id: d._id.toString(),
        title: d.title,
        category: d.foodCategory,
        quantity: d.quantityKg,
        freshness: `${d.freshnessScore}%`,
        status: d.status,
        donor: d.donorId ? d.donorId.name : 'N/A',
        volunteer: d.volunteerId ? d.volunteerId.name : 'Unassigned',
        ngo: d.ngoId ? d.ngoId.organizationName : 'Unassigned',
        date: new Date(d.createdAt).toLocaleString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=annsetu_report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }
}

export default new ExportService();
