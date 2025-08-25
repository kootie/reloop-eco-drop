# 🔄 Reloop E-Waste Recycling System - Admin Manual

## 👨‍💼 For System Administrators

This manual provides comprehensive guidance for managing the Reloop e-waste recycling platform, including QR code generation, bin management, and system administration.

---

## 🚀 Admin Access & Authentication

### **Admin Login**
- **Admin Dashboard:** https://reloop-eco-drop.vercel.app/admin
- **Authentication:** Email/password or wallet-based login
- **Access Levels:** Super Admin, Bin Manager, Support Staff

### **Admin Dashboard Overview**
- **QR Code Management**
- **Bin Management**
- **User Management**
- **Drop Submissions**
- **Analytics & Reports**
- **Treasury Management**

---

## 📱 QR Code Management System

### **QR Code Generation**

#### **Method 1: Admin Dashboard**
1. **Navigate to:** Admin Dashboard → QR Codes
2. **View existing bins** and their QR codes
3. **Generate new QR codes** for new bins
4. **Download QR codes** individually or in bulk
5. **Print QR codes** for physical placement

#### **Method 2: Direct API Access**
- **QR Code Generation API:**
  ```
  https://reloop-eco-drop.vercel.app/api/public/qr/[QR_CODE_ID]
  ```
- **Public QR Codes Directory:**
  ```
  https://reloop-eco-drop.vercel.app/qr-codes
  ```

### **Current QR Code Links**

#### **Trade Center Mall**
- **QR Code ID:** `RELOOP_BIN_002_TRADECENTER_2024`
- **QR Code Image:** https://reloop-eco-drop.vercel.app/api/public/qr/RELOOP_BIN_002_TRADECENTER_2024
- **Bin Information:** https://reloop-eco-drop.vercel.app/bin/RELOOP_BIN_002_TRADECENTER_2024

#### **Kikalisvili Recycling Station**
- **QR Code ID:** `RELOOP_BIN_001_KIKALISVILI_2024`
- **QR Code Image:** https://reloop-eco-drop.vercel.app/api/public/qr/RELOOP_BIN_001_KIKALISVILI_2024
- **Bin Information:** https://reloop-eco-drop.vercel.app/bin/RELOOP_BIN_001_KIKALISVILI_2024

---

## 🏗️ Bin Management

### **Creating New Bins**

#### **Step 1: Add Bin Information**
1. **Access Admin Dashboard**
2. **Navigate to:** QR Codes → Add New Bin
3. **Fill in required information:**
   - **Location Name:** Descriptive name for the bin
   - **Address:** Full physical address
   - **Latitude/Longitude:** GPS coordinates
   - **QR Code ID:** Unique identifier (format: `RELOOP_BIN_XXX_LOCATION_2024`)
   - **Capacity:** Maximum weight in kg
   - **Contact Phone:** Local contact number

#### **Step 2: Generate QR Code**
1. **Save bin information**
2. **QR code automatically generated**
3. **Download QR code image**
4. **Print for physical placement**

#### **Step 3: Physical Setup**
1. **Print QR code** on durable material
2. **Laminate** for weather protection
3. **Attach to bin** at designated location
4. **Test QR code** functionality
5. **Activate bin** in system

### **Bin Status Management**

#### **Active Bins**
- **Status:** Operational and accepting drops
- **QR codes:** Functional and accessible
- **Capacity:** Monitored and updated
- **Maintenance:** Regular checks required

#### **Inactive Bins**
- **Status:** Temporarily out of service
- **QR codes:** Still accessible for information
- **Capacity:** Not accepting new drops
- **Maintenance:** Under repair or relocation

#### **Decommissioned Bins**
- **Status:** Permanently removed
- **QR codes:** Redirect to information page
- **Data:** Archived for historical records

---

## 🖨️ QR Code Printing & Distribution

### **Printing Specifications**

#### **Recommended Materials**
- **Weather-resistant paper** or vinyl
- **UV-resistant ink** for outdoor use
- **Lamination** for durability
- **Size:** Minimum 10cm x 10cm (4" x 4")

#### **Print Settings**
- **Resolution:** 300 DPI minimum
- **Format:** PNG or high-quality JPEG
- **Color:** Black and white for maximum contrast
- **Background:** White for clear scanning

### **Physical Placement**

#### **Location Guidelines**
- **Eye level** for easy scanning
- **Well-lit area** for clear visibility
- **Protected from weather** and vandalism
- **Accessible** to all users
- **Near the bin** but not blocking access

