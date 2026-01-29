
// Only static enumerations remain here. 
// Master Data (Locations, Designations, Units) is now fetched from the Database.

export const BPS_GRADES = Array.from({ length: 22 }, (_, i) => `BPS-${i + 1}`);

export const STATUS_OPTIONS = [
  'In-Service',
  'Retired',
  'Resigned',
  'Deceased',
  'Terminated',
  'Suspended',
  'OSD',
  'Deputation',
  'Absent',
  'Remove'
];

export const LEAVE_TYPES = [
  'Casual Leave',
  'Earned Leave',
  'Medical Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Ex-Pakistan Leave',
  'Study Leave',
  'Hajj Leave',
  'Itaqaf Leave',
  'Special Casual Leave'
];

export const DOMICILES = [
  'Attock',
  'Bahawalnagar',
  'Bahawalpur',
  'Bhakkar',
  'Chakwal',
  'Chiniot',
  'Dera Ghazi Khan',
  'Faisalabad',
  'Gujranwala',
  'Gujrat',
  'Hafizabad',
  'Jhang',
  'Jhelum',
  'Kasur',
  'Khanewal',
  'Khushab',
  'Lahore',
  'Layyah',
  'Lodhran',
  'Mandi Bahauddin',
  'Mianwali',
  'Multan',
  'Muzaffargarh',
  'Narowal',
  'Nankana Sahib',
  'Okara',
  'Pakpattan',
  'Rahim Yar Khan',
  'Rajanpur',
  'Rawalpindi',
  'Sahiwal',
  'Sargodha',
  'Sheikhupura',
  'Sialkot',
  'Toba Tek Singh',
  'Vehari',
  'Kot Addu',
  'Murree',
  'Talagang',
  'Wazirabad',
  'Jampur'

];

export const RELIGION_OPTIONS = ["Muslim", "Christian", "Hindu", "Ahmadi", "Shia", "Others"];

export const GENDER_OPTIONS = ["Male", "Female", "Other"];

export const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];