#### **Installation Steps**
1. **Clean surface** thoroughly
2. **Apply adhesive** or mounting hardware
3. **Position QR code** at recommended height
4. **Test scanning** from various angles
5. **Add protective covering** if needed

### **Bulk QR Code Generation**

#### **Using Admin Dashboard**
1. **Select multiple bins** for batch processing
2. **Generate print-ready page** with all QR codes
3. **Download HTML file** for printing
4. **Print on standard A4 paper**
5. **Cut and laminate** individual QR codes

#### **Using Download Script**
```bash
# Run the QR code download script
node scripts/download-qr-codes.js
```

**Output:**
- Individual QR code PNG files
- Print-ready HTML page
- Organized in `qr-codes/` directory

---

## 📊 System Monitoring & Analytics

### **QR Code Analytics**

#### **Scan Statistics**
- **Total scans** per QR code
- **Unique visitors** per location
- **Scan frequency** by time of day
- **Geographic distribution** of users

#### **Performance Metrics**
- **QR code accessibility** (uptime)
- **Scan success rate**
- **User engagement** with bin information
- **Conversion rate** (scans to drops)

### **Bin Performance Tracking**

#### **Capacity Management**
- **Current fill level** monitoring
- **Collection frequency** optimization
- **Overflow prevention** alerts
- **Maintenance scheduling**

#### **User Engagement**
- **Drop submission rates**
- **User feedback** and ratings
- **Common issues** and solutions
- **Improvement suggestions**

---

## 🔧 Technical Administration

### **API Management**

#### **Public APIs**
- **QR Code Generation:** `/api/public/qr/[qrCode]`
- **Bin Information:** `/api/public/bins`
- **Bin Details:** `/api/bins/qr/[qrCode]`

#### **Admin APIs**
- **Bin Management:** `/api/admin/bins`
- **User Management:** `/api/admin/users`
- **Drop Management:** `/api/admin/drops`
- **Analytics:** `/api/admin/analytics`

### **Database Management**

#### **Key Tables**
- **`bins`:** Bin information and QR codes
- **`users`:** User accounts and profiles
- **`drops`:** E-waste drop submissions
- **`rewards`:** Cardano reward transactions

#### **Maintenance Tasks**
- **Regular backups** of database
- **Performance optimization** queries
- **Data cleanup** and archiving
- **Security audits** and updates

### **System Configuration**

#### **Environment Variables**
```bash
# Database Configuration
DATABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Application Settings
NEXT_PUBLIC_BASE_URL=https://reloop-eco-drop.vercel.app
VERCEL_URL=your_vercel_url

# Cardano Integration
CARDANO_NETWORK=testnet
CARDANO_WALLET_ADDRESS=your_wallet_address
```

---

## 🛠️ Troubleshooting & Maintenance

### **Common QR Code Issues**

#### **QR Code Not Scanning**
- **Check print quality** and size
- **Verify URL accessibility** in browser
- **Test with different** QR reader apps
- **Check for damage** or wear

#### **QR Code Links Broken**
- **Verify API endpoints** are working
- **Check database** connectivity
- **Test URL generation** logic
- **Review error logs** for issues

#### **QR Code Performance Issues**
- **Monitor server response** times
- **Check image generation** speed
- **Optimize caching** settings
- **Review CDN** configuration

### **System Maintenance**

#### **Regular Tasks**
- **Daily:** Monitor system health and alerts
- **Weekly:** Review analytics and user feedback
- **Monthly:** Update QR codes and bin information
- **Quarterly:** System security audit and updates

#### **Emergency Procedures**
- **System outage:** Activate backup systems
- **QR code failure:** Provide alternative access methods
- **Data breach:** Immediate security response
- **Natural disaster:** Emergency contact procedures

---

## 📈 Performance Optimization

### **QR Code Optimization**

#### **Image Optimization**
- **Compress PNG files** for faster loading
- **Use appropriate** image dimensions
- **Implement caching** strategies
- **CDN distribution** for global access

#### **URL Optimization**
- **Short, memorable** QR code IDs
- **Consistent naming** conventions
- **SEO-friendly** URL structure
- **Redirect handling** for old URLs

### **System Performance**

#### **Database Optimization**
- **Index optimization** for frequent queries
- **Query performance** monitoring
- **Connection pooling** configuration
- **Regular maintenance** scheduling

#### **Application Performance**
- **Code optimization** and refactoring
- **Caching strategies** implementation
- **Load balancing** configuration
- **Monitoring and alerting** setup

---

## 🔒 Security & Compliance

### **Data Protection**

#### **User Privacy**
- **GDPR compliance** for EU users
- **Data encryption** in transit and at rest
- **Access controls** and authentication
- **Audit logging** for all operations

#### **System Security**
- **Regular security** updates
- **Vulnerability scanning** and patching
- **Access control** and authentication
- **Backup and recovery** procedures

### **Compliance Requirements**

#### **Environmental Regulations**
- **E-waste handling** compliance
- **Recycling standards** adherence
- **Environmental impact** reporting
- **Regulatory updates** monitoring

#### **Financial Compliance**
- **Cardano transaction** tracking
- **Reward distribution** transparency
- **Tax reporting** requirements
- **Audit trail** maintenance

---

## 📞 Support & Communication

### **User Support**

#### **Support Channels**
- **Email support:** support@reloop-eco-drop.com
- **Phone support:** +995 XXX XXX XXX
- **In-app chat:** Available during business hours
- **WhatsApp support:** +995 XXX XXX XXX

#### **Issue Escalation**
- **Level 1:** Basic user support
- **Level 2:** Technical issues
- **Level 3:** System administration
- **Level 4:** Development team

### **Stakeholder Communication**

#### **Regular Updates**
- **Weekly reports** to management
- **Monthly analytics** review
- **Quarterly performance** assessment
- **Annual system** evaluation

#### **Emergency Communication**
- **System outage** notifications
- **Security incident** reporting
- **Regulatory compliance** updates
- **Stakeholder alerts** and updates

---

## 📋 Administrative Procedures

### **QR Code Lifecycle Management**

#### **Creation Process**
1. **Request approval** for new bin location
2. **Site assessment** and feasibility study
3. **Bin installation** and setup
4. **QR code generation** and testing
5. **Physical placement** and activation
6. **Documentation** and training

#### **Maintenance Process**
1. **Regular inspection** of QR codes
2. **Performance monitoring** and analysis
3. **User feedback** collection and review
4. **Updates and improvements** implementation
5. **Documentation** updates

#### **Decommissioning Process**
1. **Assessment** of bin performance
2. **User notification** of closure
3. **Physical removal** of bin and QR code
4. **Data archiving** and cleanup
5. **Final reporting** and documentation

### **Quality Assurance**

#### **QR Code Quality Standards**
- **Minimum size:** 10cm x 10cm
- **Print quality:** 300 DPI minimum
- **Scan success rate:** >95%
- **Durability:** Weather-resistant materials
- **Accessibility:** ADA compliance

#### **System Quality Standards**
- **Uptime:** >99.9%
- **Response time:** <2 seconds
- **Error rate:** <1%
- **User satisfaction:** >4.5/5
- **Security compliance:** 100%

---

## 🎯 Quick Reference

### **Essential URLs**
- **Admin Dashboard:** https://reloop-eco-drop.vercel.app/admin
- **QR Codes Directory:** https://reloop-eco-drop.vercel.app/qr-codes
- **Public API:** https://reloop-eco-drop.vercel.app/api/public

### **Key Commands**
```bash
# Generate QR codes
node scripts/download-qr-codes.js

# Database backup
pg_dump your_database > backup.sql

# System monitoring
npm run build && npm start
```

### **Important Contacts**
- **Technical Support:** tech@reloop-eco-drop.com
- **Emergency:** +995 XXX XXX XXX
- **Management:** management@reloop-eco-drop.com

---

## 📚 Additional Resources

### **Documentation**
- **API Documentation:** `/docs/api`
- **Database Schema:** `supabase-schema.sql`
- **Deployment Guide:** `VERCEL_DEPLOYMENT.md`
- **Troubleshooting:** `ERROR_LOGS_DEBUGGING.md`

### **Training Materials**
- **Admin Training Videos:** Available on internal portal
- **User Manuals:** `USER_MANUAL_TEST_USERS.md`
- **Best Practices:** `PERFORMANCE_IMPROVEMENTS.md`
- **Security Guidelines:** Internal security portal

---

*This manual is updated regularly. Check the admin portal for the latest version.*

**Version:** 1.0  
**Last Updated:** December 2024  
**Next Review:** January 2025  
**Approved By:** System Administrator
