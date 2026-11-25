

// import { useCallback, useContext, useEffect, useState } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { TourContext } from "../../context/TourContext";
// import { TourAdminContext } from "../../context/TourAdminContext";
// import { cancelWho } from "../../components/CancelWho";
// import useStaffSelf from "../../staff/useStaffSelf"; // staff site la login aana staff (Tour admin la null)
// import { StaffOptions, teamsFromStaff, ToModeSwitch } from "../../staff/ticketWho";
// import LeaveGuard from "../../components/LeaveGuard";

// // India — 28 states + 8 union territories (Zone create la)
// const INDIA_REGIONS = [
//     "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
//     "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
//     "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
//     "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
//     "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
//     "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
// ];
// const UT_SET = new Set(INDIA_REGIONS.slice(28));
// // International zones — continent wise countries (India zone la states / districts thaniyaa)
// const WORLD_COUNTRIES_BY_CONTINENT = { "Asia": ["Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"], "Europe": ["Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican City"], "Africa": ["Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cameroon", "Cape Verde", "Central African Republic", "Chad", "Comoros", "Congo", "DR Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"], "North America": ["Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "El Salvador", "Grenada", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago", "United States"], "South America": ["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"], "Oceania": ["Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"] };
// // Country phone code — kaattradhukku mattum (save aagaradhu country per thaan)
// const COUNTRY_CODES = { "Afghanistan": "93", "Armenia": "374", "Azerbaijan": "994", "Bahrain": "973", "Bangladesh": "880", "Bhutan": "975", "Brunei": "673", "Cambodia": "855", "China": "86", "Cyprus": "357", "Georgia": "995", "Indonesia": "62", "Iran": "98", "Iraq": "964", "Israel": "972", "Japan": "81", "Jordan": "962", "Kazakhstan": "7", "Kuwait": "965", "Kyrgyzstan": "996", "Laos": "856", "Lebanon": "961", "Malaysia": "60", "Maldives": "960", "Mongolia": "976", "Myanmar": "95", "Nepal": "977", "North Korea": "850", "Oman": "968", "Pakistan": "92", "Palestine": "970", "Philippines": "63", "Qatar": "974", "Saudi Arabia": "966", "Singapore": "65", "South Korea": "82", "Sri Lanka": "94", "Syria": "963", "Taiwan": "886", "Tajikistan": "992", "Thailand": "66", "Timor-Leste": "670", "Turkey": "90", "Turkmenistan": "993", "United Arab Emirates": "971", "Uzbekistan": "998", "Vietnam": "84", "Yemen": "967", "Albania": "355", "Andorra": "376", "Austria": "43", "Belarus": "375", "Belgium": "32", "Bosnia and Herzegovina": "387", "Bulgaria": "359", "Croatia": "385", "Czech Republic": "420", "Denmark": "45", "Estonia": "372", "Finland": "358", "France": "33", "Germany": "49", "Greece": "30", "Hungary": "36", "Iceland": "354", "Ireland": "353", "Italy": "39", "Kosovo": "383", "Latvia": "371", "Liechtenstein": "423", "Lithuania": "370", "Luxembourg": "352", "Malta": "356", "Moldova": "373", "Monaco": "377", "Montenegro": "382", "Netherlands": "31", "North Macedonia": "389", "Norway": "47", "Poland": "48", "Portugal": "351", "Romania": "40", "Russia": "7", "San Marino": "378", "Serbia": "381", "Slovakia": "421", "Slovenia": "386", "Spain": "34", "Sweden": "46", "Switzerland": "41", "Ukraine": "380", "United Kingdom": "44", "Vatican City": "379", "Algeria": "213", "Angola": "244", "Benin": "229", "Botswana": "267", "Burkina Faso": "226", "Burundi": "257", "Cameroon": "237", "Cape Verde": "238", "Central African Republic": "236", "Chad": "235", "Comoros": "269", "Congo": "242", "DR Congo": "243", "Djibouti": "253", "Egypt": "20", "Equatorial Guinea": "240", "Eritrea": "291", "Eswatini": "268", "Ethiopia": "251", "Gabon": "241", "Gambia": "220", "Ghana": "233", "Guinea": "224", "Guinea-Bissau": "245", "Ivory Coast": "225", "Kenya": "254", "Lesotho": "266", "Liberia": "231", "Libya": "218", "Madagascar": "261", "Malawi": "265", "Mali": "223", "Mauritania": "222", "Mauritius": "230", "Morocco": "212", "Mozambique": "258", "Namibia": "264", "Niger": "227", "Nigeria": "234", "Rwanda": "250", "Sao Tome and Principe": "239", "Senegal": "221", "Seychelles": "248", "Sierra Leone": "232", "Somalia": "252", "South Africa": "27", "South Sudan": "211", "Sudan": "249", "Tanzania": "255", "Togo": "228", "Tunisia": "216", "Uganda": "256", "Zambia": "260", "Zimbabwe": "263", "Antigua and Barbuda": "1-268", "Bahamas": "1-242", "Barbados": "1-246", "Belize": "501", "Canada": "1", "Costa Rica": "506", "Cuba": "53", "Dominica": "1-767", "Dominican Republic": "1-809", "El Salvador": "503", "Grenada": "1-473", "Guatemala": "502", "Haiti": "509", "Honduras": "504", "Jamaica": "1-876", "Mexico": "52", "Nicaragua": "505", "Panama": "507", "Saint Kitts and Nevis": "1-869", "Saint Lucia": "1-758", "Saint Vincent and the Grenadines": "1-784", "Trinidad and Tobago": "1-868", "United States": "1", "Argentina": "54", "Bolivia": "591", "Brazil": "55", "Chile": "56", "Colombia": "57", "Ecuador": "593", "Guyana": "592", "Paraguay": "595", "Peru": "51", "Suriname": "597", "Uruguay": "598", "Venezuela": "58", "Australia": "61", "Fiji": "679", "Kiribati": "686", "Marshall Islands": "692", "Micronesia": "691", "Nauru": "674", "New Zealand": "64", "Palau": "680", "Papua New Guinea": "675", "Samoa": "685", "Solomon Islands": "677", "Tonga": "676", "Tuvalu": "688", "Vanuatu": "678" };
// const placeLabel = (s) => (COUNTRY_CODES[s] ? `${s} (+${COUNTRY_CODES[s]})` : s);
// const COUNTRY_SET = new Set(Object.values(WORLD_COUNTRIES_BY_CONTINENT).flat());
// // Zone la ellaam countries na International zone
// const zoneCountLabel = (z) => {
//     const list = z?.states || [];
//     const nc = list.filter((s) => COUNTRY_SET.has(s)).length;
//     const ns = list.length - nc;
//     const parts = [];
//     if (ns) parts.push(`${ns} state${ns === 1 ? "" : "s"}`);
//     if (nc) parts.push(`🌍 ${nc} ${nc === 1 ? "country" : "countries"}`);
//     return parts.join(" · ");
// };
// const isIntlZone = (z) => (z?.states || []).length > 0 && z.states.every((s) => COUNTRY_SET.has(s));
// // State → districts (india-states-districts npm data). Zone la state ku specific districts select panna.
// const INDIA_DISTRICTS = { "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"], "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"], "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"], "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"], "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"], "Goa": ["North Goa", "South Goa"], "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"], "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"], "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"], "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"], "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"], "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"], "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"], "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"], "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"], "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"], "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"], "Nagaland": ["Chumukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Noklak", "Peren", "Phek", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"], "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Debagarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"], "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"], "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"], "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"], "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"], "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"], "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"], "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"], "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"], "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"], "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"], "Chandigarh": ["Chandigarh"], "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"], "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"], "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"], "Ladakh": ["Kargil", "Leh"], "Lakshadweep": ["Lakshadweep"], "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"] };
// // Zone states text: "Tamil Nadu (Chennai, Madurai), Kerala"
// const zoneStateLabel = (z, st) => {
//     const ds = (z?.districts || {})[st];
//     return ds?.length ? `${st} (${ds.join(", ")})` : placeLabel(st);
// };
// const zoneSummary = (z) => (z?.states || []).map((st) => zoneStateLabel(z, st)).join(", ");
// // Enquiry la select panna zones — thani thaniyaa (pazhaya single zone um)
// const zonesOfEnq = (e) => (e?.zone?.list?.length ? e.zone.list : e?.zone?.name ? [e.zone] : []);
// // Expanded view: ovvoru zone um thani card
// const EnquiryZones = ({ e, mobile = false }) => {
//     const list = zonesOfEnq(e);
//     if (!list.length) return null;
//     return (
//         <div style={{ background: "#fff", borderRadius: "10px", padding: mobile ? "14px" : "12px 14px", border: "0.5px solid #e2e8f0" }}>
//             <div style={{ fontSize: mobile ? "13px" : "11px", fontWeight: 700, color: "#0C447C", textTransform: mobile ? "none" : "uppercase", letterSpacing: mobile ? 0 : "0.05em", marginBottom: "8px" }}>🗺 Zones ({list.length})</div>
//             <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//                 {list.map((z) => (
//                     <div key={String(z.zoneId || z.name)}>
//                         <div style={{ fontSize: "12px", fontWeight: 800, color: "#0C447C", marginBottom: "4px" }}>{z.name}</div>
//                         <ZoneStateChips z={z} />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };
// const ZONE_INDIA = { accent: "#2E7D32", soft: "#E8F5E9", bg: "#F6FBF6", name: "#1B4D20", head: "#4338CA" };
// const ZONE_INTL = { accent: "#2563EB", soft: "#DBEAFE", bg: "#F5F8FF", name: "#1E3A8A", head: "#2E7D32" };
// const ZoneStateChips = ({ z, size = 11 }) => {
//     const [open, setOpen] = useState({});
//     const list = z?.states || [];
//     const india = list.filter((st) => !COUNTRY_SET.has(st));
//     const intl = list.filter((st) => COUNTRY_SET.has(st));
//     const block = (c) => ({ borderLeft: `3px solid ${c.accent}`, background: c.bg, borderRadius: "0 8px 8px 0", padding: "6px 10px" });
//     const head = (label, c) => (
//         <div style={{ fontSize: `${size - 1}px`, fontWeight: 700, color: c.head, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
//     );
//     const name = (c) => ({ fontSize: `${size + 1}px`, fontWeight: 800, color: c.name, textTransform: "uppercase", letterSpacing: "0.02em" });
//     return (
//         <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//             {india.length > 0 && (
//                 <div style={block(ZONE_INDIA)}>
//                     {head(`India · ${india.length}`, ZONE_INDIA)}
//                     <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
//                         {india.map((st) => {
//                             const ds = (z?.districts || {})[st] || [];
//                             const isOpen = !!open[st];
//                             return (
//                                 <div key={st}>
//                                     <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
//                                         <span style={name(ZONE_INDIA)}>{st}</span>
//                                         {ds.length > 0 ? (
//                                             <button type="button" aria-expanded={isOpen}
//                                                 onClick={(ev) => { ev.stopPropagation(); setOpen((o) => ({ ...o, [st]: !o[st] })); }}
//                                                 onKeyDown={(ev) => ev.stopPropagation()}
//                                                 style={{ border: "none", background: ZONE_INDIA.soft, color: "#8B3A0F", borderRadius: "999px", padding: "1px 8px", fontSize: `${size - 1}px`, fontWeight: 600, cursor: "pointer" }}>
//                                                 {isOpen ? "▾" : "▸"} {ds.length} district{ds.length === 1 ? "" : "s"}
//                                             </button>
//                                         ) : null}
//                                     </div>
//                                     {isOpen && (
//                                         <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
//                                             {ds.map((d) => (
//                                                 <span key={d} style={{ background: "#fff", color: "#C62828", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "1px 7px", fontSize: `${size}px`, fontWeight: 500 }}>{d}</span>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             )}
//             {intl.length > 0 && (
//                 <div style={block(ZONE_INTL)}>
//                     {head(`International · ${intl.length}`, ZONE_INTL)}
//                     <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
//                         {intl.map((c) => (
//                             <span key={c} style={name(ZONE_INTL)}>
//                                 {c}{COUNTRY_CODES[c] && <span style={{ fontWeight: 500, color: "#94A3B8", textTransform: "none" }}> +{COUNTRY_CODES[c]}</span>}
//                             </span>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// const gvShareText = (v) => (v === null || v === undefined || v === "" ? "—" : `₹${Number(v).toLocaleString("en-IN")}`);
// const stageOfEnq = (e) => {
//     if (e.status === "pending") return e.isRatePassed ? "ratePassed" : e.isPickedUp ? "pickup" : "pending";
//     if (e.status === "accepted") return e.isCancelled ? "cancelled" : e.isClosed ? "closed" : "accepted";
//     return e.status;
// };
// // Ippo yaar kitta irukku (owner) — pazhaya enquiries la pickedUpBy
// const ownerOfEnq = (e) => e?.owner || (e?.isPickedUp && e?.pickedUpBy ? e.pickedUpBy : null);
// const ownerText = (o) => !o ? "" : o.type === "team" ? `${o.name} team` : o.type === "touradmin" ? "Tour admin" : o.type === "admin" ? "Admin" : (o.name || "");

// // ─────────────────────────────────────────────
// // ZONES — states select panni "Zone 1", "Zone 2" … (oru state oru zone la mattum)
// // ─────────────────────────────────────────────
// const zoneWhen = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
// const ZonesPanel = ({ zones, reload, api, readOnly = false }) => {
//     const [mode, setMode] = useState("india"); // "india" | "intl"
//     const [picked, setPicked] = useState([]);
//     const [dists, setDists] = useState({}); // { state: [districts] } — [] na full state
//     const [editId, setEditId] = useState(null);
//     const [busy, setBusy] = useState(false);
//     const [q, setQ] = useState("");
//     const toggle = (st) => setPicked((p) => (p.includes(st) ? p.filter((x) => x !== st) : [...p, st]));
//     const toggleDist = (st, d) => setDists((m) => {
//         const cur = m[st] || [];
//         return { ...m, [st]: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d] };
//     });
//     const startEdit = (z) => { setMode(isIntlZone(z) ? "intl" : "india"); setEditId(z._id); setPicked(z.states || []); setDists(z.districts || {}); setQ(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
//     const reset = () => { setEditId(null); setPicked([]); setDists({}); setQ(""); };
//     const intl = mode === "intl";
//     const unit = intl ? "country" : "state";
//     const units = intl ? "countries" : "states";
//     const switchMode = (m) => { if (m === mode) return; setMode(m); setQ(""); }; // select pannadhu apdiye irukkum (India + countries serthu)
//     const missingDist = [];
//     const save = async () => {
//         if (!picked.length) return toast.error("Select at least one state or country");
//         if (missingDist.length) return toast.error(`Select districts for ${missingDist.join(", ")}`);
//         setBusy(true);
//         try {
//             // Select panna states oda districts mattum anuppurom
//             const d = Object.fromEntries(picked.filter((st) => !COUNTRY_SET.has(st)).map((st) => [st, dists[st] || []]).filter(([, v]) => v.length));
//             const res = editId ? await api.updateZone(editId, picked, d) : await api.createZone(picked, d);
//             toast.success(res.message);
//             reset();
//             await reload();
//         } catch (err) { toast.error(err.message); } finally { setBusy(false); }
//     };
//     const remove = async (z) => {
//         if (!window.confirm(`Delete ${z.name}? Enquiries already picked up with this zone keep it.`)) return;
//         try { const res = await api.deleteZone(z._id); toast.success(res.message); if (editId === z._id) reset(); await reload(); }
//         catch (err) { toast.error(err.message); }
//     };
//     const shown = INDIA_REGIONS.filter((st) => !q || st.toLowerCase().includes(q.toLowerCase()));
//     const nextName = `Zone ${(zones.reduce((m, z) => Math.max(m, z.seq || 0), 0)) + 1}`;
//     const chip = (st) => {
//         const on = picked.includes(st);
//         return (
//             <button key={st} type="button" onClick={() => toggle(st)} aria-pressed={on} title={st}
//                 style={{
//                     padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer",
//                     border: on ? "1.5px solid #0C447C" : "1px solid #e2e8f0", background: on ? "#0C447C" : "#fff", color: on ? "#fff" : "#334155"
//                 }}>
//                 {on ? "✓ " : ""}{placeLabel(st)}
//             </button>
//         );
//     };
//     return (
//         <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
//             <LeaveGuard
//                 when={!readOnly && !busy && (picked.length > 0 || !!editId)}
//                 title="Unsaved Zone"
//                 message={
//                     <>
//                         You have selected states / countries for a zone but not saved it yet.
//                         <br />
//                         Leaving this page will lose the selection.
//                         <br />
//                         Are you sure you want to leave?
//                     </>
//                 }
//             />
//             {!readOnly && <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "14px", padding: "18px", marginBottom: "16px" }}>
//                 <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
//                     <div>
//                         <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>{editId ? `Edit ${zones.find((z) => z._id === editId)?.name || "zone"}` : `Create ${nextName}`}</h2>
//                         <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
//                             {intl
//                                 ? "Search and select the countries. You can also add Indian states from the India tab."
//                                 : "Select the states. Districts are optional. A state can be in more than one zone."}
//                         </p>
//                     </div>
//                     <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={intl ? "Search country" : "Search state"} style={{ border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "7px 10px", fontSize: "12px", background: "#f8fafc", minWidth: "180px" }} />
//                 </div>

//                 {/* India / International */}
//                 <div role="tablist" style={{ display: "inline-flex", gap: "4px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", marginBottom: "14px" }}>
//                     {[{ k: "india", label: "🇮🇳 India" }, { k: "intl", label: "🌍 International" }].map((t) => (
//                         <button key={t.k} type="button" role="tab" aria-selected={mode === t.k} onClick={() => switchMode(t.k)}
//                             style={{ padding: "7px 16px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: mode === t.k ? "#fff" : "transparent", color: mode === t.k ? "#0C447C" : "#64748b", boxShadow: mode === t.k ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
//                             {t.label}
//                         </button>
//                     ))}
//                 </div>

//                 {intl ? (
//                     <>
//                         {picked.some((c) => COUNTRY_SET.has(c)) && (
//                             <div style={{ marginBottom: "14px" }}>
//                                 <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 6px" }}>Selected</div>
//                                 <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{picked.filter((c) => COUNTRY_SET.has(c)).map(chip)}</div>
//                             </div>
//                         )}
//                         {(() => {
//                             const ql = q.trim().toLowerCase();
//                             const allCountries = Object.values(WORLD_COUNTRIES_BY_CONTINENT).flat();
//                             const addMany = (arr) => setPicked((p) => [...p, ...arr.filter((c) => !p.includes(c))]);
//                             const removeMany = (arr) => setPicked((p) => p.filter((c) => !arr.includes(c)));
//                             const pickedCountries = picked.filter((c) => COUNTRY_SET.has(c)).length;
//                             const linkBtn = (label, onClick, color = "#1d4ed8") => (
//                                 <button type="button" onClick={onClick} style={{ border: "none", background: "none", color, fontWeight: 700, cursor: "pointer", fontSize: "11px", padding: 0 }}>{label}</button>
//                             );
//                             const groups = Object.entries(WORLD_COUNTRIES_BY_CONTINENT)
//                                 .map(([cont, list]) => {
//                                     const matches = ql ? list.filter((c) => placeLabel(c).toLowerCase().includes(ql)) : list;
//                                     return { cont, list, matches, remaining: matches.filter((c) => !picked.includes(c)), selected: list.filter((c) => picked.includes(c)).length };
//                                 })
//                                 .filter((g) => g.matches.length);
//                             return (
//                                 <>
//                                     <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", margin: "0 0 10px" }}>
//                                         <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>{pickedCountries} of {allCountries.length} countries selected</span>
//                                         {pickedCountries < allCountries.length && linkBtn("Select all countries", () => addMany(allCountries))}
//                                         {pickedCountries > 0 && linkBtn("Clear countries", () => removeMany(allCountries), "#64748b")}
//                                     </div>
//                                     {!groups.length ? (
//                                         <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 16px" }}>No country matches "{q}"</p>
//                                     ) : (
//                                         <div style={{ maxHeight: "340px", overflowY: "auto", marginBottom: "16px", paddingRight: "4px" }}>
//                                             {groups.map((g) => (
//                                                 <div key={g.cont} style={{ marginBottom: "12px" }}>
//                                                     <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", margin: "0 0 6px" }}>
//                                                         <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
//                                                             {g.cont} <span style={{ fontWeight: 500 }}>({g.selected}/{g.list.length} selected)</span>
//                                                         </span>
//                                                         {g.remaining.length > 0 && linkBtn(ql ? `Select ${g.remaining.length} shown` : "Select all", () => addMany(g.remaining))}
//                                                         {g.selected > 0 && linkBtn("Clear", () => removeMany(g.list), "#64748b")}
//                                                     </div>
//                                                     {g.remaining.length ? (
//                                                         <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{g.remaining.map(chip)}</div>
//                                                     ) : (
//                                                         <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>All selected — see Selected above</p>
//                                                     )}
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     )}
//                                 </>
//                             );
//                         })()}
//                     </>
//                 ) : (
//                     <>
//                         <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", margin: "4px 0 6px" }}>States</div>
//                         <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>{shown.filter((st) => !UT_SET.has(st)).map(chip)}</div>
//                         <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", margin: "4px 0 6px" }}>Union territories</div>
//                         <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>{shown.filter((st) => UT_SET.has(st)).map(chip)}</div>

//                         {/* Select panna ovvoru state kum districts — onnum select pannala na full state */}
//                         {picked.some((st) => !COUNTRY_SET.has(st)) && (
//                             <div style={{ marginBottom: "16px" }}>
//                                 <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", margin: "4px 0 6px" }}>Districts  <span style={{ textTransform: "none", fontWeight: 500 }}>— (optional)</span></div>
//                                 <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//                                     {picked.filter((st) => !COUNTRY_SET.has(st)).map((st) => {
//                                         const all = INDIA_DISTRICTS[st] || [];
//                                         const sel = dists[st] || [];
//                                         return (
//                                             <div key={st} style={{ border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px", background: "#f8fafc" }}>
//                                                 <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
//                                                     <span style={{ fontSize: "13px", fontWeight: 700, color: "#0C447C" }}>{st}</span>
//                                                     <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
//                                                         <span style={{ fontWeight: 700, color: sel.length ? "#0369A1" : "#64748b", background: sel.length ? "#E0F2FE" : "#f1f5f9", padding: "2px 8px", borderRadius: "10px" }}>
//                                                             {sel.length ? `${sel.length} of ${all.length} districts` : "Whole state"}
//                                                         </span>
//                                                         {sel.length < all.length && <button type="button" onClick={() => setDists((m) => ({ ...m, [st]: [...all] }))} style={{ border: "none", background: "none", color: "#1d4ed8", fontWeight: 700, cursor: "pointer", fontSize: "11px" }}>Select all</button>}
//                                                         {sel.length > 0 && <button type="button" onClick={() => setDists((m) => ({ ...m, [st]: [] }))} style={{ border: "none", background: "none", color: "#64748b", fontWeight: 700, cursor: "pointer", fontSize: "11px" }}>Clear</button>}
//                                                     </span>
//                                                 </div>
//                                                 <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
//                                                     {all.map((d) => {
//                                                         const on = sel.includes(d);
//                                                         return (
//                                                             <button key={d} type="button" onClick={() => toggleDist(st, d)} aria-pressed={on}
//                                                                 style={{
//                                                                     padding: "4px 10px", borderRadius: "16px", fontSize: "11px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
//                                                                     border: on ? "1.5px solid #0369A1" : "1px solid #e2e8f0", background: on ? "#0369A1" : "#fff", color: on ? "#fff" : "#475569"
//                                                                 }}>
//                                                                 {on ? "✓ " : ""}{d}
//                                                             </button>
//                                                         );
//                                                     })}
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         )}
//                     </>
//                 )}
//                 <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
//                     <button onClick={save} disabled={busy || !picked.length || missingDist.length > 0}
//                         style={{ padding: "10px 22px", border: "none", borderRadius: "10px", background: busy || !picked.length || missingDist.length ? "#cbd5e1" : "#0C447C", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: busy || !picked.length || missingDist.length ? "not-allowed" : "pointer" }}>
//                         {busy ? "Saving…" : editId ? "Save zone" : `Create ${nextName}`}
//                     </button>
//                     {(editId || picked.length > 0) && (
//                         <button onClick={reset} style={{ padding: "10px 18px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#475569", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
//                     )}
//                     <span style={{ fontSize: "12px", color: missingDist.length ? "#B91C1C" : "#64748b" }}>
//                         {(() => {
//                             const nc = picked.filter((x) => COUNTRY_SET.has(x)).length;
//                             const ns = picked.length - nc;
//                             const parts = [];
//                             if (ns) parts.push(`${ns} state${ns === 1 ? "" : "s"}`);
//                             if (nc) parts.push(`${nc} ${nc === 1 ? "country" : "countries"}`);
//                             return parts.length ? `${parts.join(" · ")} selected` : `0 ${units} selected`;
//                         })()}{missingDist.length ? ` · select districts for ${missingDist.join(", ")}` : ""}
//                     </span>
//                 </div>
//             </div>}

//             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "12px" }}>
//                 {zones.length === 0 && (
//                     <div style={{ gridColumn: "1/-1", padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "13px", background: "#fff", border: "0.5px dashed #cbd5e1", borderRadius: "12px" }}>
//                         {readOnly ? "No zones yet." : "No zones yet. Create one above — enquiries can be picked up only after choosing a zone."}
//                     </div>
//                 )}
//                 {zones.map((z) => (
//                     <div key={z._id} style={{ background: editId === z._id ? "#EFF6FF" : "#fff", border: editId === z._id ? "1.5px solid #3B82F6" : "0.5px solid #e2e8f0", borderRadius: "12px", padding: "14px" }}>
//                         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
//                             <span style={{ fontSize: "15px", fontWeight: 800, color: "#0C447C" }}>🗺 {z.name}</span>
//                             <span style={{ fontSize: "11px", color: "#64748b" }}>{zoneCountLabel(z)}</span>
//                         </div>
//                         <div style={{ marginBottom: "10px" }}><ZoneStateChips z={z} /></div>
//                         {/* Yaar create / edit panna (login) */}
//                         <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.6, marginBottom: "10px", borderTop: "0.5px solid #f1f5f9", paddingTop: "8px" }}>
//                             <div>Created by <b style={{ color: "#334155" }}>{cancelWho(z.createdBy) || "—"}</b>{z.createdAt ? ` · ${zoneWhen(z.createdAt)}` : ""}</div>
//                             {z.updatedBy && <div>Edited by <b style={{ color: "#334155" }}>{cancelWho(z.updatedBy) || "—"}</b>{z.updatedAt ? ` · ${zoneWhen(z.updatedAt)}` : ""}</div>}
//                         </div>
//                         {!readOnly && <div style={{ display: "flex", gap: "6px" }}>
//                             <button onClick={() => startEdit(z)} style={{ flex: 1, padding: "7px", border: "none", borderRadius: "8px", background: "#EEF2FF", color: "#4338CA", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>✎ Edit</button>
//                             <button onClick={() => remove(z)} style={{ flex: 1, padding: "7px", border: "none", borderRadius: "8px", background: "#FCEBEB", color: "#A32D2D", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>🗑 Delete</button>
//                         </div>}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// // ─────────────────────────────────────────────
// // FORWARD — Person / Team, reason kandippaa; stage maaraadhu
// // ─────────────────────────────────────────────
// const ForwardEnquiryModal = ({ enquiry, staff, exclude = [], onCancel, onConfirm, busy }) => {
//     const [mode, setMode] = useState("person");
//     const [toStaff, setToStaff] = useState("");
//     const [toTeam, setToTeam] = useState("");
//     const [reason, setReason] = useState("");
//     if (!enquiry) return null;
//     const skip = new Set(exclude.filter(Boolean).map(String));
//     const people = (staff || []).filter((s) => !skip.has(String(s._id)));
//     const teams = teamsFromStaff(people);
//     const ready = reason.trim() && (mode === "person" ? toStaff : toTeam);
//     const inp = { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "9px 10px", fontSize: "13px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box" };
//     return (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} role="dialog" aria-modal="true" aria-labelledby="fwd-title">
//             <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "420px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
//                 <h3 id="fwd-title" style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>↪ Forward enquiry</h3>
//                 <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569" }}>
//                     <b style={{ color: "#0C447C" }}>{enquiry.fitCode || "—"}</b> · {enquiry.fullName}
//                 </p>
//                 <p style={{ margin: "4px 0 14px", fontSize: "12px", color: "#64748b" }}>It stays at the same stage — the new person continues from there. For a team, whoever clicks first takes it.</p>
//                 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
//                     <label htmlFor="fwd-to" style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>Forward to</label>
//                     <ToModeSwitch value={mode} onChange={setMode} />
//                 </div>
//                 {mode === "person" ? (
//                     <select id="fwd-to" value={toStaff} onChange={(e) => setToStaff(e.target.value)} style={inp}>
//                         <option value="">Choose staff</option>
//                         <StaffOptions staff={people} />
//                     </select>
//                 ) : (
//                     <select id="fwd-to" value={toTeam} onChange={(e) => setToTeam(e.target.value)} style={inp}>
//                         <option value="">Choose team</option>
//                         {teams.map((t) => <option key={t._id} value={t._id}>{t.name} team ({t.count} {t.count === 1 ? "member" : "members"})</option>)}
//                     </select>
//                 )}
//                 <label htmlFor="fwd-reason" style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", margin: "14px 0 6px" }}>Reason <span style={{ color: "#ef4444" }}>*</span></label>
//                 <textarea id="fwd-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} placeholder="e.g. Customer wants a Kerala specialist" style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} />
//                 <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
//                     <button onClick={onCancel} disabled={busy} style={{ flex: 1, padding: "10px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#64748b", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
//                     <button onClick={() => ready && onConfirm(mode === "person" ? { toStaff, reason: reason.trim() } : { toTeam, reason: reason.trim() })} disabled={!ready || busy}
//                         style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: !ready || busy ? "#cbd5e1" : "#0E7490", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: !ready || busy ? "not-allowed" : "pointer" }}>
//                         {busy ? "Forwarding…" : "Forward"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // Forward history (expanded view)
// const ForwardHistory = ({ list = [] }) => {
//     if (!list?.length) return null;
//     const STAGE = { pending: "Pending", pickup: "Picked up", ratePassed: "Rate shared", accepted: "Accepted", rejected: "Rejected" };
//     return (
//         <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", border: "0.5px solid #A5F3FC" }}>
//             <div style={{ fontSize: "11px", fontWeight: 700, color: "#0E7490", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>↪ Forward history</div>
//             <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
//                 {[...list].reverse().map((d, i) => (
//                     <div key={i} style={{ background: "#ECFEFF", borderRadius: "8px", padding: "8px 10px", fontSize: "12px" }}>
//                         <div style={{ fontWeight: 700, color: "#1e293b" }}>{ownerText(d.from) || "Unassigned"} <span style={{ color: "#0E7490" }}>→</span> {ownerText(d.to)}</div>
//                         <div style={{ color: "#334155", whiteSpace: "pre-line", wordBreak: "break-word" }}>{d.reason}</div>
//                         <div style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>
//                             by {cancelWho(d.by) || "—"} · {d.at ? new Date(d.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : ""}{d.stage ? ` · at ${STAGE[d.stage] || d.stage}` : ""}
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// // ─────────────────────────────────────────────
// // CONFIRM MODAL (Accept / Reject / Delete / Rate Shared)
// // ─────────────────────────────────────────────
// const ConfirmModal = ({ open, type, name, fitCode, sub, onConfirm, onCancel, zones = [], onOpenZones, showGvShare = false }) => {
//     const [salesValue, setSalesValue] = useState("");
//     const [zoneIds, setZoneIds] = useState([]); // Pickup — oru zone-aavadhu kandippaa (pala zones um select pannalaam)
//     const toggleZone = (id) => setZoneIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
//     const [fitStates, setFitStates] = useState([]);
//     const [pickupDate, setPickupDate] = useState("");
//     const [pickupTime, setPickupTime] = useState("");
//     const [pickupPlace, setPickupPlace] = useState("");
//     const [dropDate, setDropDate] = useState("");
//     const [dropTime, setDropTime] = useState("");
//     const [dropPlace, setDropPlace] = useState("");
//     const [shareVinoth, setShareVinoth] = useState("");
//     const [shareGiridhar, setShareGiridhar] = useState("");
//     // Cancel (accepted enquiry) — charge mandatory, reason optional
//     const [cancelCharge, setCancelCharge] = useState("");
//     const [cancelReason, setCancelReason] = useState("");
//     useEffect(() => {
//         if (open) {
//             setSalesValue(""); setFitStates([]);
//             setPickupDate(""); setPickupTime(""); setPickupPlace("");
//             setDropDate(""); setDropTime(""); setDropPlace("");
//             setShareVinoth(""); setShareGiridhar("");
//             setCancelCharge(""); setCancelReason(""); setZoneIds([]);
//         }
//     }, [open]);

//     if (!open) return null;

//     const allStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
//     const toggleState = (s) => setFitStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

//     // ── ratePassed uses the same lightweight confirm UI as reject/delete
//     // (icon + title + sub text + Yes/Cancel buttons) — no extra form
//     // fields needed, just a "are you sure" gate before the toggle fires. ──
//     const cfg = {
//         accept: { iconBg: "#EAF3DE", iconColor: "#3B6D11", title: "Accept Enquiry", btnBg: "#3B6D11", lbl: "✓ Confirm Accept" },
//         reject: { icon: "✕", iconBg: "#FCEBEB", iconColor: "#A32D2D", title: "Reject Enquiry?", sub: "This will mark the enquiry as rejected.", btnBg: "#A32D2D", lbl: "Yes, Reject" },
//         delete: { icon: "🗑", iconBg: "#FCEBEB", iconColor: "#A32D2D", title: "Delete Enquiry?", sub: "This action cannot be undone.", btnBg: "#A32D2D", lbl: "Yes, Delete" },
//         pickup: { icon: "✋", iconBg: "#E0F2FE", iconColor: "#075985", title: "Pick up Enquiry", sub: "Choose one or more zones. After pick up, only you will see this enquiry.", btnBg: "#0369A1", lbl: "Save & Pick up" },
//         ratePassed: { icon: "💰", iconBg: "#FEF3C7", iconColor: "#92400E", title: "Mark Rate Shared?", sub: "This will move the enquiry to the Rate Shared queue, out of the regular Pending list.", btnBg: "#92400E", lbl: "Yes, Mark Rate Shared" },
//         close: { icon: "🔒", iconBg: "#E2E8F0", iconColor: "#334155", title: "Close Enquiry?", sub: "This will move the enquiry out of Accepted into the Closed list.", btnBg: "#334155", lbl: "Yes, Close" },
//         reopen: { icon: "↺", iconBg: "#E0E7FF", iconColor: "#3730A3", title: "Reopen Enquiry?", sub: "This will move the enquiry back to the stage it was in before it was rejected.", btnBg: "#3730A3", lbl: "Yes, Reopen" },
//         reopenClosed: { icon: "↺", iconBg: "#E0E7FF", iconColor: "#3730A3", title: "Reopen Closed Enquiry?", sub: "This will move the enquiry back to Accepted.", btnBg: "#3730A3", lbl: "Yes, Reopen" },
//         cancel: { icon: "🚫", iconBg: "#FFE4E6", iconColor: "#9F1239", title: "Cancel Trip?", sub: "This accepted enquiry will move to the Cancelled list.", btnBg: "#9F1239", lbl: "Yes, Cancel Trip" },
//     };
//     const c = { ...(cfg[type] || cfg.delete), ...(sub ? { sub } : {}) };

//     // FIT States is OPTIONAL — selecting at least one is no longer
//     // required to enable the Accept button.
//     // Drop, pickup ku munnaadi irukka koodaadhu
//     const dropBeforePickup = !!(pickupDate && pickupTime && dropDate && dropTime) && `${dropDate}T${dropTime}` < `${pickupDate}T${pickupTime}`;
//     const isAcceptDisabled = type === "accept" && (
//         !salesValue || Number(salesValue) <= 0 ||
//         !pickupDate || !pickupTime || !pickupPlace.trim() ||
//         dropBeforePickup
//     );

//     const isCancelDisabled = type === "cancel" && (cancelCharge === "" || !(Number(cancelCharge) >= 0));
//     const isPickupDisabled = type === "pickup" && !zoneIds.length;
//     const isDisabled = isAcceptDisabled || isCancelDisabled || isPickupDisabled;

//     const handleConfirm = () => {
//         if (type === "accept") onConfirm({
//             salesValue: Number(salesValue), fitStates, pickupDate, pickupTime, pickupPlace, dropDate, dropTime, dropPlace: dropPlace.trim(),
//             ...(showGvShare && (shareVinoth !== "" || shareGiridhar !== "")
//                 ? { gvShare: { vinoth: shareVinoth === "" ? null : Number(shareVinoth), giridhar: shareGiridhar === "" ? null : Number(shareGiridhar) } }
//                 : {}),
//         });
//         else if (type === "cancel") onConfirm({ cancellationCharge: Number(cancelCharge), reason: cancelReason.trim() });
//         else if (type === "pickup") onConfirm({ zoneIds });
//         else onConfirm({});
//     };

//     const inpStyle = { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "9px 10px", fontSize: "13px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box" };
//     const lblStyle = { fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" };

//     return (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
//             <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: type === "accept" ? "500px" : type === "cancel" || type === "pickup" ? "420px" : "320px", border: "0.5px solid #e2e8f0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>

//                 <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "20px", color: c.iconColor, fontWeight: 700 }}>
//                     {type === "accept" ? "✓" : c.icon}
//                 </div>
//                 <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", textAlign: "center", marginBottom: "4px" }}>{c.title}</h3>
//                 <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "18px" }}>
//                     <strong style={{ color: "#1e293b" }}>{name}</strong>
//                 </p>
//                 {/* FIT Code pill for Reject / Rate Shared / Close / Reopen
//                     (Accept already shows it in its own block below) */}
//                 {type !== "accept" && fitCode && (
//                     <div style={{ textAlign: "center", marginTop: "-10px", marginBottom: "14px" }}>
//                         <span style={{ display: "inline-block", fontSize: "12px", fontWeight: 800, color: "#0C447C", background: "#E6F1FB", padding: "4px 12px", borderRadius: "6px", letterSpacing: "1px", fontFamily: "monospace" }}>
//                             🏷 {fitCode}
//                         </span>
//                     </div>
//                 )}

//                 {type === "accept" && (
//                     <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>

//                         {/* FIT Code */}
//                         <div style={{ background: "#E6F1FB", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//                             <span style={{ fontSize: "12px", color: "#0C447C", fontWeight: 500 }}>🏷 FIT Code</span>
//                             <span style={{ fontSize: "14px", fontWeight: 800, color: "#0C447C", background: "#fff", padding: "4px 12px", borderRadius: "6px", letterSpacing: "1px", fontFamily: "monospace" }}>
//                                 {fitCode || "—"}
//                             </span>
//                         </div>

//                         {/* FIT States — now OPTIONAL */}
//                         <div>
//                             <label style={lblStyle}>
//                                 🗺 FIT States <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span>
//                                 <span style={{ float: "right", fontSize: "11px", fontWeight: 600, background: fitStates.length > 0 ? "#EAF3DE" : "#f1f5f9", color: fitStates.length > 0 ? "#3B6D11" : "#94a3b8", padding: "2px 8px", borderRadius: "10px" }}>
//                                     {fitStates.length} selected
//                                 </span>
//                             </label>
//                             <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}>
//                                 {allStates.map((state) => (
//                                     <button key={state} type="button" onClick={() => toggleState(state)}
//                                         style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: fitStates.includes(state) ? "none" : "1px solid #e2e8f0", background: fitStates.includes(state) ? "#0C447C" : "#fff", color: fitStates.includes(state) ? "#fff" : "#475569", whiteSpace: "nowrap" }}>
//                                         {fitStates.includes(state) ? "✓ " : ""}{state}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Sales Value */}
//                         <div>
//                             <label style={lblStyle}>💰 Sales Value (₹) <span style={{ color: "#ef4444" }}>*</span></label>
//                             <div style={{ position: "relative" }}>
//                                 <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#94a3b8" }}>₹</span>
//                                 <input type="number" min="1" placeholder="e.g. 25000" value={salesValue} onChange={(e) => setSalesValue(e.target.value)}
//                                     style={{ ...inpStyle, paddingLeft: "28px", border: `1.5px solid ${!salesValue || Number(salesValue) <= 0 ? "#fca5a5" : "#e2e8f0"}` }} />
//                             </div>
//                             {(!salesValue || Number(salesValue) <= 0) && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Enter a valid sales value</p>}
//                         </div>

//                         {/* Pickup Date + Time */}
//                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
//                             <div>
//                                 <label style={lblStyle}>📅 Pickup Date <span style={{ color: "#ef4444" }}>*</span></label>
//                                 <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
//                                     style={{ ...inpStyle, border: `1.5px solid ${!pickupDate ? "#fca5a5" : "#e2e8f0"}` }} />
//                                 {!pickupDate && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Required</p>}
//                             </div>
//                             <div>
//                                 <label style={lblStyle}>🕐 Pickup Time <span style={{ color: "#ef4444" }}>*</span></label>
//                                 <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
//                                     style={{ ...inpStyle, border: `1.5px solid ${!pickupTime ? "#fca5a5" : "#e2e8f0"}` }} />
//                                 {!pickupTime && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Required</p>}
//                             </div>
//                         </div>

//                         {/* GV Share — Vinoth / Giridhar / Tour admin / Admin ku mattum */}
//                         {showGvShare && (
//                             <div style={{ border: "1px dashed #CBD5E1", borderRadius: "10px", padding: "10px 12px", background: "#F8FAFC" }}>
//                                 <div style={{ fontSize: "12px", fontWeight: 800, color: "#0C447C", marginBottom: "8px" }}>🤝 GV Share <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></div>
//                                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
//                                     <div>
//                                         <label style={lblStyle}>Vinoth (GVEMP008) share (₹)</label>
//                                         <input type="number" min="0" placeholder="e.g. 5000" value={shareVinoth} onChange={(e) => setShareVinoth(e.target.value)} style={inpStyle} />
//                                     </div>
//                                     <div>
//                                         <label style={lblStyle}>Giridharan (GVEMP009) share (₹)</label>
//                                         <input type="number" min="0" placeholder="e.g. 3000" value={shareGiridhar} onChange={(e) => setShareGiridhar(e.target.value)} style={inpStyle} />
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Drop Date + Time — idhu thaandinaa accepted enquiry auto close */}
//                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
//                             <div>
//                                 <label style={lblStyle}>📅 Drop Date <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
//                                 <input type="date" value={dropDate} min={pickupDate || undefined} onChange={(e) => setDropDate(e.target.value)}
//                                     style={{ ...inpStyle, border: `1.5px solid ${dropBeforePickup ? "#fca5a5" : "#e2e8f0"}` }} />
//                             </div>
//                             <div>
//                                 <label style={lblStyle}>🕐 Drop Time <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
//                                 <input type="time" value={dropTime} onChange={(e) => setDropTime(e.target.value)}
//                                     style={{ ...inpStyle, border: `1.5px solid ${dropBeforePickup ? "#fca5a5" : "#e2e8f0"}` }} />
//                             </div>
//                         </div>
//                         {dropBeforePickup && <p style={{ fontSize: "11px", color: "#ef4444", margin: "-6px 0 0" }}>⚠ Drop date and time must be after pickup</p>}
//                         <p style={{ fontSize: "11px", color: "#64748b", margin: "-6px 0 0" }}>If a drop date is given, the enquiry closes automatically after the drop date and time.</p>

//                         {/* Pickup Place */}
//                         <div>
//                             <label style={lblStyle}>📍 Pickup Place <span style={{ color: "#ef4444" }}>*</span></label>
//                             <input type="text" placeholder="e.g. Chennai Airport, T2" value={pickupPlace} onChange={(e) => setPickupPlace(e.target.value)}
//                                 style={{ ...inpStyle, border: `1.5px solid ${!pickupPlace.trim() ? "#fca5a5" : "#e2e8f0"}` }} />
//                             {!pickupPlace.trim() && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Required</p>}
//                         </div>

//                         {/* Drop Place */}
//                         <div>
//                             <label style={lblStyle}>📍 Drop Place <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
//                             <input type="text" placeholder="e.g. Madurai Railway Station" value={dropPlace} onChange={(e) => setDropPlace(e.target.value)}
//                                 style={{ ...inpStyle, border: "1.5px solid #e2e8f0" }} />
//                         </div>
//                     </div>
//                 )}

//                 {type !== "accept" && (
//                     <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "18px" }}>{c.sub}</p>
//                 )}

//                 {/* Pick up — zone select (kandippaa) */}
//                 {type === "pickup" && (
//                     <div style={{ marginBottom: "18px" }}>
//                         <label style={lblStyle}>
//                             🗺 Zones <span style={{ color: "#ef4444" }}>*</span>
//                             <span style={{ float: "right", fontSize: "11px", fontWeight: 600, background: zoneIds.length ? "#E0F2FE" : "#f1f5f9", color: zoneIds.length ? "#075985" : "#94a3b8", padding: "2px 8px", borderRadius: "10px" }}>{zoneIds.length} selected</span>
//                         </label>
//                         {zones.length === 0 ? (
//                             <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", color: "#92400E" }}>
//                                 No zones yet. Create a zone first.
//                                 {onOpenZones && <button type="button" onClick={onOpenZones} style={{ marginLeft: "6px", border: "none", background: "none", color: "#1d4ed8", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Open Zones</button>}
//                             </div>
//                         ) : (
//                             <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "320px", overflowY: "auto" }}>
//                                 {zones.map((z) => {
//                                     const on = zoneIds.includes(z._id);
//                                     return (
//                                         <div key={z._id} role="checkbox" aria-checked={on} tabIndex={0} onClick={() => toggleZone(z._id)}
//                                             onKeyDown={(ev) => { if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); toggleZone(z._id); } }}
//                                             style={{ textAlign: "left", padding: "10px 12px", borderRadius: "10px", cursor: "pointer", border: on ? "2px solid #0369A1" : "1px solid #e2e8f0", background: on ? "#E0F2FE" : "#fff" }}>
//                                             <div style={{ fontSize: "13px", fontWeight: 800, color: "#0C447C", marginBottom: "6px" }}>{on ? "☑ " : "☐ "}{z.name}</div>
//                                             <ZoneStateChips z={z} />
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Cancel Trip — charge (mandatory) + reason (optional) */}
//                 {type === "cancel" && (
//                     <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
//                         <div>
//                             <label style={lblStyle}>💸 Cancellation Charge (₹) <span style={{ color: "#ef4444" }}>*</span></label>
//                             <div style={{ position: "relative" }}>
//                                 <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#94a3b8" }}>₹</span>
//                                 <input type="number" min="0" placeholder="e.g. 2000  (0 if no charge)" value={cancelCharge} onChange={(e) => setCancelCharge(e.target.value)}
//                                     style={{ ...inpStyle, paddingLeft: "28px", border: `1.5px solid ${isCancelDisabled ? "#fca5a5" : "#e2e8f0"}` }} />
//                             </div>
//                             {isCancelDisabled && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Enter the charge (0 if none)</p>}
//                         </div>
//                         <div>
//                             <label style={lblStyle}>📝 Reason / Remarks <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
//                             <textarea rows={3} placeholder="e.g. Customer health issue, trip postponed…" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
//                                 style={{ ...inpStyle, resize: "vertical", fontFamily: "inherit" }} />
//                         </div>
//                     </div>
//                 )}

//                 <div style={{ display: "flex", gap: "8px" }}>
//                     <button onClick={onCancel} style={{ flex: 1, padding: "10px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#64748b", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>{type === "cancel" ? "Go Back" : "Cancel"}</button>
//                     <button onClick={handleConfirm} disabled={isDisabled}
//                         style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: isDisabled ? "#cbd5e1" : c.btnBg, color: "#fff", fontSize: "13px", cursor: isDisabled ? "not-allowed" : "pointer", fontWeight: 700 }}>
//                         {c.lbl}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ─────────────────────────────────────────────
// // EDIT ENQUIRY MODAL
// // ─────────────────────────────────────────────
// const EditEnquiryModal = ({ open, data, onClose, onSave, zones = [], onSaveZones, showGvShare = false }) => {
//     const [form, setForm] = useState({});
//     // Zones — pick up aana enquiry la endha stage la irundhaalum maathalaam
//     const [zoneIds, setZoneIds] = useState([]);
//     const origZoneIds = (zonesOfEnq(data).map((z) => String(z.zoneId || "")).filter(Boolean)).sort().join(",");
//     const [saving, setSaving] = useState(false);
//     const [counts, setCounts] = useState({ a: 1, c: 0, i: 0 });
//     const [fitStates, setFitStates] = useState([]);

//     useEffect(() => {
//         if (open && data) {
//             setForm({
//                 fullName: data.fullName || "",
//                 mobileNumber: data.mobileNumber || "",
//                 email: data.email || "",
//                 city: data.city || "",
//                 destination: data.destination || "",
//                 tourType: data.tourType || "",
//                 preferredTravelDate: data.preferredTravelDate ? new Date(data.preferredTravelDate).toISOString().split("T")[0] : "",
//                 numberOfDays: data.numberOfDays || "",
//                 numberOfNights: data.numberOfNights || "",
//                 specialRequests: data.specialRequests || "",
//                 source: data.source || "",
//                 status: data.status || "pending",
//                 salesValue: data.salesValue || "",
//                 pickupDate: data.pickupDate ? new Date(data.pickupDate).toISOString().split("T")[0] : "",
//                 pickupTime: data.pickupTime || "",
//                 pickupPlace: data.pickupPlace || "",
//                 dropDate: data.dropDate ? new Date(data.dropDate).toISOString().split("T")[0] : "",
//                 dropTime: data.dropTime || "",
//                 dropPlace: data.dropPlace || "",
//                 shareVinoth: data.gvShare?.vinoth ?? "",
//                 shareGiridhar: data.gvShare?.giridhar ?? "",
//                 // Cancelled trip → charge / reason thiruthalaam
//                 ...(data.isCancelled ? {
//                     cancellationCharge: data.cancellationCharge ?? 0,
//                     cancelReason: data.cancelReason || "",
//                 } : {}),
//             });
//             setCounts({ a: data.adults || 1, c: data.children || 0, i: data.infants || 0 });
//             setFitStates(data.fitStates || []);
//             setZoneIds(zonesOfEnq(data).map((z) => String(z.zoneId || "")).filter(Boolean));
//         }
//     }, [open, data]);

//     if (!open) return null;

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setForm((p) => {
//             const updated = { ...p, [name]: value };
//             if (name === "numberOfDays") {
//                 const days = Number(value);
//                 updated.numberOfNights = days > 0 ? String(days - 1) : "";
//             }
//             return updated;
//         });
//     };

//     // original values store
//     const original = {
//         fullName: data?.fullName || "", mobileNumber: data?.mobileNumber || "",
//         email: data?.email || "", city: data?.city || "",
//         destination: data?.destination || "", tourType: data?.tourType || "",
//         preferredTravelDate: data?.preferredTravelDate ? new Date(data.preferredTravelDate).toISOString().split("T")[0] : "",
//         numberOfDays: String(data?.numberOfDays || ""), numberOfNights: String(data?.numberOfNights || ""),
//         specialRequests: data?.specialRequests || "", source: data?.source || "",
//         status: data?.status || "pending", salesValue: String(data?.salesValue || ""),
//         pickupDate: data?.pickupDate ? new Date(data.pickupDate).toISOString().split("T")[0] : "",
//         pickupTime: data?.pickupTime || "", pickupPlace: data?.pickupPlace || "",
//         dropDate: data?.dropDate ? new Date(data.dropDate).toISOString().split("T")[0] : "",
//         dropTime: data?.dropTime || "",
//         dropPlace: data?.dropPlace || "",
//     };

//     const changeCount = (key, delta) => {
//         setCounts((prev) => {
//             const u = { ...prev, [key]: Math.max(0, prev[key] + delta) };
//             if (key === "a" && u[key] < 1) u[key] = 1;
//             return u;
//         });
//     };

//     const toggleState = (s) => setFitStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

//     const zonesChanged = [...zoneIds].sort().join(",") !== origZoneIds;
//     const showZones = !!data?.isPickedUp || zonesOfEnq(data).length > 0;
//     const toggleZoneId = (id) => setZoneIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

//     const handleSave = async () => {
//         if (showZones && !zoneIds.length) return toast.error("Select at least one zone");
//         setSaving(true);
//         if (showZones && zonesChanged && onSaveZones) {
//             const zr = await onSaveZones(data._id, zoneIds);
//             if (!zr?.success) { setSaving(false); return; }
//         }
//         const { shareVinoth, shareGiridhar, ...formRest } = form;
//         const result = await onSave(data._id, {
//             ...formRest,
//             ...(showGvShare && data.status === "accepted"
//                 ? { gvShare: { vinoth: shareVinoth === "" || shareVinoth === null ? null : Number(shareVinoth), giridhar: shareGiridhar === "" || shareGiridhar === null ? null : Number(shareGiridhar) } }
//                 : {}),
//             adults: counts.a,
//             children: counts.c,
//             infants: counts.i,
//             numberOfDays: Number(form.numberOfDays),
//             numberOfNights: Number(form.numberOfNights),
//             salesValue: form.salesValue ? Number(form.salesValue) : null,
//             fitStates,
//             ...(data.isCancelled ? {
//                 cancellationCharge: Number(form.cancellationCharge) || 0,
//                 cancelReason: (form.cancelReason || "").trim(),
//             } : {}),
//         });
//         setSaving(false);
//         if (result?.success) onClose();
//     };

//     const allStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

//     const inp = { width: "100%", border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "11px 12px", fontSize: "14px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box", height: "44px" }; const lbl = { fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" };
//     const sec = { fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" };

//     return (
//         <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
//             <style>{`
//             .eq-edit-add { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
// @media (max-width: 600px) { .eq-edit-add { grid-template-columns: 1fr !important; } }
//     .eq-edit-grid2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
//     .eq-edit-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
//     .eq-edit-grid2c { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 12px; }
//     .eq-edit-grid3t { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
//     @media (max-width: 600px) {
//         .eq-edit-grid2  { grid-template-columns: 1fr !important; }
//         .eq-edit-grid3  { grid-template-columns: 1fr !important; }
//         .eq-edit-grid2c { grid-template-columns: 1fr !important; }
//         .eq-edit-grid3t { grid-template-columns: 1fr !important; }
//     }
// `}</style>
//             <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

//                 {/* Header */}
//                 <div style={{ position: "sticky", top: 0, background: "#1e293b", padding: "16px 20px", borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
//                     <div>
//                         <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>✎ Edit Enquiry</div>
//                         <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{data?.fitCode} — {data?.fullName}</div>
//                     </div>
//                     <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px" }}>✕</button>
//                 </div>

//                 <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

//                     {/* Personal Details */}
//                     <div>
//                         <div style={sec}><span style={{ background: "#dbeafe", borderRadius: "6px", padding: "4px 8px" }}>👤</span> Personal Details</div>
//                         <div className="eq-edit-grid2">                            {[
//                             { label: "Full Name", name: "fullName", placeholder: "Full name" },
//                             { label: "Mobile Number", name: "mobileNumber", placeholder: "+91 XXXXX XXXXX" },
//                             { label: "Email", name: "email", placeholder: "email@example.com", type: "email" },
//                             { label: "City", name: "city", placeholder: "e.g. Chennai" },
//                         ].map((f) => (
//                             <div key={f.name}>
//                                 <label style={lbl}>{f.label}</label>
//                                 <input name={f.name} value={form[f.name] || ""} onChange={handleChange} type={f.type || "text"} placeholder={f.placeholder} style={inp} />
//                             </div>
//                         ))}
//                         </div>
//                     </div>

//                     {/* Tour Details */}
//                     <div>
//                         <div style={sec}><span style={{ background: "#d1fae5", borderRadius: "6px", padding: "4px 8px" }}>🗺️</span> Tour Details</div>
//                         <div className="eq-edit-grid2c">                            <div>
//                             <label style={lbl}>Destination</label>
//                             <input name="destination" value={form.destination || ""} onChange={handleChange} placeholder="e.g. Kerala" style={inp} />
//                         </div>
//                             <div>
//                                 <label style={lbl}>Tour Type</label>
//                                 <select name="tourType" value={form.tourType || ""} onChange={handleChange} style={{ ...inp, appearance: "none" }}>
//                                     <option value="">Select type</option>
//                                     <option>Group tour(fixed departure)</option>
//                                     <option>Customized/Private tour</option>
//                                     <option>Friends</option><option>Family</option>
//                                     <option>Corporate/Team Outing</option>
//                                     <option>Honeymoon</option>
//                                     <option>pilgrimage tour</option>
//                                     <option>Others</option>
//                                 </select>
//                             </div>
//                         </div>
//                         <div className="eq-edit-grid3">
//                             <div>
//                                 <label style={lbl}>Travel Date</label>
//                                 <input type="date" name="preferredTravelDate" value={form.preferredTravelDate || ""} onChange={handleChange}
//                                     min={new Date().toISOString().split("T")[0]}
//                                     style={inp} />

//                             </div>
//                             <div>
//                                 <label style={lbl}>No. of Days</label>
//                                 <input type="number" name="numberOfDays" value={form.numberOfDays || ""} onChange={handleChange} min="1" placeholder="5" style={inp} />
//                             </div>
//                             <div>
//                                 <label style={lbl}>No. of Nights</label>
//                                 <input type="number" name="numberOfNights" value={form.numberOfNights || ""} onChange={handleChange} min="0" placeholder="4" style={inp} />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Travellers */}
//                     <div>
//                         <div style={sec}><span style={{ background: "#ede9fe", borderRadius: "6px", padding: "4px 8px" }}>👥</span> Travellers</div>
//                         <div className="eq-edit-grid3t">                            {[
//                             { key: "a", label: "Adults", color: "#2563eb", bg: "#dbeafe" },
//                             { key: "c", label: "Children (6–10)", color: "#ec4899", bg: "#fce7f3" },
//                             { key: "i", label: "Infants (0–5)", color: "#f97316", bg: "#ffedd5" },
//                         ].map((t) => (
//                             <div key={t.key} style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
//                                 <div style={{ fontSize: "12px", fontWeight: 600, color: t.color, marginBottom: "8px" }}>{t.label}</div>
//                                 <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
//                                     <button type="button" onClick={() => changeCount(t.key, -1)} style={{ width: "30px", height: "30px", borderRadius: "6px", background: t.bg, border: "none", color: t.color, fontSize: "18px", cursor: "pointer" }}>−</button>
//                                     <span style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", minWidth: "24px" }}>{counts[t.key]}</span>
//                                     <button type="button" onClick={() => changeCount(t.key, 1)} style={{ width: "30px", height: "30px", borderRadius: "6px", background: t.bg, border: "none", color: t.color, fontSize: "18px", cursor: "pointer" }}>+</button>
//                                 </div>
//                             </div>
//                         ))}
//                         </div>
//                     </div>

//                     {/* Status & Sales */}
//                     {data?.status === "accepted" && <div>
//                         <div style={sec}><span style={{ background: "#fef3c7", borderRadius: "6px", padding: "4px 8px" }}>📊</span> Status & Sales</div>
//                         <div className="eq-edit-grid2">                            <div>
//                             <label style={lbl}>Status</label>
//                             <select name="status" value={form.status || ""} onChange={handleChange} style={{ ...inp, appearance: "none" }}>
//                                 <option value="pending">Pending</option>
//                                 <option value="accepted">Accepted</option>
//                                 <option value="rejected">Rejected</option>
//                             </select>
//                         </div>
//                             <div>
//                                 <label style={lbl}>Sales Value (₹)</label>
//                                 <input type="number" name="salesValue" value={form.salesValue || ""} onChange={handleChange} min="0" placeholder="e.g. 25000" style={inp} />
//                             </div>
//                         </div>
//                     </div>}

//                     {/* Pickup Details */}
//                     {data?.status === "accepted" && <div>
//                         <div style={sec}><span style={{ background: "#ffedd5", borderRadius: "6px", padding: "4px 8px" }}>🚐</span> Pickup Details</div>
//                         <div className="eq-edit-grid2c">                            <div>
//                             <label style={lbl}>Pickup Date</label>
//                             <input type="date" name="pickupDate" value={form.pickupDate || ""} onChange={handleChange} style={inp} />
//                         </div>
//                             <div>
//                                 <label style={lbl}>Pickup Time</label>
//                                 <input type="time" name="pickupTime" value={form.pickupTime || ""} onChange={handleChange} style={inp} />
//                             </div>
//                         </div>
//                         <div className="eq-edit-grid2c">
//                             <div>
//                                 <label style={lbl}>Drop Date</label>
//                                 <input type="date" name="dropDate" value={form.dropDate || ""} min={form.pickupDate || undefined} onChange={handleChange} style={inp} />
//                             </div>
//                             <div>
//                                 <label style={lbl}>Drop Time</label>
//                                 <input type="time" name="dropTime" value={form.dropTime || ""} onChange={handleChange} style={inp} />
//                             </div>
//                         </div>
//                         <div>
//                             <label style={lbl}>Pickup Place</label>
//                             <input type="text" name="pickupPlace" value={form.pickupPlace || ""} onChange={handleChange} placeholder="e.g. Chennai Airport T2" style={inp} />
//                         </div>
//                         <div style={{ marginTop: "12px" }}>
//                             <label style={lbl}>Drop Place</label>
//                             <input type="text" name="dropPlace" value={form.dropPlace || ""} onChange={handleChange} placeholder="e.g. Madurai Railway Station" style={inp} />
//                         </div>
//                     </div>}

//                     {/* GV Share — Vinoth / Giridhar / Tour admin / Admin ku mattum */}
//                     {showGvShare && data?.status === "accepted" && <div>
//                         <div style={sec}><span style={{ background: "#F1F5F9", borderRadius: "6px", padding: "4px 8px" }}>🤝</span> GV Share</div>
//                         <div className="eq-edit-grid2c">
//                             <div>
//                                 <label style={lbl}>Vinoth (GVEMP008) share (₹)</label>
//                                 <input type="number" min="0" name="shareVinoth" value={form.shareVinoth ?? ""} onChange={handleChange} placeholder="e.g. 5000" style={inp} />
//                             </div>
//                             <div>
//                                 <label style={lbl}>Giridharan (GVEMP009) share (₹)</label>
//                                 <input type="number" min="0" name="shareGiridhar" value={form.shareGiridhar ?? ""} onChange={handleChange} placeholder="e.g. 3000" style={inp} />
//                             </div>
//                         </div>
//                     </div>}

//                     {/* Zones — endha stage la irundhaalum maathalaam */}
//                     {showZones && <div>
//                         <div style={sec}><span style={{ background: "#E0F2FE", borderRadius: "6px", padding: "4px 8px" }}>🗺</span> Zones <span style={{ color: "#ef4444" }}>*</span>
//                             <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 600, background: zoneIds.length ? "#E0F2FE" : "#FEE2E2", color: zoneIds.length ? "#075985" : "#B91C1C", padding: "2px 8px", borderRadius: "10px" }}>{zoneIds.length} selected</span>
//                         </div>
//                         {zones.length === 0 ? (
//                             <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>No zones available.</p>
//                         ) : (
//                             <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
//                                 {zones.map((z) => {
//                                     const id = String(z._id);
//                                     const on = zoneIds.includes(id);
//                                     return (
//                                         <div key={id} role="checkbox" aria-checked={on} tabIndex={0} onClick={() => toggleZoneId(id)}
//                                             onKeyDown={(ev) => { if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); toggleZoneId(id); } }}
//                                             style={{ padding: "10px 12px", borderRadius: "10px", cursor: "pointer", border: on ? "2px solid #0369A1" : "1px solid #e2e8f0", background: on ? "#E0F2FE" : "#fff" }}>
//                                             <div style={{ fontSize: "13px", fontWeight: 800, color: "#0C447C", marginBottom: "6px" }}>{on ? "☑ " : "☐ "}{z.name}</div>
//                                             <ZoneStateChips z={z} />
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>}

//                     {/* FIT States */}
//                     {data?.status === "accepted" && <div>
//                         <div style={sec}>
//                             <span style={{ background: "#E6F1FB", borderRadius: "6px", padding: "4px 8px" }}>🗺</span> FIT States
//                             <span style={{ marginLeft: "auto", fontSize: "11px", background: fitStates.length > 0 ? "#EAF3DE" : "#f1f5f9", color: fitStates.length > 0 ? "#3B6D11" : "#94a3b8", padding: "2px 8px", borderRadius: "10px" }}>
//                                 {fitStates.length} selected
//                             </span>
//                         </div>
//                         <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: "0.5px solid #e2e8f0" }}>
//                             {allStates.map((state) => (
//                                 <button key={state} type="button" onClick={() => toggleState(state)}
//                                     style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: fitStates.includes(state) ? "none" : "1px solid #e2e8f0", background: fitStates.includes(state) ? "#0C447C" : "#fff", color: fitStates.includes(state) ? "#fff" : "#475569", whiteSpace: "nowrap" }}>
//                                     {fitStates.includes(state) ? "✓ " : ""}{state}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>}

//                     {/* Cancellation (cancelled trip mattum) — thappa pottirundha thiruthalaam */}
//                     {data?.isCancelled && <div>
//                         <div style={sec}><span style={{ background: "#FFE4E6", borderRadius: "6px", padding: "4px 8px" }}>🚫</span> Cancellation</div>
//                         <div className="eq-edit-add">
//                             <div>
//                                 <label style={lbl}>Cancellation Charge (₹) <span style={{ color: "#ef4444" }}>*</span></label>
//                                 <input type="number" name="cancellationCharge" value={form.cancellationCharge ?? ""} onChange={handleChange} min="0" placeholder="0 if no charge" style={inp} />
//                             </div>
//                             <div>
//                                 <label style={lbl}>Reason / Remarks <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
//                                 <textarea name="cancelReason" value={form.cancelReason || ""} onChange={handleChange} rows={2}
//                                     placeholder="Reason for cancellation"
//                                     style={{ ...inp, height: "auto", resize: "vertical", fontFamily: "inherit" }} />
//                             </div>
//                         </div>
//                     </div>}

//                     {/* Additional Info */}
//                     <div>
//                         <div style={sec}><span style={{ background: "#ffedd5", borderRadius: "6px", padding: "4px 8px" }}>💬</span> Additional Info</div>
//                         <div className="eq-edit-add">                            <div>
//                             <label style={lbl}>Special Requests</label>
//                             <textarea name="specialRequests" value={form.specialRequests || ""} onChange={handleChange} rows={3}
//                                 placeholder="e.g. vegetarian meals..."
//                                 style={{ ...inp, height: "auto", resize: "none" }} />
//                         </div>
//                             <div>
//                                 <label style={lbl}>Source</label>
//                                 <select name="source" value={form.source || ""} onChange={handleChange} style={{ ...inp, appearance: "none" }}>
//                                     <option value="">Select source</option>
//                                     <option value="Regular">Regular</option>
//                                     <option value="Google">Google</option>
//                                     <option value="Facebook">Facebook</option>
//                                     <option value="Instagram">Instagram</option>
//                                     <option value="YouTube">YouTube</option>
//                                     <option value="Friends & Family">Friends & Family</option>
//                                     <option value="Whatsapp/Referral">Whatsapp/Referral</option>
//                                     <option value="Others">Others</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "0.5px solid #e2e8f0", padding: "14px 20px", display: "flex", gap: "10px", borderRadius: "0 0 16px 16px" }}>
//                     <button onClick={onClose} style={{ flex: 1, padding: "11px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#64748b", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
//                     <button onClick={handleSave} disabled={saving}
//                         style={{ flex: 2, padding: "11px", border: "none", borderRadius: "10px", background: saving ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: "13px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
//                         {saving
//                             ? <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Saving...</>
//                             : "💾 Save Changes"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ─────────────────────────────────────────────
// // ADMIN ENQUIRY FORM (Raise Enquiry tab)
// // ─────────────────────────────────────────────
// const AdminEnquiryForm = ({ onSuccess }) => {
//     const { adminCreateEnquiry, enquiryLoading } = useContext(TourContext);
//     const [submitted, setSubmitted] = useState(null);
//     const [formData, setFormData] = useState({
//         fullName: "", mobileNumber: "", email: "", city: "",
//         destination: "", tourType: "", preferredTravelDate: "",
//         numberOfDays: "", numberOfNights: "", specialRequests: "", source: "admin",
//     });
//     const [counts, setCounts] = useState({ a: 1, c: 0, i: 0 });

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((p) => {
//             const updated = { ...p, [name]: value };
//             if (name === "numberOfDays") {
//                 const days = Number(value);
//                 updated.numberOfNights = days > 0 ? String(days - 1) : "";
//             }
//             return updated;
//         });
//     };

//     const changeCount = (key, delta) => {
//         setCounts((prev) => { const u = { ...prev, [key]: Math.max(0, prev[key] + delta) }; if (key === "a" && u[key] < 1) u[key] = 1; return u; });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         window.scrollTo({ top: 0, behavior: "smooth" });
//         const result = await adminCreateEnquiry({ ...formData, adults: counts.a, children: counts.c, infants: counts.i, numberOfDays: Number(formData.numberOfDays), numberOfNights: Number(formData.numberOfNights) });
//         if (result.success) {
//             setSubmitted(result.fitCode);
//             setFormData({ fullName: "", mobileNumber: "", email: "", city: "", destination: "", tourType: "", preferredTravelDate: "", numberOfDays: "", numberOfNights: "", specialRequests: "", source: "admin" });
//             setCounts({ a: 1, c: 0, i: 0 });
//             setTimeout(() => { setSubmitted(null); if (onSuccess) onSuccess(); }, 3000);
//         }
//     };

//     const inp = { width: "100%", border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px 10px 36px", fontSize: "13px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box", height: "46px" };
//     const lbl = { fontSize: "14px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" };
//     const sec = { fontSize: "14px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" };
//     const enquiryFormDirty = Object.entries(formData).some(([k, v]) => k !== "source" && String(v || "").trim() !== "");
//     return (
//         <div>
//             <LeaveGuard
//                 when={enquiryFormDirty}
//                 title="Unsaved Enquiry"
//                 message={
//                     <>
//                         The enquiry you started is not submitted yet.
//                         <br />
//                         Leaving this page will lose the details you entered.
//                         <br />
//                         Are you sure you want to leave?
//                     </>
//                 }
//             />

//             <style>{`
//                 @keyframes spin { to { transform:rotate(360deg); } }
//                 .aeq-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
//                 .aeq-trav { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
//                 .aeq-add  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
//                 .aeq-tour-r1 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
//                 .aeq-tour-r2 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
//                 @media (max-width:1024px) { .aeq-trav { grid-template-columns:repeat(2,1fr) !important; } }
//                 @media (max-width:640px) {
//                     .aeq-grid    { grid-template-columns:1fr !important; gap:10px !important; }
//                     .aeq-trav    { grid-template-columns:1fr !important; gap:10px !important; }
//                     .aeq-add     { grid-template-columns:1fr !important; gap:10px !important; }
//                     .aeq-tour-r1 { grid-template-columns:1fr !important; gap:10px !important; }
//                     .aeq-tour-r2 { grid-template-columns:1fr !important; gap:10px !important; }
//                     .aeq-inp     { height:50px !important; font-size:14px !important; padding:12px 12px 12px 36px !important; }
//                     .aeq-lbl     { font-size:13px !important; margin-bottom:5px !important; }
//                 }
//             `}</style>

//             {submitted && (
//                 <div style={{ background: "#0C447C", borderRadius: "14px", padding: "20px 24px", marginBottom: "20px" }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
//                         <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#1e6db5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>✅</div>
//                         <div style={{ flex: 1 }}>
//                             <div style={{ fontSize: "13px", color: "#93c5fd", marginBottom: "4px" }}>Enquiry created successfully!</div>
//                             <div style={{ fontSize: "12px", color: "#bfdbfe" }}>FIT Code assigned:</div>
//                             <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "2px", fontFamily: "monospace" }}>{submitted}</div>
//                             <div style={{ fontSize: "11px", color: "#93c5fd", marginTop: "4px" }}>Switching to All Enquiries in 3 seconds...</div>
//                         </div>
//                         <button onClick={() => { setSubmitted(null); if (onSuccess) onSuccess(); }} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #3b82f6", borderRadius: "8px", color: "#93c5fd", fontSize: "12px", cursor: "pointer" }}>View Now →</button>
//                     </div>
//                 </div>
//             )}

//             <div style={{ background: "#E6F1FB", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #bfdbfe" }}>
//                 <span style={{ fontSize: "20px" }}>🏷</span>
//                 <div>
//                     <div style={{ fontSize: "12px", fontWeight: 700, color: "#0C447C" }}>FIT Code Auto-Generation</div>
//                     <div style={{ fontSize: "11px", color: "#1e40af" }}>A unique FIT Code will be automatically assigned when submitted.</div>
//                 </div>
//             </div>

//             <form onSubmit={handleSubmit}>
//                 <div style={{ background: "#fff", borderRadius: "14px", border: "0.5px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
//                     <div>
//                         <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</span>Personal Details</div>
//                         <div className="aeq-grid">
//                             {[
//                                 { label: "Full Name *", name: "fullName", placeholder: "Enter full name", required: true },
//                                 { label: "Mobile Number *", name: "mobileNumber", placeholder: "+91 XXXXX XXXXX", required: true },
//                                 { label: "Email Address", name: "email", placeholder: "email@example.com", type: "email" },
//                                 { label: "City / Location", name: "city", placeholder: "e.g. Chennai" },
//                             ].map((f) => (
//                                 <div key={f.name}>
//                                     <label className="aeq-lbl" style={lbl}>{f.label}</label>
//                                     <input className="aeq-inp" name={f.name} value={formData[f.name]} onChange={handleChange} required={f.required} type={f.type || "text"} placeholder={f.placeholder} style={{ ...inp, paddingLeft: "12px" }} />
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                     <div>
//                         <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>🗺️</span>Tour Details</div>
//                         <div className="aeq-tour-r1">
//                             <div>
//                                 <label className="aeq-lbl" style={lbl}>Destination *</label>
//                                 <div style={{ position: "relative" }}>
//                                     <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", zIndex: 1 }}>🌍</span>
//                                     <input className="aeq-inp" name="destination" value={formData.destination} onChange={(e) => { const v = e.target.value; setFormData(p => ({ ...p, destination: v.charAt(0).toUpperCase() + v.slice(1) })); }} required placeholder="e.g. Kerala" style={inp} />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="aeq-lbl" style={lbl}>Tour Type *</label>
//                                 <div style={{ position: "relative" }}>
//                                     <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", zIndex: 1 }}>🏷️</span>
//                                     <select className="aeq-inp" name="tourType" value={formData.tourType} onChange={handleChange} required style={{ ...inp, appearance: "none" }}>
//                                         <option value="">Select type</option>
//                                         <option>Group tour(fixed departure)</option><option>Customized/Private tour</option>
//                                         <option>Friends</option><option>Family</option><option>Corporate/Team Outing</option>
//                                         <option>Honeymoon</option><option>pilgrimage tour</option><option>Others</option>
//                                     </select>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="aeq-tour-r2">
//                             <div>
//                                 <label className="aeq-lbl" style={lbl}>Travel Date</label>
//                                 <div style={{ position: "relative" }}>
//                                     <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>📅</span>
//                                     <input className="aeq-inp" name="preferredTravelDate" value={formData.preferredTravelDate} onChange={handleChange} type="date" min={new Date().toISOString().split("T")[0]} style={inp} />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="aeq-lbl" style={lbl}>No. of Days</label>
//                                 <div style={{ position: "relative" }}>
//                                     <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🌤️</span>
//                                     <input className="aeq-inp" name="numberOfDays" value={formData.numberOfDays} onChange={handleChange} type="number" min="1" placeholder="5" style={inp} />
//                                 </div>
//                             </div>
//                             <div>
//                                 <label className="aeq-lbl" style={lbl}>No. of Nights</label>
//                                 <div style={{ position: "relative" }}>
//                                     <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🌙</span>
//                                     <input className="aeq-inp" name="numberOfNights" value={formData.numberOfNights} onChange={handleChange} type="number" min="0" placeholder="4" style={inp} />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div>
//                         <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>👥</span>Travellers</div>
//                         <div className="aeq-trav">
//                             {[
//                                 { key: "a", label: "Adults", color: "#2563eb", bg: "#dbeafe" },
//                                 { key: "c", label: "Children (6–10)", color: "#ec4899", bg: "#fce7f3" },
//                                 { key: "i", label: "Infants (0–5)", color: "#f97316", bg: "#ffedd5" },
//                             ].map((t) => (
//                                 <div key={t.key} style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
//                                     <div style={{ fontSize: "12px", fontWeight: 600, color: t.color, marginBottom: "10px" }}>{t.label}</div>
//                                     <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "8px" }}>
//                                         <button type="button" onClick={() => changeCount(t.key, -1)} style={{ height: "36px", borderRadius: "8px", background: t.bg, border: "none", color: t.color, fontSize: "20px", cursor: "pointer" }}>−</button>
//                                         <span style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", textAlign: "center", minWidth: "28px" }}>{counts[t.key]}</span>
//                                         <button type="button" onClick={() => changeCount(t.key, 1)} style={{ height: "36px", borderRadius: "8px", background: t.bg, border: "none", color: t.color, fontSize: "20px", cursor: "pointer" }}>+</button>
//                                     </div>
//                                 </div>
//                             ))}
//                             <div style={{ background: "#eff6ff", border: "0.5px solid #bfdbfe", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
//                                 <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginBottom: "4px" }}>Total Pax</div>
//                                 <div style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>{counts.a + counts.c + counts.i}</div>
//                             </div>
//                         </div>
//                     </div>
//                     <div>
//                         <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</span>Additional Info</div>
//                         <div className="aeq-add">
//                             <div>
//                                 <label style={lbl}>Special Requests</label>
//                                 <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} rows={3} placeholder="e.g. vegetarian meals..." style={{ ...inp, height: "auto", resize: "none" }} />
//                             </div>
//                             <div>
//                                 <label style={lbl}>Source</label>
//                                 <select name="source" value={formData.source} onChange={handleChange} style={inp}>
//                                     <option value="">Select Source</option>
//                                     <option value="Regular">Regular</option>
//                                     <option value="Google">Google</option><option value="Facebook">Facebook</option>
//                                     <option value="Instagram">Instagram</option><option value="YouTube">YouTube</option>
//                                     <option value="Friends & Family">Friends & Family</option>
//                                     <option value="Whatsapp/Referral">Whatsapp/Referral</option>
//                                     <option value="Others">Others</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <button type="submit" disabled={enquiryLoading}
//                     style={{ width: "100%", marginTop: "16px", padding: "14px", background: enquiryLoading ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: enquiryLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
//                     {enquiryLoading
//                         ? <><div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Creating Enquiry...</>
//                         : "✈️ Create Enquiry"}
//                 </button>
//             </form>
//         </div>
//     );
// };

// // ─────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────
// const TripEnquiries = ({ adminView = false }) => {
//     const { getAllEnquiries: tcGetAllEnquiries, enquiries: tcEnquiries, enquiryLoading: tcEnquiryLoading, acceptEnquiry, rejectEnquiry, updateEnquiry, toggleRatePassed, closeEnquiry, reopenEnquiry, backendUrl, ttoken } = useContext(TourContext);
//     // Admin login (Tour Admin illa) → VIEW ONLY: Raise, Edit, Accept, Close, Cancel… ellaam maraiyum
//     const { aToken, adminViewEnquiries } = useContext(TourAdminContext);
//     const viewOnly = adminView || (!ttoken && !!aToken);
//     const me = useStaffSelf(); // staff login na avanga, Tour admin na null
//     // GV Share — backend sollum (Vinoth / Giridhar staff login, Tour admin, Admin ku mattum true)
//     const [gvShareOk, setGvShareOk] = useState(false);

//     // View only → list TourAdminContext la irundhu (aToken). Tour Admin / Staff → munnaadi maadhiriye.
//     const [adminList, setAdminList] = useState({ list: [], loading: false });
//     const loadAdminEnquiries = useCallback(async () => {
//         setAdminList((p) => ({ ...p, loading: true }));
//         try {
//             const list = await adminViewEnquiries();
//             setAdminList({ list, loading: false });
//         } catch (err) {
//             toast.error(err.response?.data?.message || err.message);
//             setAdminList({ list: [], loading: false });
//         }
//     }, [adminViewEnquiries]);
//     const enquiries = viewOnly ? adminList.list : tcEnquiries;
//     const enquiryLoading = viewOnly ? adminList.loading : tcEnquiryLoading;
//     const getAllEnquiries = viewOnly ? loadAdminEnquiries : tcGetAllEnquiries;

//     // Accepted trip ah cancel panna — charge + reason (optional)
//     // Pending enquiry ah pick up panna (login la irukkuravanga per la)
//     const pickupEnquiryReq = async (id, body = {}) => {
//         try {
//             const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${id}/pickup`, body, { headers: { ttoken } });
//             data.success ? toast.success(data.message) : toast.error(data.message);
//             return data;
//         } catch (err) {
//             toast.error(err.response?.data?.message || err.message);
//             return { success: false };
//         }
//     };

//     const cancelEnquiryTrip = async (id, body) => {
//         try {
//             const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${id}/cancel`, body, { headers: { ttoken } });
//             data.success ? toast.success(data.message) : toast.error(data.message);
//             return data;
//         } catch (err) {
//             toast.error(err.response?.data?.message || err.message);
//             return { success: false };
//         }
//     };
//     const [activeTab, setActiveTab] = useState("all");
//     // My Enquiries → default Pickup stage (Pending inga varaadhu); All Enquiries → Pending
//     useEffect(() => {
//         if (activeTab === "mine") setFilters((p) => ({ ...p, status: "pickup", raisedBy: "" }));
//         else if (activeTab === "all") setFilters((p) => (p.status === "pickup" ? { ...p, status: "pending" } : p));
//     }, [activeTab]);

//     // ── Zones + Forward ──
//     const [zones, setZones] = useState([]);
//     const [staffList, setStaffList] = useState([]);
//     const [forwarding, setForwarding] = useState(null); // forward panra enquiry
//     const [fwdBusy, setFwdBusy] = useState(false);
//     const zoneApi = {
//         createZone: async (states, districts = {}) => (await axios.post(`${backendUrl}/api/tour/fit-zones`, { states, districts }, { headers: { ttoken } })).data,
//         updateZone: async (id, states, districts = {}) => (await axios.put(`${backendUrl}/api/tour/fit-zones/${id}`, { states, districts }, { headers: { ttoken } })).data,
//         deleteZone: async (id) => (await axios.delete(`${backendUrl}/api/tour/fit-zones/${id}`, { headers: { ttoken } })).data,
//     };
//     // axios error → message
//     const wrapApi = Object.fromEntries(Object.entries(zoneApi).map(([k, fn]) => [k, async (...a) => {
//         try { return await fn(...a); } catch (err) { throw new Error(err.response?.data?.message || err.message); }
//     }]));
//     const loadZones = useCallback(async () => {

//         try {
//             const { data } = await axios.get(`${backendUrl}/api/tour/fit-zones`, { headers: viewOnly ? { aToken, atoken: aToken } : { ttoken } });
//             if (data.success) setZones(data.data || []);
//         } catch { /* zones illaama list velai seyyum */ }
//     }, [backendUrl, ttoken, aToken, viewOnly]);
//     const loadStaff = useCallback(async () => {
//         if (viewOnly) return;
//         try {
//             const { data } = await axios.get(`${backendUrl}/api/tour/staff/all`, { headers: { ttoken } });
//             // Active + login ON staff ku mattum forward
//             setStaffList((data.data || []).filter((s) => s.status !== "Inactive" && s.loginEnabled !== false));
//         } catch { setStaffList([]); }
//     }, [backendUrl, ttoken, viewOnly]);
//     useEffect(() => { loadZones(); loadStaff(); }, [loadZones, loadStaff]);
//     useEffect(() => {
//         let alive = true;
//         axios.get(`${backendUrl}/api/tour/gv-share/access`, { headers: viewOnly ? { aToken, atoken: aToken } : { ttoken } })
//             .then(({ data }) => { if (alive) setGvShareOk(!!data?.allowed); })
//             .catch(() => { if (alive) setGvShareOk(false); });
//         return () => { alive = false; };
//     }, [backendUrl, ttoken, aToken, viewOnly]);

//     const forwardEnquiryReq = async (e, payload) => {
//         setFwdBusy(true);
//         try {
//             const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${e._id}/forward`, payload, { headers: { ttoken } });
//             data.success ? toast.success(data.message) : toast.error(data.message);
//             if (data.success) setForwarding(null);
//         } catch (err) {
//             toast.error(err.response?.data?.message || err.message);
//         } finally {
//             setFwdBusy(false);
//             await getAllEnquiries();
//         }
//     };
//     // Forward — Closed / Cancelled / Rejected thavira ella stage la um
//     const canForward = (e) => !viewOnly && !["closed", "cancelled", "rejected"].includes(stageOfEnq(e)); // Rejected la Reopen mattum
//     // ── "ratePassed" is a virtual filter value layered on top of `status`.
//     //    It does NOT correspond to a real status in the DB — selecting it
//     //    filters to status === "pending" AND isRatePassed === true. ──
//     const [filters, setFilters] = useState({ search: "", destination: "", tourType: "", status: "pending", fromDate: "", toDate: "", raisedBy: "", fitCode: "" });
//     const [expandedId, setExpandedId] = useState(null);
//     const [modal, setModal] = useState({ open: false, type: "", id: "", name: "", fitCode: "", sub: "" });
//     const [editModal, setEditModal] = useState({ open: false, data: null });
//     const [loadingId, setLoadingId] = useState(null);
//     const [lastEditedId, setLastEditedId] = useState(() => localStorage.getItem("gv_lastEditedId") || null);
//     const [lastEditedFields, setLastEditedFields] = useState(() => {
//         try { return JSON.parse(localStorage.getItem("gv_lastEditedFields") || "{}"); } catch { return {}; }
//     });

//     useEffect(() => { getAllEnquiries(); }, []);

//     // Stat card click → andha list open aagum (status / raised-by filter)
//     //   "total" → ellaam, "s:<stage>" → status, "r:<admin|user>" → raised by
//     const openStatCard = (key) => {
//         if (key === "total") setFilters((p) => ({ ...p, status: "", raisedBy: "" }));
//         else if (key.startsWith("s:")) setFilters((p) => ({ ...p, status: key.slice(2), raisedBy: "" }));
//         else if (key.startsWith("r:")) setFilters((p) => ({ ...p, status: "", raisedBy: key.slice(2) }));
//         setExpandedId(null);
//         setTimeout(() => document.getElementById("eq-list-top")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
//     };
//     const statCardActive = (key) => {
//         if (key === "total") return !filters.status && !filters.raisedBy;
//         if (key.startsWith("s:")) return filters.status === key.slice(2) && !filters.raisedBy;
//         if (key.startsWith("r:")) return filters.raisedBy === key.slice(2) && !filters.status;
//         return false;
//     };

//     // Date filter → inniku varai dhaan (local date, IST)
//     const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
//     const handleFilter = (e) => {
//         const { name, value } = e.target;
//         // Type panni future date pottaalum inniku ku maathidum
//         const v = (name === "fromDate" || name === "toDate") && value && value > todayStr ? todayStr : value;
//         setFilters((p) => ({ ...p, [name]: v }));
//     };
//     const clearFilters = () => setFilters({ search: "", destination: "", tourType: "", status: activeTab === "mine" ? "pickup" : "pending", fromDate: "", toDate: "", raisedBy: "", fitCode: "" });

//     const openModal = (type, id, name, fitCode = "", sub = "") => setModal({ open: true, type, id, name, fitCode, sub });
//     const closeModal = () => setModal({ open: false, type: "", id: "", name: "", fitCode: "", sub: "" });

//     // ── Stage helpers ──────────────────────────────────────────────────
//     // "Rate Shared" and "Closed" are flags layered on top of the real
//     // status (pending / accepted), same idea as before. stageOf() gives the
//     // single stage key an enquiry is CURRENTLY in; restoreStageOf() gives
//     // the stage a rejected enquiry will go back to when reopened.
//     const stageLabels = { pending: "Pending", pickup: "Pickup", ratePassed: "Rate Shared", accepted: "Accepted", closed: "Closed", cancelled: "Cancelled", rejected: "Rejected" };
//     const stageOf = (e) => {
//         if (e.status === "pending") return e.isRatePassed ? "ratePassed" : e.isPickedUp ? "pickup" : "pending";
//         if (e.status === "accepted") return e.isCancelled ? "cancelled" : e.isClosed ? "closed" : "accepted";
//         return e.status;
//     };
//     const restoreStageOf = (e) => {
//         const prev = ["pending", "accepted"].includes(e.previousStatus) ? e.previousStatus : "pending";
//         return stageOf({ ...e, status: prev });
//     };
//     // Target stage is shown as a coloured pill (same colours as the Status
//     // badge in the table) so it's obvious where the enquiry will land.
//     const openReopen = (e) => {
//         const stage = restoreStageOf(e);
//         const sc = statusConfig[stage] || statusConfig.pending;
//         const rj = statusConfig.rejected;
//         const pill = (cfg, label, strong) => (
//             <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: cfg.bg, color: cfg.color, padding: strong ? "6px 14px" : "5px 12px", borderRadius: "20px", fontSize: strong ? "13px" : "12px", fontWeight: 700, whiteSpace: "nowrap", opacity: strong ? 1 : 0.6, border: strong ? `1.5px solid ${cfg.dot}` : "1.5px solid transparent" }}>
//                 <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
//                 {label}
//             </span>
//         );
//         // Rendered inside ConfirmModal's <p>, so only <span>s here (no <div>).
//         openModal("reopen", e._id, e.fullName, e.fitCode || "", (
//             <>
//                 <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", marginBottom: "10px" }}>
//                     {pill(rj, "Rejected", false)}
//                     <span style={{ fontSize: "16px", color: "#94a3b8", fontWeight: 700 }}>→</span>
//                     {pill(sc, stageLabels[stage], true)}
//                 </span>
//                 <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
//                     Goes back to the stage it was in before it was rejected.
//                 </span>
//             </>
//         ));
//     };

//     // ── Rate Shared toggle now goes through the SAME confirm modal as
//     // Accept/Reject/Delete — clicking the button no longer fires the
//     // toggle directly, it opens a "are you sure?" gate first. ──────────
//     // ── My Enquiries / All Enquiries ──
//     // My = ippo en kitta irukkuradhu (naan pick panna / action panna / enakku forward aanadhu).
//     // Staff: All = innum yaar kittaiyum illaadhadhu (common) — My la irukkuradhu inga varaadhu.
//     // Tour admin / Admin: All = ellaame.
//     const isMineEnq = (e) => {
//         const o = ownerOfEnq(e);
//         if (!o) return false;
//         return me ? o.type === "staff" && String(o.staffId) === String(me._id) : o.type === "touradmin";
//     };
//     const allList = enquiries || [];
//     const showMineTab = !viewOnly && !!me; // My Enquiries — staff login la mattum (Admin / Tour admin ku ellaam All la)
//     const myCount = showMineTab ? allList.filter(isMineEnq).length : 0;
//     const tabList = activeTab === "mine" && showMineTab ? allList.filter(isMineEnq) : me ? allList.filter((e) => !isMineEnq(e)) : allList;

//     const filtered = tabList.filter((e) => {
//         const s = filters.search.toLowerCase();
//         // "pending" and "ratePassed" are mutually exclusive views over the
//         // same underlying status==="pending" enquiries, split by the
//         // isRatePassed flag. Without this split, toggling Rate Shared on
//         // an enquiry would leave it visible in BOTH the Pending filter
//         // AND the Rate Shared filter — defeating the purpose of the
//         // toggle (it's meant to move enquiries out of the regular
//         // Pending queue into a separate "on hold" queue).
//         // Same split for accepted: "accepted" shows only open ones,
//         // "closed" shows accepted + isClosed.
//         const statusMatches = !filters.status ? true : stageOf(e) === filters.status;
//         return (
//             (!s || e.fullName?.toLowerCase().includes(s) || e.mobileNumber?.includes(s) || e.email?.toLowerCase().includes(s)) &&
//             (!filters.destination || e.destination?.toLowerCase().includes(filters.destination.toLowerCase())) &&
//             (!filters.fitCode || e.fitCode?.toLowerCase().includes(filters.fitCode.toLowerCase())) &&
//             (!filters.tourType || e.tourType === filters.tourType) &&
//             statusMatches &&
//             (!filters.raisedBy || e.raisedBy === filters.raisedBy) &&
//             (!filters.fromDate || new Date(e.createdAt) >= new Date(`${filters.fromDate}T00:00:00`)) &&
//             (!filters.toDate || new Date(e.createdAt) <= new Date(`${filters.toDate}T23:59:59.999`))
//         );
//     }).sort((a, b) => {
//         // accepted filter → pickup date wise (earliest first)
//         if (filters.status === "accepted" || filters.status === "closed" || filters.status === "cancelled") {
//             const da = a.pickupDate ? new Date(a.pickupDate) : new Date(0);
//             const db = b.pickupDate ? new Date(b.pickupDate) : new Date(0);
//             return da - db;
//         }
//         // default → fitCode ascending (GVFIT0001 first)
//         const numA = parseInt(a.fitCode?.replace(/\D/g, "") || "0");
//         const numB = parseInt(b.fitCode?.replace(/\D/g, "") || "0");
//         return numA - numB;
//     });

//     // Closed → Accepted ku thirumba
//     const reopenClosedReq = async (id) => {
//         try {
//             const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${id}/reopen-closed`, {}, { headers: { ttoken } });
//             if (data.success) toast.success(data.message); else toast.error(data.message);
//         } catch (err) {
//             toast.error(err.response?.data?.message || err.message);
//         }
//     };
//     const handleConfirm = async (extraData = {}) => {
//         const { type, id } = modal;
//         closeModal();
//         setLoadingId(id + "_" + type);
//         try {
//             if (type === "accept") await acceptEnquiry(id, extraData);
//             else if (type === "reject") await rejectEnquiry(id);
//             else if (type === "ratePassed") await toggleRatePassed(id);
//             else if (type === "close") await closeEnquiry(id);
//             else if (type === "reopen") await reopenEnquiry(id);
//             else if (type === "reopenClosed") await reopenClosedReq(id);
//             else if (type === "cancel") await cancelEnquiryTrip(id, extraData);
//             else if (type === "pickup") await pickupEnquiryReq(id, extraData); // { zoneIds: [...] }
//         } catch (err) {
//             console.error("Accept/Reject/RateShared/Close/Reopen Error:", err);
//         }
//         setLoadingId(null);
//         await getAllEnquiries();
//     };

//     const statusConfig = {
//         pending: { bg: "#FAEEDA", color: "#633806", dot: "#EF9F27", label: "Pending" },
//         accepted: { bg: "#EAF3DE", color: "#27500A", dot: "#639922", label: "Accepted" },
//         rejected: { bg: "#FCEBEB", color: "#501313", dot: "#E24B4A", label: "Rejected" },
//         pickup: { bg: "#E0F2FE", color: "#075985", dot: "#0EA5E9", label: "Pickup" },
//         ratePassed: { bg: "#FEF3C7", color: "#92400E", dot: "#EAB308", label: "Rate Shared" },
//         closed: { bg: "#E2E8F0", color: "#334155", dot: "#64748B", label: "Closed" },
//         cancelled: { bg: "#FFE4E6", color: "#9F1239", dot: "#E11D48", label: "Cancelled" },
//     };

//     // Cancel details (Cancelled stage la kaatta)
//     const fmtDT = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
//     // ── Yaaru enna panna (actionLog) ─────────────────────────────────
//     const ACTION_LABEL = {
//         created: "Raised", pickedUp: "Picked up", rateShared: "Rate shared", rateCleared: "Rate shared removed",
//         accepted: "Accepted", closed: "Closed", cancelled: "Cancelled", cancelEdited: "Cancel charge edited",
//         rejected: "Rejected", reopened: "Reopened", forwarded: "Forwarded",
//     };
//     const ACTION_COLOR = {
//         created: "#64748b", pickedUp: "#0369A1", rateShared: "#B45309", rateCleared: "#B45309",
//         accepted: "#3B6D11", closed: "#334155", cancelled: "#9F1239", cancelEdited: "#9F1239",
//         rejected: "#A32D2D", reopened: "#3730A3", forwarded: "#0E7490",
//     };
//     const shortWho = (b) => !b ? "" : b.type === "staff" ? (b.name || "Staff") : b.type === "touradmin" ? "Tour admin" : b.type === "admin" ? "Admin" : (b.name || "");
//     // actionLog + pazhaya cancel (log illaama pannadhu) → time order
//     const activityOf = (e) => {
//         const log = Array.isArray(e.actionLog) ? [...e.actionLog] : [];
//         if (e.isCancelled && e.cancelledBy && !log.some((a) => a.action === "cancelled")) {
//             log.push({ action: "cancelled", by: e.cancelledBy, at: e.cancelledAt });
//         }
//         return log.sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0));
//     };
//     // Raised By — login per (Staff / Tour admin). Pazhaya enquiries ku "Admin" / "User" apdiye.
//     const raisedByLabel = (e) => {
//         const c = activityOf(e).find((a) => a.action === "created");
//         if (c?.by) return `🔧 ${shortWho(c.by)}`;
//         return e.raisedBy === "admin" ? "🔧 Admin" : "🌐 User";
//     };
//     // Status badge keezha kaatta — indha stage ku vandha action yaaru panna
//     const stageWho = (e) => {
//         const want = { pickup: "pickedUp", ratePassed: "rateShared", accepted: "accepted", closed: "closed", cancelled: "cancelled", rejected: "rejected" }[stageOf(e)];
//         if (!want) return null;
//         const hit = activityOf(e).filter((a) => a.action === want).pop();
//         return hit?.by ? shortWho(hit.by) : (stageOf(e) === "pickup" ? shortWho(e.pickedUpBy) : null);
//     };
//     const ActivityList = ({ e }) => {
//         const items = activityOf(e);
//         if (!items.length) return null;
//         return (
//             <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", border: "0.5px solid #e2e8f0" }}>
//                 <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369A1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>🕒 Activity Log</div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
//                     {items.map((a, idx) => (
//                         <div key={idx} style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px", fontSize: "12px" }}>
//                             <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: ACTION_COLOR[a.action] || "#64748b", display: "inline-block", flexShrink: 0, alignSelf: "center" }} />
//                             <span style={{ fontWeight: 700, color: ACTION_COLOR[a.action] || "#334155" }}>{ACTION_LABEL[a.action] || a.action}</span>
//                             <span style={{ color: "#1e293b" }}>by <b>{cancelWho(a.by) || "—"}</b>{a.to ? <> → <b>{a.to}</b></> : null}{a.zone ? <> · 🗺 {a.zone}</> : null}</span>
//                             <span style={{ color: "#94a3b8" }}>· {fmtDT(a.at)}</span>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         );
//     };

//     const cancelRows = (e) => [
//         ["Cancellation Charge", `₹${Number(e.cancellationCharge || 0).toLocaleString("en-IN")}`],
//         ["Reason", e.cancelReason || "—"],
//         ["Cancelled By", cancelWho(e.cancelledBy) || "—"],
//         ["Cancelled On", fmtDT(e.cancelledAt)],
//         ...(e.cancelEditedBy ? [["Charge Edited By", `${cancelWho(e.cancelEditedBy)} · ${fmtDT(e.cancelEditedAt)}`]] : []),
//     ];

//     // minmax() on the badge columns (FIT Code / Raised By / Status) so the
//     // pills never get clipped on narrower laptop/tablet widths — the text
//     // columns (Name, Destination) shrink with ellipsis instead.
//     const col = "36px minmax(0,1.5fr) minmax(96px,1fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,1fr) minmax(78px,0.8fr) minmax(118px,0.9fr) 150px";
//     const headers = ["S.No", "Name", "FIT Code", "Destination", "Travel Date", "Enquired On", "Raised By", "Status", "Actions"];
//     const fInp = { border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "7px 10px", fontSize: "12px", outline: "none", background: "#f8fafc", color: "#1e293b", height: "34px", width: "100%" };
//     const destFmt = (d) => d ? d.charAt(0).toUpperCase() + d.slice(1).toLowerCase() : "—";
//     const P = "11px 11px";

//     return (
//         <div style={{ padding: "16px 20px", background: "white", minHeight: "100vh", width: "100%", boxSizing: "border-box" }}>
//             <LeaveGuard
//                 when={editModal.open}
//                 title="Unsaved Changes"
//                 message={
//                     <>
//                         You are editing an enquiry and the changes are not saved yet.
//                         <br />
//                         Leaving this page will lose them.
//                         <br />
//                         Are you sure you want to leave?
//                     </>
//                 }
//             />
//             <style>{`
//                 @keyframes spin { to { transform:rotate(360deg); } }
//                 @media (max-width:1000px) { .eq-desk { display:none !important; } }
//                                 @media (max-width:600px) { .eq-tabs { display:grid !important; grid-template-columns:1fr 1fr; width:100% !important; } .eq-tabs > button { white-space:nowrap; } }
//                 @media (min-width:1001px) { .eq-mob  { display:none !important; } }
// .eq-stats { display:grid; gap:10px; grid-template-columns:repeat(4,1fr); }
// @media (max-width:900px)  { .eq-stats { grid-template-columns:repeat(3,1fr) !important; } }
// @media (max-width:600px)  { .eq-stats { grid-template-columns:repeat(2,1fr) !important; } }
//                 @media (max-width:600px)  { .eq-stats { grid-template-columns:repeat(2,1fr) !important; } }
//                 .eq-flt-desk { display:flex; flex-direction:column; gap:10px; }
//                 @media (max-width:900px) { .eq-flt-mob { display:block !important; } .eq-flt-desk { display:none !important; } }
//             `}</style>

//             <ConfirmModal open={modal.open} type={modal.type} name={modal.name} fitCode={modal.fitCode} sub={modal.sub} onConfirm={handleConfirm} onCancel={closeModal} showGvShare={gvShareOk}
//                 zones={zones} onOpenZones={() => { closeModal(); setActiveTab("zones"); }} />
//             <ForwardEnquiryModal
//                 key={forwarding?._id || "none"}
//                 enquiry={forwarding}
//                 staff={staffList}
//                 exclude={[ownerOfEnq(forwarding)?.staffId, me?._id]}
//                 busy={fwdBusy}
//                 onCancel={() => setForwarding(null)}
//                 onConfirm={(payload) => forwardEnquiryReq(forwarding, payload)}
//             />

//             <EditEnquiryModal
//                 open={editModal.open}
//                 data={editModal.data}
//                 zones={zones}
//                 showGvShare={gvShareOk}
//                 onSaveZones={async (id, zoneIds) => {
//                     try {
//                         const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${id}/zones`, { zoneIds }, { headers: { ttoken } });
//                         if (!data.success) { toast.error(data.message); return { success: false }; }
//                         toast.success(data.message);
//                         await getAllEnquiries();
//                         return { success: true };
//                     } catch (err) {
//                         toast.error(err.response?.data?.message || err.message);
//                         return { success: false };
//                     }
//                 }}
//                 onClose={() => setEditModal({ open: false, data: null })}
//                 onSave={async (id, savedData) => {
//                     const original = editModal.data;
//                     const changed = {};
//                     Object.keys(savedData).forEach((key) => {
//                         if (String(savedData[key] ?? "") !== String(original[key] ?? "")) {
//                             changed[key] = true;
//                         }
//                     });
//                     const result = await updateEnquiry(id, savedData);
//                     if (result?.success) {
//                         setLastEditedId(id);
//                         setLastEditedFields(changed);
//                         localStorage.setItem("gv_lastEditedId", String(id));
//                         localStorage.setItem("gv_lastEditedFields", JSON.stringify(changed));
//                         await getAllEnquiries();
//                     }
//                     return result;
//                 }}
//             />

//             {/* Tabs */}
//             <div style={{ marginBottom: "16px", textAlign: "center" }}>
//                 <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>FIT Enquiries
//                     {viewOnly && <span style={{ fontSize: "12px", fontWeight: 600, background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: "20px" }}>👁 View only</span>}
//                 </h1><br />
//                 <div className="eq-tabs" style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content", margin: "0 auto" }}>
//                     {[{ key: "all", label: "📋 All Enquiries" }, ...(viewOnly ? [{ key: "zones", label: `🗺 Zones${zones.length ? ` (${zones.length})` : ""}` }] : [...(showMineTab ? [{ key: "mine", label: `👤 My Enquiries${myCount ? ` (${myCount})` : ""}` }] : []), { key: "raise", label: "➕ Raise Enquiry" }, { key: "zones", label: `🗺 Zones${zones.length ? ` (${zones.length})` : ""}` }])].map((t) => (
//                         <button key={t.key} onClick={() => setActiveTab(t.key)}
//                             style={{ padding: "7px 18px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: activeTab === t.key ? "#fff" : "transparent", color: activeTab === t.key ? "#0f172a" : "#64748b", boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
//                             {t.label}
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {activeTab === "zones" && <ZonesPanel zones={zones} reload={loadZones} api={wrapApi} readOnly={viewOnly} />}
//             {activeTab === "raise" && !viewOnly && <AdminEnquiryForm onSuccess={() => { setActiveTab("all"); setFilters(p => ({ ...p, status: "pending" })); getAllEnquiries(); }} />}
//             {(activeTab === "all" || activeTab === "mine") && (
//                 <>
//                     {/* Stats — 3 columns on desktop now */}
//                     <div className="eq-stats" style={{ marginBottom: "14px" }}>
//                         {[
//                             { key: "total", label: "Total", count: tabList.length, bg: "#E6F1FB", color: "#0C447C", icon: "📋" },
//                             ...(activeTab === "mine" ? [] : [{ key: "s:pending", label: "Pending", count: tabList.filter(e => stageOf(e) === "pending").length, bg: "#FAEEDA", color: "#633806", icon: "⏳" }]),
//                             { key: "s:pickup", label: "Pickup", count: tabList.filter(e => stageOf(e) === "pickup").length, bg: "#E0F2FE", color: "#075985", icon: "✋" },
//                             { key: "s:ratePassed", label: "Rate shared", count: tabList.filter(e => stageOf(e) === "ratePassed").length, bg: "#FEF3C7", color: "#92400E", icon: "💰" },
//                             { key: "s:accepted", label: "Accepted", count: tabList.filter(e => stageOf(e) === "accepted").length, bg: "#EAF3DE", color: "#27500A", icon: "✅" },
//                             { key: "s:closed", label: "Closed", count: tabList.filter(e => stageOf(e) === "closed").length, bg: "#E2E8F0", color: "#334155", icon: "🔒" },
//                             { key: "s:cancelled", label: "Cancelled", count: tabList.filter(e => stageOf(e) === "cancelled").length, bg: "#FFE4E6", color: "#9F1239", icon: "🚫" },
//                             { key: "s:rejected", label: "Rejected", count: tabList.filter(e => e.status === "rejected").length, bg: "#FCEBEB", color: "#501313", icon: "❌" },
//                             { key: "r:admin", label: "By Admin", count: tabList.filter(e => e.raisedBy === "admin").length, bg: "#FFF7ED", color: "#92400e", icon: "🔧" },
//                             { key: "r:user", label: "By User", count: tabList.filter(e => e.raisedBy === "user").length, bg: "#EEEDFE", color: "#26215C", icon: "🌐" },
//                         ].map((s, i) => {
//                             const active = statCardActive(s.key);
//                             return (
//                                 <div key={i} role="button" tabIndex={0} title={`Show ${s.label}`}
//                                     onClick={() => openStatCard(s.key)}
//                                     onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openStatCard(s.key); } }}
//                                     style={{ background: s.bg, borderRadius: "12px", padding: "12px 14px", position: "relative", overflow: "hidden", minHeight: "70px", cursor: "pointer", outline: "none", boxShadow: active ? `0 0 0 2px ${s.color}` : "none", transition: "box-shadow 0.15s, transform 0.15s" }}
//                                     onMouseEnter={(ev) => { ev.currentTarget.style.transform = "translateY(-1px)"; }}
//                                     onMouseLeave={(ev) => { ev.currentTarget.style.transform = "none"; }}>
//                                     <div style={{ position: "absolute", right: "-6px", top: "-6px", fontSize: "40px", opacity: 0.12 }}>{s.icon}</div>
//                                     <div style={{ fontSize: "24px", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</div>
//                                     <div style={{ fontSize: "11px", fontWeight: 500, color: s.color, opacity: 0.85, marginTop: "4px" }}>{s.icon} {s.label}</div>
//                                 </div>
//                             );
//                         })}
//                     </div>

//                     {/* Desktop Filters */}
//                     <div className="eq-flt-desk" style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
//                         <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.1fr 1fr", gap: "12px", marginBottom: "12px" }}>
//                             <div>
//                                 <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>SEARCH</label>
//                                 <input name="search" value={filters.search} onChange={handleFilter} placeholder="Name / mobile / email" style={fInp} />
//                             </div>
//                             <div>
//                                 <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>FIT CODE</label>
//                                 <input name="fitCode" value={filters.fitCode} onChange={handleFilter} placeholder="GVFIT0001" style={fInp} />
//                             </div>
//                             <div>
//                                 <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>DESTINATION</label>
//                                 <input name="destination" value={filters.destination} onChange={handleFilter} placeholder="e.g. Manali" style={fInp} />
//                             </div>
//                             <div>
//                                 <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>TOUR TYPE</label>
//                                 <select name="tourType" value={filters.tourType} onChange={handleFilter} style={fInp}>
//                                     <option value="">All types</option>
//                                     <option>Group tour(fixed departure)</option>
//                                     <option>Customized/Private tour</option>
//                                     <option>Friends</option><option>Family</option>
//                                     <option>Corporate/Team Outing</option>
//                                     <option>Honeymoon</option>
//                                     <option>pilgrimage tour</option>
//                                     <option>Others</option>
//                                 </select>
//                             </div>
//                         </div>
//                         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
//                             <div>
//                                 <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>STATUS</label>
//                                 <select name="status" value={filters.status} onChange={handleFilter} style={fInp}>
//                                     <option value="">All</option>
//                                     {activeTab !== "mine" && <option value="pending">Pending</option>}
//                                     <option value="pickup">Pickup</option>
//                                     <option value="ratePassed">Rate shared</option>
//                                     <option value="accepted">Accepted</option>
//                                     <option value="closed">Closed</option>
//                                     <option value="cancelled">Cancelled</option>
//                                     <option value="rejected">Rejected</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>RAISED BY</label>
//                                 <select name="raisedBy" value={filters.raisedBy} onChange={handleFilter} style={fInp}>
//                                     <option value="">All</option>
//                                     <option value="user">🌐 User</option>
//                                     <option value="admin">🔧 Admin</option>
//                                 </select>
//                             </div>
//                             <div>
//                                 <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>FROM</label>
//                                 <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilter} max={filters.toDate || todayStr} style={fInp} />
//                             </div>
//                             <div>
//                                 <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>TO</label>
//                                 <input type="date" name="toDate" value={filters.toDate} onChange={handleFilter} min={filters.fromDate || undefined} max={todayStr} style={fInp} />
//                             </div>
//                         </div>
//                         <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
//                             <button onClick={clearFilters} style={{ padding: "10px 28px", background: "royalblue", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer" }}>Clear Filters</button>
//                             <button onClick={getAllEnquiries} style={{ padding: "10px 24px", background: "royalblue", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "whitesmoke", cursor: "pointer" }}>🔄 Refresh</button>
//                         </div>
//                     </div>

//                     {/* Mobile Filters */}
//                     <div className="eq-flt-mob" style={{ display: "none" }}>
//                         <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
//                             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
//                                 {[
//                                     { label: "Search", name: "search", placeholder: "Name / mobile", type: "text" },
//                                     { label: "FIT Code", name: "fitCode", placeholder: "GVFIT0001", type: "text" },
//                                     { label: "Destination", name: "destination", placeholder: "e.g. Manali", type: "text" },
//                                 ].map((f) => (
//                                     <div key={f.name}>
//                                         <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
//                                         <input name={f.name} value={filters[f.name]} onChange={handleFilter} placeholder={f.placeholder} style={fInp} />
//                                     </div>
//                                 ))}
//                                 <div>
//                                     <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>Tour Type</label>
//                                     <select name="tourType" value={filters.tourType} onChange={handleFilter} style={fInp}>
//                                         <option value="">All types</option>
//                                         <option>Group tour(fixed departure)</option>
//                                         <option>Customized/Private tour</option>
//                                         <option>Friends</option><option>Family</option>
//                                         <option>Corporate/Team Outing</option>
//                                         <option>Honeymoon</option>
//                                         <option>pilgrimage tour</option>
//                                         <option>Others</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>Status</label>
//                                     <select name="status" value={filters.status} onChange={handleFilter} style={fInp}>
//                                         <option value="">All</option>
//                                         {activeTab !== "mine" && <option value="pending">Pending</option>}
//                                         <option value="pickup">Pickup</option>
//                                         <option value="ratePassed">Rate shared</option>
//                                         <option value="accepted">Accepted</option>
//                                         <option value="closed">Closed</option>
//                                         <option value="cancelled">Cancelled</option>
//                                         <option value="rejected">Rejected</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>Raised By</label>
//                                     <select name="raisedBy" value={filters.raisedBy} onChange={handleFilter} style={fInp}>
//                                         <option value="">All</option>
//                                         <option value="user">🌐 User</option>
//                                         <option value="admin">🔧 Admin</option>
//                                     </select>
//                                 </div>
//                             </div>
//                             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
//                                 <div>
//                                     <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>From Date</label>
//                                     <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilter} max={filters.toDate || todayStr} style={fInp} />
//                                 </div>
//                                 <div>
//                                     <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>To Date</label>
//                                     <input type="date" name="toDate" value={filters.toDate} onChange={handleFilter} min={filters.fromDate || undefined} max={todayStr} style={fInp} />
//                                 </div>
//                             </div>
//                             <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
//                                 <button onClick={clearFilters} style={{ flex: 1, padding: "11px", background: "royalblue", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer" }}>Clear Filters</button>
//                                 <button onClick={getAllEnquiries} style={{ flex: 1, padding: "11px", background: "royalblue", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "whitesmoke", cursor: "pointer" }}>🔄 Refresh</button>
//                             </div>
//                         </div>
//                     </div>

//                     <div id="eq-list-top" style={{ scrollMarginTop: "80px" }} />
//                     {/* ── MOBILE VIEW ── */}
//                     <div className="eq-mob">
//                         <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0", overflow: "hidden" }}>
//                             {enquiryLoading ? (
//                                 <div style={{ padding: "40px", textAlign: "center" }}>
//                                     <div style={{ width: "28px", height: "28px", border: "3px solid #e2e8f0", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
//                                     <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</p>
//                                 </div>
//                             ) : filtered.length === 0 ? (
//                                 <div style={{ padding: "40px", textAlign: "center" }}>
//                                     <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
//                                     <p style={{ color: "#94a3b8", fontSize: "14px" }}>No enquiries found</p>
//                                 </div>
//                             ) : filtered.map((e, i) => {
//                                 const sc = statusConfig[stageOf(e)] || statusConfig.pending;
//                                 const isDone = e.status !== "pending";
//                                 const isEditBlocked = e.status === "rejected";
//                                 const isExp = expandedId === e._id;
//                                 const total = (e.adults || 0) + (e.children || 0) + (e.infants || 0);
//                                 const isRatePassedLoading = loadingId === e._id + "_ratePassed";
//                                 return (
//                                     <div key={e._id} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
//                                         <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: isExp ? "#f8fafc" : stageOf(e) === "accepted" ? "#f0fdf4" : "#fff" }}
//                                             onClick={() => setExpandedId(isExp ? null : e._id)}>
//                                             <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
//                                                 <span style={{ minWidth: "22px", height: "22px", borderRadius: "6px", background: "#e2e8f0", color: "#475569", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
//                                                 <div style={{ minWidth: 0, flex: 1 }}>
//                                                     <p style={{ fontWeight: 600, color: "#0f172a", margin: 0, fontSize: "14px", wordBreak: "break-word", lineHeight: "1.3" }}>{e.fullName}</p>
//                                                     <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{e.destination}</p>
//                                                     {stageWho(e) && <p style={{ fontSize: "11px", color: sc.color, margin: "2px 0 0" }}>{sc.label} by <b>{stageWho(e)}</b></p>}
//                                                     {(e.zone?.name || ownerOfEnq(e)) && (
//                                                         <p style={{ fontSize: "11px", margin: "2px 0 0", color: "#0C447C" }}>
//                                                             {e.zone?.name ? `🗺 ${e.zone.name}` : ""}{e.zone?.name && ownerOfEnq(e) ? " · " : ""}
//                                                             {ownerOfEnq(e) ? <span style={{ color: "#0E7490" }}>{e.delegatedCount > 0 ? "↪" : "👤"} {ownerText(ownerOfEnq(e))}</span> : null}
//                                                         </p>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                             <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
//                                                 {e.status === "pending" && e.isRatePassed ? (
//                                                     <span style={{ background: "#FEF3C7", color: "#92400E", padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>Rate Shared</span>
//                                                 ) : (
//                                                     <span style={{ background: sc.bg, color: sc.color, padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>{sc.label}</span>
//                                                 )}
//                                                 <span style={{ transform: isExp ? "rotate(90deg)" : "none", transition: "0.2s" }}>▶</span>
//                                             </div>
//                                         </div>

//                                         {isExp && (
//                                             <div style={{ padding: "16px", background: "#f8fafc" }}>
//                                                 {e.fitCode && (
//                                                     <div style={{ background: "#E6F1FB", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px" }}>
//                                                         <span style={{ fontSize: "13px", color: "#0C447C" }}>FIT Code: </span>
//                                                         <span style={{ fontSize: "15px", fontWeight: 800, color: "#0C447C" }}>{e.fitCode}</span>
//                                                     </div>
//                                                 )}
//                                                 {/* Contact */}
//                                                 <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
//                                                     <div style={{ fontSize: "13px", fontWeight: 700, color: "#0ea5e9", marginBottom: "10px" }}>Contact Details</div>
//                                                     <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>📞 {e.mobileNumber}</div>
//                                                     {e.email && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>✉ {e.email}</div>}
//                                                     {e.city && <div style={{ padding: "6px 0" }}>📍 {e.city}</div>}
//                                                 </div>
//                                                 {/* Trip */}
//                                                 <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
//                                                     <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669", marginBottom: "10px" }}>Trip Details</div>
//                                                     <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Destination:</strong> {e.destination}</div>
//                                                     <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Tour Type:</strong> {e.tourType}</div>
//                                                     <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Travel Date:</strong> {e.preferredTravelDate ? new Date(e.preferredTravelDate).toLocaleDateString("en-IN") : "—"}</div>
//                                                     {e.pickupDate && (
//                                                         <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>
//                                                             <strong style={{ color: "#dc2626" }}>🚐 Pickup:</strong>
//                                                             <span style={{ color: "#dc2626", fontWeight: 600, marginLeft: "6px" }}>
//                                                                 {new Date(e.pickupDate).toLocaleDateString("en-IN")}{e.pickupTime ? ` ${e.pickupTime}` : ""}
//                                                             </span>
//                                                         </div>
//                                                     )}
//                                                     <div style={{ padding: "6px 0" }}><strong>Duration:</strong> {e.numberOfDays || 0}D / {e.numberOfNights || 0}N</div>
//                                                 </div>
//                                                 {/* Travellers */}
//                                                 <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
//                                                     <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "10px" }}>Travellers ({total} pax)</div>
//                                                     <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>Adults: {e.adults || 0}</div>
//                                                     {(e.children || 0) > 0 && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>Children: {e.children}</div>}
//                                                     {(e.infants || 0) > 0 && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>Infants: {e.infants}</div>}
//                                                     {e.source && <div style={{ padding: "6px 0" }}>Source: {e.source}</div>}
//                                                 </div>
//                                                 {/* Acceptance Details */}
//                                                 {e.status === "accepted" && (
//                                                     <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
//                                                         <div style={{ fontSize: "13px", fontWeight: 700, color: "#3B6D11", marginBottom: "10px" }}>✅ Acceptance Details</div>
//                                                         {e.salesValue && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Sales Value:</strong> ₹{e.salesValue.toLocaleString("en-IN")}</div>}
//                                                         {e.pickupDate && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Pickup Date:</strong> {new Date(e.pickupDate).toLocaleDateString("en-IN")}</div>}
//                                                         {e.pickupTime && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Pickup Time:</strong> {e.pickupTime}</div>}
//                                                         {gvShareOk && e.gvShare && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>GV Share:</strong> Vinoth (GVEMP008) {gvShareText(e.gvShare.vinoth)} · Giridharan (GVEMP009) {gvShareText(e.gvShare.giridhar)}</div>}
//                                                         {e.dropDate && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Drop:</strong> {new Date(e.dropDate).toLocaleDateString("en-IN")}{e.dropTime ? ` ${e.dropTime}` : ""}{e.dropPlace ? ` · ${e.dropPlace}` : ""}</div>}
//                                                         {e.pickupPlace && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Pickup Place:</strong> {e.pickupPlace}</div>}
//                                                         {e.fitStates?.length > 0 && (
//                                                             <div style={{ marginTop: "10px" }}>
//                                                                 <div style={{ fontSize: "13px", marginBottom: "6px" }}>FIT States:</div>
//                                                                 <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
//                                                                     {e.fitStates.map((s, idx) => <span key={idx} style={{ background: "#E6F1FB", color: "#0C447C", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>{s}</span>)}
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 )}
//                                                 {/* Cancellation Details */}
//                                                 {e.isCancelled && (
//                                                     <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "1px solid #FECDD3", marginBottom: "12px" }}>
//                                                         <div style={{ fontSize: "13px", fontWeight: 700, color: "#9F1239", marginBottom: "10px" }}>🚫 Cancellation Details</div>
//                                                         {cancelRows(e).map(([k, v]) => (
//                                                             <div key={k} style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>{k}:</strong> {v}</div>
//                                                         ))}
//                                                     </div>
//                                                 )}
//                                                 {/* Zone + Forward history */}
//                                                 {zonesOfEnq(e).length > 0 && <div style={{ marginBottom: "12px" }}><EnquiryZones e={e} mobile /></div>}
//                                                 {e.delegations?.length > 0 && <div style={{ marginBottom: "12px" }}><ForwardHistory list={e.delegations} /></div>}
//                                                 {/* Activity — yaaru enna panna */}
//                                                 {activityOf(e).length > 0 && <div style={{ marginBottom: "12px" }}><ActivityList e={e} /></div>}
//                                                 {/* Special Requests */}
//                                                 {e.specialRequests && (
//                                                     <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "16px" }}>
//                                                         <div style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed", marginBottom: "8px" }}>Special Requests</div>
//                                                         <div style={{ fontStyle: "italic", color: "#475569" }}>"{e.specialRequests}"</div>
//                                                     </div>
//                                                 )}
//                                                 {/* Enquired info */}
//                                                 <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
//                                                     Enquired on: {new Date(e.createdAt).toLocaleDateString("en-IN")} {new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
//                                                     <span style={{ marginLeft: "8px", background: e.raisedBy === "admin" ? "#FFF7ED" : "#EDE9FE", color: e.raisedBy === "admin" ? "#9A3412" : "#5B21B6", padding: "2px 8px", borderRadius: "20px", fontSize: "11px" }}>
//                                                         {raisedByLabel(e)}
//                                                     </span>
//                                                 </div>
//                                                 {/* Action Buttons (Admin view-only la illa) */}
//                                                 {!viewOnly && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
//                                                     <button onClick={(ev) => { ev.stopPropagation(); if (!isEditBlocked) setEditModal({ open: true, data: e }); }}
//                                                         disabled={isEditBlocked}
//                                                         style={{ flex: 1, minWidth: "80px", padding: "12px", background: isEditBlocked ? "#f1f5f9" : "#EEF2FF", color: isEditBlocked ? "#cbd5e1" : "#4338CA", border: "none", borderRadius: "10px", fontWeight: 600, cursor: isEditBlocked ? "not-allowed" : "pointer" }}>
//                                                         ✎ Edit
//                                                     </button>
//                                                     {/* Pending → Pick up (login la irukkuravanga per la) */}
//                                                     {stageOf(e) === "pending" && (
//                                                         <button onClick={(ev) => { ev.stopPropagation(); openModal("pickup", e._id, e.fullName, e.fitCode || ""); }}
//                                                             style={{ flex: 1, minWidth: "100px", padding: "12px", background: "#E0F2FE", color: "#075985", border: "1px solid #BAE6FD", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
//                                                             ✋ Pick up
//                                                         </button>
//                                                     )}
//                                                     {/* Pickup → Rate Shared */}
//                                                     {stageOf(e) === "pickup" && (
//                                                         <button onClick={(ev) => { ev.stopPropagation(); openModal("ratePassed", e._id, e.fullName, e.fitCode || ""); }}
//                                                             style={{ flex: 1, minWidth: "120px", padding: "12px", background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
//                                                             💰 Rate Shared
//                                                         </button>
//                                                     )}
//                                                     {e.status === "pending" && e.isRatePassed && (
//                                                         <button onClick={(ev) => { ev.stopPropagation(); openModal("accept", e._id, e.fullName, e.fitCode || ""); }}
//                                                             style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#EAF3DE", color: "#3B6D11", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
//                                                             ✓ Accept
//                                                         </button>
//                                                     )}
//                                                     {/* Accepted (not yet closed) → Close button */}
//                                                     {stageOf(e) === "accepted" && (
//                                                         <button onClick={(ev) => { ev.stopPropagation(); openModal("close", e._id, e.fullName, e.fitCode || ""); }}
//                                                             style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#E2E8F0", color: "#334155", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
//                                                             🔒 Close
//                                                         </button>
//                                                     )}
//                                                     {/* Accepted → Cancel Trip (charge + reason) */}
//                                                     {stageOf(e) === "accepted" && (
//                                                         <button onClick={(ev) => { ev.stopPropagation(); openModal("cancel", e._id, e.fullName, e.fitCode || ""); }}
//                                                             style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#FFE4E6", color: "#9F1239", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
//                                                             🚫 Cancel
//                                                         </button>
//                                                     )}
//                                                     {/* Closed → Reopen (Accepted ku) */}
//                                                     {stageOf(e) === "closed" && (
//                                                         <button onClick={(ev) => { ev.stopPropagation(); openModal("reopenClosed", e._id, e.fullName, e.fitCode || ""); }}
//                                                             style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#E0E7FF", color: "#3730A3", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
//                                                             ↺ Reopen
//                                                         </button>
//                                                     )}
//                                                     {/* Forward — Closed / Cancelled thavira */}
//                                                     {canForward(e) && (
//                                                         <button onClick={(ev) => { ev.stopPropagation(); setForwarding(e); }}
//                                                             style={{ flex: 1, minWidth: "90px", padding: "12px", background: "#ECFEFF", color: "#0E7490", border: "1px solid #A5F3FC", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
//                                                             ↪ Forward
//                                                         </button>
//                                                     )}
//                                                     {/* Rejected → Reopen button (goes back to the stage before reject) */}
//                                                     {e.status === "rejected" ? (
//                                                         <button onClick={(ev) => { ev.stopPropagation(); openReopen(e); }}
//                                                             style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#E0E7FF", color: "#3730A3", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
//                                                             ↺ Reopen
//                                                         </button>
//                                                     ) : (
//                                                         <button onClick={(ev) => { ev.stopPropagation(); !isDone && openModal("reject", e._id, e.fullName, e.fitCode || ""); }} disabled={isDone}
//                                                             style={{ flex: 1, minWidth: "80px", padding: "12px", background: isDone ? "#f1f5f9" : "#FCEBEB", color: isDone ? "#cbd5e1" : "#A32D2D", border: "none", borderRadius: "10px", fontWeight: 600, cursor: isDone ? "not-allowed" : "pointer" }}>
//                                                             ✕ Reject
//                                                         </button>
//                                                     )}
//                                                 </div>}
//                                             </div>
//                                         )}
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                         <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", paddingTop: "8px" }}>
//                             Showing <strong>{filtered.length}</strong> of <strong>{tabList.length}</strong> enquiries
//                         </div>
//                     </div>

//                     {/* ── DESKTOP + TAB TABLE ── */}
//                     <div className="eq-desk" style={{ width: "100%" }}>
//                         <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
//                             <div style={{ display: "grid", gridTemplateColumns: col, background: "#e3effaff", borderBottom: "0.5px solid #e2e8f0" }}>
//                                 {headers.map((h) => (
//                                     <div key={h} style={{ padding: P, fontSize: "11px", fontWeight: 700, color: "#616975ff", letterSpacing: "0.04em", textTransform: h === "S.No" ? "none" : "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h}</div>
//                                 ))}
//                             </div>

//                             {enquiryLoading ? (
//                                 <div style={{ padding: "50px", textAlign: "center" }}>
//                                     <div style={{ width: "28px", height: "28px", border: "3px solid #e2e8f0", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
//                                     <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</p>
//                                 </div>
//                             ) : filtered.length === 0 ? (
//                                 <div style={{ padding: "50px", textAlign: "center" }}>
//                                     <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
//                                     <p style={{ color: "#94a3b8", fontSize: "14px" }}>No enquiries found</p>
//                                 </div>
//                             ) : filtered.map((e, i) => {
//                                 const sc = statusConfig[stageOf(e)] || statusConfig.pending;
//                                 const isDone = e.status !== "pending";
//                                 const isEditBlocked = e.status === "rejected";
//                                 const isExp = expandedId === e._id;
//                                 const total = (e.adults || 0) + (e.children || 0) + (e.infants || 0);
//                                 const isLoading = ["accept", "reject", "close", "reopen", "cancel", "pickup"].some((t) => loadingId === e._id + "_" + t);
//                                 const isRatePassedLoading = loadingId === e._id + "_ratePassed";
//                                 return (
//                                     <div key={e._id} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
//                                         <div style={{ display: "grid", gridTemplateColumns: col, alignItems: "center", background: isExp ? "#f8fafc" : stageOf(e) === "accepted" ? "#f0fdf4" : "#fff", transition: "background 0.1s", cursor: "pointer" }}
//                                             onMouseEnter={(ev) => { if (!isExp) ev.currentTarget.style.background = stageOf(e) === "accepted" ? "#f0fdf4" : "#f8fafc"; }}
//                                             onMouseLeave={(ev) => { if (!isExp) ev.currentTarget.style.background = stageOf(e) === "accepted" ? "#f0fdf4" : "#fff"; }}
//                                             onClick={() => setExpandedId(isExp ? null : e._id)}>

//                                             <div style={{ padding: P, display: "flex", alignItems: "center", gap: "4px" }}>
//                                                 <span style={{ fontSize: "9px", color: isExp ? "#2563eb" : "#cbd5e1", display: "inline-block", transform: isExp ? "rotate(90deg)" : "none", transition: "transform 0.2s", fontWeight: 700 }}>▶</span>
//                                                 <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>{i + 1}</span>
//                                             </div>
//                                             <div style={{ padding: P, overflow: "hidden" }}>
//                                                 <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.fullName}</div>
//                                                 <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📞 {e.mobileNumber}</div>
//                                             </div>
//                                             <div style={{ padding: P, overflow: "visible" }}>
//                                                 {e.fitCode
//                                                     ? <span style={{ background: "#E6F1FB", color: "#0C447C", padding: "3px 7px", borderRadius: "5px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.3px", whiteSpace: "nowrap", display: "inline-block" }}>{e.fitCode}</span>
//                                                     : <span style={{ color: "#cbd5e1", fontSize: "12px" }}>—</span>}
//                                             </div>
//                                             <div style={{ padding: P, overflow: "hidden" }}>
//                                                 <div style={{ fontSize: "13px", fontWeight: 600, color: "#711c66ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{destFmt(e.destination)}</div>
//                                                 <div style={{ fontSize: "11px", color: "#94a3b8" }}>{e.numberOfDays || 0}D/{e.numberOfNights || 0}N</div>
//                                             </div>
//                                             <div style={{ padding: P, overflow: "hidden" }}>
//                                                 <div style={{ fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>
//                                                     {e.preferredTravelDate ? new Date(e.preferredTravelDate).toLocaleDateString("en-IN") : "—"}
//                                                 </div>
//                                                 {e.pickupDate && (
//                                                     <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600, whiteSpace: "nowrap" }}>
//                                                         🚐 {new Date(e.pickupDate).toLocaleDateString("en-IN")}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <div style={{ padding: P, overflow: "hidden" }}>
//                                                 <div style={{ fontSize: "12px", color: "#475569", fontWeight: 500, whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleDateString("en-IN")}</div>
//                                                 <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
//                                             </div>
//                                             <div style={{ padding: P, overflow: "hidden" }}>
//                                                 <span style={{ background: e.raisedBy === "admin" ? "#FFF7ED" : "#EDE9FE", color: e.raisedBy === "admin" ? "#9A3412" : "#5B21B6", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "middle" }} title={raisedByLabel(e)}>
//                                                     {raisedByLabel(e)}
//                                                 </span>
//                                             </div>
//                                             <div style={{ padding: P, overflow: "hidden" }}>
//                                                 {e.status === "pending" && e.isRatePassed ? (
//                                                     <span style={{ background: "#FEF3C7", color: "#92400E", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
//                                                         <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#EAB308", display: "inline-block", flexShrink: 0 }} /> Rate Shared
//                                                     </span>
//                                                 ) : (
//                                                     <span style={{ background: sc.bg, color: sc.color, padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
//                                                         <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dot, display: "inline-block", flexShrink: 0 }} />{sc.label}
//                                                     </span>
//                                                 )}
//                                                 {(() => {
//                                                     // Status keezha 3 chinna lines: yaar panna · zones · (forward / vera aal kitta na) yaar kitta
//                                                     const who = stageWho(e);
//                                                     const zs = zonesOfEnq(e);
//                                                     const own = ownerOfEnq(e);
//                                                     const ownName = ownerText(own);
//                                                     const showOwner = own && (e.delegatedCount > 0 || !who || String(who).toLowerCase() !== String(ownName).toLowerCase());
//                                                     const line = { fontSize: "10.5px", marginTop: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.35 };
//                                                     return (
//                                                         <>
//                                                             {who && (
//                                                                 <div title={`${stageLabels[stageOf(e)]} by ${who}`} style={{ ...line, color: "#64748b" }}>
//                                                                     by <b style={{ color: "#334155", fontWeight: 600 }}>{who}</b>
//                                                                 </div>
//                                                             )}
//                                                             {zs.length > 0 && (
//                                                                 <div title={zs.map((z) => `${z.name}: ${zoneSummary(z)}`).join("\n")} style={{ ...line, color: "#0C447C", fontWeight: 600 }}>
//                                                                     🗺 {zs.map((z) => z.name).join(" · ")}
//                                                                 </div>
//                                                             )}
//                                                             {showOwner && (
//                                                                 <div title={`Only ${ownName} can see and work on this${e.delegatedCount > 0 ? " (forwarded)" : ""}`} style={{ ...line, color: "#0E7490", fontWeight: 600 }}>
//                                                                     {e.delegatedCount > 0 ? "↪ with" : "👤 with"} {ownName}
//                                                                 </div>
//                                                             )}
//                                                         </>
//                                                     );
//                                                 })()}
//                                             </div>
//                                             <div style={{ padding: P }}>
//                                                 {viewOnly ? (
//                                                     <span style={{ fontSize: "11px", color: "#94a3b8" }}>👁 View</span>
//                                                 ) : isLoading || isRatePassedLoading ? (
//                                                     <div style={{ width: "14px", height: "14px", border: "2px solid #e2e8f0", borderTop: "2px solid #2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
//                                                 ) : (
//                                                     <div style={{ display: "flex", gap: "3px" }}>
//                                                         <button onClick={(ev) => { ev.stopPropagation(); if (!isEditBlocked) setEditModal({ open: true, data: e }); }}
//                                                             disabled={isEditBlocked} title="Edit"
//                                                             style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: isEditBlocked ? "#f1f5f9" : "#EEF2FF", color: isEditBlocked ? "#cbd5e1" : "#4338CA", cursor: isEditBlocked ? "not-allowed" : "pointer", opacity: isEditBlocked ? 0.4 : 1, fontSize: "13px" }}>✎</button>
//                                                         {/* Pending → Pick up */}
//                                                         {stageOf(e) === "pending" && (
//                                                             <button onClick={(ev) => { ev.stopPropagation(); openModal("pickup", e._id, e.fullName, e.fitCode || ""); }} title="Pick up"
//                                                                 style={{ width: "26px", height: "26px", borderRadius: "6px", border: "1px solid #BAE6FD", background: "#E0F2FE", color: "#075985", cursor: "pointer", fontSize: "12px" }}>✋</button>
//                                                         )}
//                                                         {/* Pickup → Rate Shared */}
//                                                         {stageOf(e) === "pickup" && (
//                                                             <button onClick={(ev) => { ev.stopPropagation(); openModal("ratePassed", e._id, e.fullName, e.fitCode || ""); }} title="Mark Rate Shared"
//                                                                 style={{ width: "26px", height: "26px", borderRadius: "6px", border: "1px solid #FDE68A", background: "#FFFBEB", color: "#92400E", cursor: "pointer", fontSize: "12px" }}>💰</button>
//                                                         )}
//                                                         {e.status === "pending" && e.isRatePassed && (
//                                                             <button onClick={(ev) => { ev.stopPropagation(); openModal("accept", e._id, e.fullName, e.fitCode || ""); }} title="Accept"
//                                                                 style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: "#EAF3DE", color: "#3B6D11", cursor: "pointer", fontSize: "12px" }}>✓</button>
//                                                         )}
//                                                         {/* Accepted (not yet closed) → Close button */}
//                                                         {stageOf(e) === "accepted" && (
//                                                             <button onClick={(ev) => { ev.stopPropagation(); openModal("close", e._id, e.fullName, e.fitCode || ""); }} title="Close Enquiry"
//                                                                 style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: "#E2E8F0", color: "#334155", cursor: "pointer", fontSize: "12px" }}>🔒</button>
//                                                         )}
//                                                         {/* Accepted → Cancel Trip (charge + reason) */}
//                                                         {stageOf(e) === "accepted" && (
//                                                             <button onClick={(ev) => { ev.stopPropagation(); openModal("cancel", e._id, e.fullName, e.fitCode || ""); }} title="Cancel Trip"
//                                                                 style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: "#FFE4E6", color: "#9F1239", cursor: "pointer", fontSize: "12px" }}>🚫</button>
//                                                         )}
//                                                         {/* Closed → Reopen (Accepted ku) */}
//                                                         {stageOf(e) === "closed" && (
//                                                             <button onClick={(ev) => { ev.stopPropagation(); openModal("reopenClosed", e._id, e.fullName, e.fitCode || ""); }} title="Reopen → Accepted"
//                                                                 style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: "#E0E7FF", color: "#3730A3", cursor: "pointer", fontSize: "13px" }}>↺</button>
//                                                         )}
//                                                         {/* Forward — Closed / Cancelled thavira */}
//                                                         {canForward(e) && (
//                                                             <button onClick={(ev) => { ev.stopPropagation(); setForwarding(e); }} title="Forward"
//                                                                 style={{ width: "26px", height: "26px", borderRadius: "6px", border: "1px solid #A5F3FC", background: "#ECFEFF", color: "#0E7490", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>↪</button>
//                                                         )}
//                                                         {/* Rejected → Reopen button (goes back to the stage before reject) */}
//                                                         {e.status === "rejected" ? (
//                                                             <button onClick={(ev) => { ev.stopPropagation(); openReopen(e); }} title={`Reopen → ${stageLabels[restoreStageOf(e)]}`}
//                                                                 style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: "#E0E7FF", color: "#3730A3", cursor: "pointer", fontSize: "13px", fontWeight: 700 }}>↺</button>
//                                                         ) : (
//                                                             <button onClick={(ev) => { ev.stopPropagation(); !isDone && openModal("reject", e._id, e.fullName, e.fitCode || ""); }} disabled={isDone} title="Reject"
//                                                                 style={{ width: "26px", height: "26px", borderRadius: "6px", border: "none", background: isDone ? "#f1f5f9" : "#FCEBEB", color: isDone ? "#cbd5e1" : "#A32D2D", cursor: isDone ? "not-allowed" : "pointer", opacity: isDone ? 0.4 : 1, fontSize: "12px" }}>✕</button>
//                                                         )}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         {/* Expanded Row */}
//                                         {isExp && (
//                                             <div style={{ background: "#f8fafc", borderTop: "0.5px solid #e2e8f0", padding: "12px 24px" }}>
//                                                 <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
//                                                     {[
//                                                         {
//                                                             head: "📞 Contact", color: "#0ea5e9",
//                                                             rows: [["Full name", e.fullName], ["Mobile", e.mobileNumber], ["Email", e.email || "—"], ["City", e.city || "—"], ["FIT Code", e.fitCode || "—"]],
//                                                         },
//                                                         {
//                                                             head: "✈️ Trip", color: "#059669",
//                                                             rows: [["Destination", destFmt(e.destination)], ["Tour type", e.tourType], ["Travel date", e.preferredTravelDate ? new Date(e.preferredTravelDate).toLocaleDateString("en-IN") : "—"], ["Duration", `${e.numberOfDays || 0}D/${e.numberOfNights || 0}N`], ["Pax", `${total}(${e.adults || 0}A ${e.children || 0}C ${e.infants || 0}I)`]],
//                                                             pickupDate: e.pickupDate,
//                                                             pickupTime: e.pickupTime,
//                                                         },
//                                                         {
//                                                             head: e.status === "accepted" ? (e.isCancelled ? "🚫 Acceptance (Cancelled)" : e.isClosed ? "🔒 Acceptance (Closed)" : "✅ Acceptance") : "👥 More Info", color: e.isCancelled ? "#9F1239" : e.status === "accepted" ? "#3B6D11" : "#7c3aed",
//                                                             rows: e.status === "accepted"
//                                                                 ? [["Sales Value", e.salesValue ? `₹${e.salesValue.toLocaleString("en-IN")}` : "—"], ["Pickup Date", e.pickupDate ? new Date(e.pickupDate).toLocaleDateString("en-IN") : "—"], ["Pickup Time", e.pickupTime || "—"], ["Pickup Place", e.pickupPlace || "—"], ["Drop", e.dropDate ? `${new Date(e.dropDate).toLocaleDateString("en-IN")}${e.dropTime ? ` ${e.dropTime}` : ""}` : "—"], ["Drop Place", e.dropPlace || "—"], ...(gvShareOk && e.gvShare ? [["GV Share · Vinoth (GVEMP008)", gvShareText(e.gvShare.vinoth)], ["GV Share · Giridharan (GVEMP009)", gvShareText(e.gvShare.giridhar)]] : []), ["Source", e.source || "—"], ["Raised By", raisedByLabel(e)], ...(e.isClosed ? [["Closed On", e.closedAt ? `${new Date(e.closedAt).toLocaleDateString("en-IN")}${e.autoClosed ? " (auto)" : ""}` : "—"]] : []), ...(e.isCancelled ? cancelRows(e) : [])]
//                                                                 : [...(e.status === "rejected" ? [["Reopens To", stageLabels[restoreStageOf(e)]]] : []), ["Rate Shared", e.isRatePassed ? "💰 Yes" : "No"], ["Adults", `${e.adults || 0}`], ["Children", `${e.children || 0}`], ["Infants", `${e.infants || 0}`], ["Source", e.source || "—"], ["Raised By", raisedByLabel(e)]],
//                                                             extra: e.specialRequests,
//                                                             fitStates: e.status === "accepted" ? e.fitStates : null,
//                                                         },
//                                                     ].map((card) => (
//                                                         <div key={card.head} style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", border: "0.5px solid #e2e8f0" }}>
//                                                             <div style={{ fontSize: "11px", fontWeight: 700, color: card.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{card.head}</div>
//                                                             {card.rows.map(([k, v]) => (
//                                                                 <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f8fafc" }}>
//                                                                     <span style={{ fontSize: "12px", color: "#94a3b8" }}>{k}</span>
//                                                                     <span style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", textAlign: "right", maxWidth: "60%", wordBreak: "break-word" }}>{v}</span>
//                                                                 </div>
//                                                             ))}
//                                                             {card.head.includes("Trip") && card.pickupDate && (
//                                                                 <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f8fafc" }}>
//                                                                     <span style={{ fontSize: "12px", color: "#94a3b8" }}>Pickup date</span>
//                                                                     <span style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626" }}>
//                                                                         🚐 {new Date(card.pickupDate).toLocaleDateString("en-IN")}{card.pickupTime ? ` ${card.pickupTime}` : ""}
//                                                                     </span>
//                                                                 </div>
//                                                             )}
//                                                             {card.fitStates?.length > 0 && (
//                                                                 <div style={{ marginTop: "6px" }}>
//                                                                     <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "5px" }}>FIT STATES</div>
//                                                                     <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
//                                                                         {card.fitStates.map(s => <span key={s} style={{ background: "#E6F1FB", color: "#0C447C", padding: "3px 9px", borderRadius: "10px", fontSize: "11px", fontWeight: 500 }}>{s}</span>)}
//                                                                     </div>
//                                                                 </div>
//                                                             )}
//                                                             {card.extra && (
//                                                                 <div style={{ marginTop: "6px", background: "#f8fafc", borderRadius: "6px", padding: "6px 8px" }}>
//                                                                     <div style={{ fontSize: "10px", color: "#eb3d09ff", marginBottom: "2px" }}>Special requests</div>
//                                                                     <div style={{ fontSize: "11px", color: "#885dabff", fontStyle: "italic" }}>"{card.extra}"</div>
//                                                                 </div>
//                                                             )}
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                                 {/* Zone + Forward history */}
//                                                 {(zonesOfEnq(e).length > 0 || e.delegations?.length > 0) && (
//                                                     <div style={{ display: "grid", gridTemplateColumns: zonesOfEnq(e).length && e.delegations?.length ? "1fr 1fr" : "1fr", gap: "10px", marginTop: "10px" }}>
//                                                         <EnquiryZones e={e} />
//                                                         <ForwardHistory list={e.delegations} />
//                                                     </div>
//                                                 )}
//                                                 {/* Activity — yaaru enna panna */}
//                                                 {activityOf(e).length > 0 && <div style={{ marginTop: "10px" }}><ActivityList e={e} /></div>}
//                                             </div>
//                                         )}
//                                     </div>
//                                 );
//                             })}
//                             <div style={{ padding: "8px 12px", borderTop: "0.5px solid #f1f5f9", fontSize: "11px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
//                                 <span>Showing <strong>{filtered.length}</strong> of <strong>{tabList.length}</strong> enquiries</span>
//                                 <span>▶ click row to expand</span>
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default TripEnquiries;



import { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { TourContext } from "../../context/TourContext";
import { TourAdminContext } from "../../context/TourAdminContext";
import { cancelWho } from "../../components/CancelWho";
import useStaffSelf from "../../staff/useStaffSelf"; // staff site la login aana staff (Tour admin la null)
import { StaffOptions, teamsFromStaff, ToModeSwitch } from "../../staff/ticketWho";
import LeaveGuard from "../../components/LeaveGuard";

// India — 28 states + 8 union territories (Zone create la)
const INDIA_REGIONS = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];
const UT_SET = new Set(INDIA_REGIONS.slice(28));
// International zones — continent wise countries (India zone la states / districts thaniyaa)
const WORLD_COUNTRIES_BY_CONTINENT = { "Asia": ["Afghanistan", "Armenia", "Azerbaijan", "Bahrain", "Bangladesh", "Bhutan", "Brunei", "Cambodia", "China", "Cyprus", "Georgia", "Indonesia", "Iran", "Iraq", "Israel", "Japan", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Malaysia", "Maldives", "Mongolia", "Myanmar", "Nepal", "North Korea", "Oman", "Pakistan", "Palestine", "Philippines", "Qatar", "Saudi Arabia", "Singapore", "South Korea", "Sri Lanka", "Syria", "Taiwan", "Tajikistan", "Thailand", "Timor-Leste", "Turkey", "Turkmenistan", "United Arab Emirates", "Uzbekistan", "Vietnam", "Yemen"], "Europe": ["Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom", "Vatican City"], "Africa": ["Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cameroon", "Cape Verde", "Central African Republic", "Chad", "Comoros", "Congo", "DR Congo", "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"], "North America": ["Antigua and Barbuda", "Bahamas", "Barbados", "Belize", "Canada", "Costa Rica", "Cuba", "Dominica", "Dominican Republic", "El Salvador", "Grenada", "Guatemala", "Haiti", "Honduras", "Jamaica", "Mexico", "Nicaragua", "Panama", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Trinidad and Tobago", "United States"], "South America": ["Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Ecuador", "Guyana", "Paraguay", "Peru", "Suriname", "Uruguay", "Venezuela"], "Oceania": ["Australia", "Fiji", "Kiribati", "Marshall Islands", "Micronesia", "Nauru", "New Zealand", "Palau", "Papua New Guinea", "Samoa", "Solomon Islands", "Tonga", "Tuvalu", "Vanuatu"] };
// Country phone code — kaattradhukku mattum (save aagaradhu country per thaan)
const COUNTRY_CODES = { "Afghanistan": "93", "Armenia": "374", "Azerbaijan": "994", "Bahrain": "973", "Bangladesh": "880", "Bhutan": "975", "Brunei": "673", "Cambodia": "855", "China": "86", "Cyprus": "357", "Georgia": "995", "Indonesia": "62", "Iran": "98", "Iraq": "964", "Israel": "972", "Japan": "81", "Jordan": "962", "Kazakhstan": "7", "Kuwait": "965", "Kyrgyzstan": "996", "Laos": "856", "Lebanon": "961", "Malaysia": "60", "Maldives": "960", "Mongolia": "976", "Myanmar": "95", "Nepal": "977", "North Korea": "850", "Oman": "968", "Pakistan": "92", "Palestine": "970", "Philippines": "63", "Qatar": "974", "Saudi Arabia": "966", "Singapore": "65", "South Korea": "82", "Sri Lanka": "94", "Syria": "963", "Taiwan": "886", "Tajikistan": "992", "Thailand": "66", "Timor-Leste": "670", "Turkey": "90", "Turkmenistan": "993", "United Arab Emirates": "971", "Uzbekistan": "998", "Vietnam": "84", "Yemen": "967", "Albania": "355", "Andorra": "376", "Austria": "43", "Belarus": "375", "Belgium": "32", "Bosnia and Herzegovina": "387", "Bulgaria": "359", "Croatia": "385", "Czech Republic": "420", "Denmark": "45", "Estonia": "372", "Finland": "358", "France": "33", "Germany": "49", "Greece": "30", "Hungary": "36", "Iceland": "354", "Ireland": "353", "Italy": "39", "Kosovo": "383", "Latvia": "371", "Liechtenstein": "423", "Lithuania": "370", "Luxembourg": "352", "Malta": "356", "Moldova": "373", "Monaco": "377", "Montenegro": "382", "Netherlands": "31", "North Macedonia": "389", "Norway": "47", "Poland": "48", "Portugal": "351", "Romania": "40", "Russia": "7", "San Marino": "378", "Serbia": "381", "Slovakia": "421", "Slovenia": "386", "Spain": "34", "Sweden": "46", "Switzerland": "41", "Ukraine": "380", "United Kingdom": "44", "Vatican City": "379", "Algeria": "213", "Angola": "244", "Benin": "229", "Botswana": "267", "Burkina Faso": "226", "Burundi": "257", "Cameroon": "237", "Cape Verde": "238", "Central African Republic": "236", "Chad": "235", "Comoros": "269", "Congo": "242", "DR Congo": "243", "Djibouti": "253", "Egypt": "20", "Equatorial Guinea": "240", "Eritrea": "291", "Eswatini": "268", "Ethiopia": "251", "Gabon": "241", "Gambia": "220", "Ghana": "233", "Guinea": "224", "Guinea-Bissau": "245", "Ivory Coast": "225", "Kenya": "254", "Lesotho": "266", "Liberia": "231", "Libya": "218", "Madagascar": "261", "Malawi": "265", "Mali": "223", "Mauritania": "222", "Mauritius": "230", "Morocco": "212", "Mozambique": "258", "Namibia": "264", "Niger": "227", "Nigeria": "234", "Rwanda": "250", "Sao Tome and Principe": "239", "Senegal": "221", "Seychelles": "248", "Sierra Leone": "232", "Somalia": "252", "South Africa": "27", "South Sudan": "211", "Sudan": "249", "Tanzania": "255", "Togo": "228", "Tunisia": "216", "Uganda": "256", "Zambia": "260", "Zimbabwe": "263", "Antigua and Barbuda": "1-268", "Bahamas": "1-242", "Barbados": "1-246", "Belize": "501", "Canada": "1", "Costa Rica": "506", "Cuba": "53", "Dominica": "1-767", "Dominican Republic": "1-809", "El Salvador": "503", "Grenada": "1-473", "Guatemala": "502", "Haiti": "509", "Honduras": "504", "Jamaica": "1-876", "Mexico": "52", "Nicaragua": "505", "Panama": "507", "Saint Kitts and Nevis": "1-869", "Saint Lucia": "1-758", "Saint Vincent and the Grenadines": "1-784", "Trinidad and Tobago": "1-868", "United States": "1", "Argentina": "54", "Bolivia": "591", "Brazil": "55", "Chile": "56", "Colombia": "57", "Ecuador": "593", "Guyana": "592", "Paraguay": "595", "Peru": "51", "Suriname": "597", "Uruguay": "598", "Venezuela": "58", "Australia": "61", "Fiji": "679", "Kiribati": "686", "Marshall Islands": "692", "Micronesia": "691", "Nauru": "674", "New Zealand": "64", "Palau": "680", "Papua New Guinea": "675", "Samoa": "685", "Solomon Islands": "677", "Tonga": "676", "Tuvalu": "688", "Vanuatu": "678" };
const placeLabel = (s) => (COUNTRY_CODES[s] ? `${s} (+${COUNTRY_CODES[s]})` : s);
const COUNTRY_SET = new Set(Object.values(WORLD_COUNTRIES_BY_CONTINENT).flat());
// Zone la ellaam countries na International zone
const zoneCountLabel = (z) => {
    const list = z?.states || [];
    const nc = list.filter((s) => COUNTRY_SET.has(s)).length;
    const ns = list.length - nc;
    const parts = [];
    if (ns) parts.push(`${ns} state${ns === 1 ? "" : "s"}`);
    if (nc) parts.push(`🌍 ${nc} ${nc === 1 ? "country" : "countries"}`);
    return parts.join(" · ");
};
const isIntlZone = (z) => (z?.states || []).length > 0 && z.states.every((s) => COUNTRY_SET.has(s));
// State → districts (india-states-districts npm data). Zone la state ku specific districts select panna.
const INDIA_DISTRICTS = { "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"], "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"], "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"], "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"], "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"], "Goa": ["North Goa", "South Goa"], "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"], "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"], "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"], "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"], "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"], "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"], "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Niwari", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"], "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"], "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"], "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"], "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"], "Nagaland": ["Chumukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Noklak", "Peren", "Phek", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"], "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Debagarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"], "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"], "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"], "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"], "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"], "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"], "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"], "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"], "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"], "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"], "Andaman and Nicobar Islands": ["Nicobar", "North and Middle Andaman", "South Andaman"], "Chandigarh": ["Chandigarh"], "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"], "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"], "Jammu and Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"], "Ladakh": ["Kargil", "Leh"], "Lakshadweep": ["Lakshadweep"], "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"] };
// Zone states text: "Tamil Nadu (Chennai, Madurai), Kerala"
const zoneStateLabel = (z, st) => {
    const ds = (z?.districts || {})[st];
    return ds?.length ? `${st} (${ds.join(", ")})` : placeLabel(st);
};
const zoneSummary = (z) => (z?.states || []).map((st) => zoneStateLabel(z, st)).join(", ");
// Enquiry la select panna zones — thani thaniyaa (pazhaya single zone um)
const zonesOfEnq = (e) => (e?.zone?.list?.length ? e.zone.list : e?.zone?.name ? [e.zone] : []);
// Expanded view: ovvoru zone um thani card
const EnquiryZones = ({ e, mobile = false }) => {
    const list = zonesOfEnq(e);
    if (!list.length) return null;
    return (
        <div style={{ background: "#fff", borderRadius: "10px", padding: mobile ? "14px" : "12px 14px", border: "0.5px solid #e2e8f0" }}>
            <div style={{ fontSize: mobile ? "13px" : "11px", fontWeight: 700, color: "#0C447C", textTransform: mobile ? "none" : "uppercase", letterSpacing: mobile ? 0 : "0.05em", marginBottom: "8px" }}>🗺 Zones ({list.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {list.map((z) => (
                    <div key={String(z.zoneId || z.name)}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#0C447C", marginBottom: "4px" }}>{z.name}</div>
                        <ZoneStateChips z={z} />
                    </div>
                ))}
            </div>
        </div>
    );
};
const ZONE_INDIA = { accent: "#2E7D32", soft: "#E8F5E9", bg: "#F6FBF6", name: "#1B4D20", head: "#4338CA" };
const ZONE_INTL = { accent: "#2563EB", soft: "#DBEAFE", bg: "#F5F8FF", name: "#1E3A8A", head: "#2E7D32" };
const ZoneStateChips = ({ z, size = 11 }) => {
    const [open, setOpen] = useState({});
    const list = z?.states || [];
    const india = list.filter((st) => !COUNTRY_SET.has(st));
    const intl = list.filter((st) => COUNTRY_SET.has(st));
    const block = (c) => ({ borderLeft: `3px solid ${c.accent}`, background: c.bg, borderRadius: "0 8px 8px 0", padding: "6px 10px" });
    const head = (label, c) => (
        <div style={{ fontSize: `${size - 1}px`, fontWeight: 700, color: c.head, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>{label}</div>
    );
    const name = (c) => ({ fontSize: `${size + 1}px`, fontWeight: 800, color: c.name, textTransform: "uppercase", letterSpacing: "0.02em" });
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {india.length > 0 && (
                <div style={block(ZONE_INDIA)}>
                    {head(`India · ${india.length}`, ZONE_INDIA)}
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {india.map((st) => {
                            const ds = (z?.districts || {})[st] || [];
                            const isOpen = !!open[st];
                            return (
                                <div key={st}>
                                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                                        <span style={name(ZONE_INDIA)}>{st}</span>
                                        {ds.length > 0 ? (
                                            <button type="button" aria-expanded={isOpen}
                                                onClick={(ev) => { ev.stopPropagation(); setOpen((o) => ({ ...o, [st]: !o[st] })); }}
                                                onKeyDown={(ev) => ev.stopPropagation()}
                                                style={{ border: "none", background: ZONE_INDIA.soft, color: "#8B3A0F", borderRadius: "999px", padding: "1px 8px", fontSize: `${size - 1}px`, fontWeight: 600, cursor: "pointer" }}>
                                                {isOpen ? "▾" : "▸"} {ds.length} district{ds.length === 1 ? "" : "s"}
                                            </button>
                                        ) : null}
                                    </div>
                                    {isOpen && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                                            {ds.map((d) => (
                                                <span key={d} style={{ background: "#fff", color: "#C62828", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "1px 7px", fontSize: `${size}px`, fontWeight: 500 }}>{d}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            {intl.length > 0 && (
                <div style={block(ZONE_INTL)}>
                    {head(`International · ${intl.length}`, ZONE_INTL)}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
                        {intl.map((c) => (
                            <span key={c} style={name(ZONE_INTL)}>
                                {c}{COUNTRY_CODES[c] && <span style={{ fontWeight: 500, color: "#94A3B8", textTransform: "none" }}> +{COUNTRY_CODES[c]}</span>}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const gvShareText = (v) => (v === null || v === undefined || v === "" ? "—" : `₹${Number(v).toLocaleString("en-IN")}`);
const stageOfEnq = (e) => {
    if (e.status === "pending") return e.isRatePassed ? "ratePassed" : e.isPickedUp ? "pickup" : "pending";
    if (e.status === "accepted") return e.isCancelled ? "cancelled" : e.isClosed ? "closed" : "accepted";
    return e.status;
};
// Ippo yaar kitta irukku (owner) — pazhaya enquiries la pickedUpBy
const ownerOfEnq = (e) => e?.owner || (e?.isPickedUp && e?.pickedUpBy ? e.pickedUpBy : null);
const ownerText = (o) => !o ? "" : o.type === "team" ? `${o.name} team` : o.type === "touradmin" ? "Tour admin" : o.type === "admin" ? "Admin" : (o.name || "");

// ─────────────────────────────────────────────
// ZONES — states select panni "Zone 1", "Zone 2" … (oru state oru zone la mattum)
// ─────────────────────────────────────────────
const zoneWhen = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
const ZonesPanel = ({ zones, reload, api, readOnly = false }) => {
    const [mode, setMode] = useState("india"); // "india" | "intl"
    const [picked, setPicked] = useState([]);
    const [dists, setDists] = useState({}); // { state: [districts] } — [] na full state
    const [editId, setEditId] = useState(null);
    const [busy, setBusy] = useState(false);
    const [q, setQ] = useState("");
    const toggle = (st) => setPicked((p) => (p.includes(st) ? p.filter((x) => x !== st) : [...p, st]));
    const toggleDist = (st, d) => setDists((m) => {
        const cur = m[st] || [];
        return { ...m, [st]: cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d] };
    });
    const startEdit = (z) => { setMode(isIntlZone(z) ? "intl" : "india"); setEditId(z._id); setPicked(z.states || []); setDists(z.districts || {}); setQ(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const reset = () => { setEditId(null); setPicked([]); setDists({}); setQ(""); };
    const intl = mode === "intl";
    const unit = intl ? "country" : "state";
    const units = intl ? "countries" : "states";
    const switchMode = (m) => { if (m === mode) return; setMode(m); setQ(""); }; // select pannadhu apdiye irukkum (India + countries serthu)
    const missingDist = [];
    const save = async () => {
        if (!picked.length) return toast.error("Select at least one state or country");
        if (missingDist.length) return toast.error(`Select districts for ${missingDist.join(", ")}`);
        setBusy(true);
        try {
            // Select panna states oda districts mattum anuppurom
            const d = Object.fromEntries(picked.filter((st) => !COUNTRY_SET.has(st)).map((st) => [st, dists[st] || []]).filter(([, v]) => v.length));
            const res = editId ? await api.updateZone(editId, picked, d) : await api.createZone(picked, d);
            toast.success(res.message);
            reset();
            await reload();
        } catch (err) { toast.error(err.message); } finally { setBusy(false); }
    };
    const remove = async (z) => {
        if (!window.confirm(`Delete ${z.name}? Enquiries already picked up with this zone keep it.`)) return;
        try { const res = await api.deleteZone(z._id); toast.success(res.message); if (editId === z._id) reset(); await reload(); }
        catch (err) { toast.error(err.message); }
    };
    const shown = INDIA_REGIONS.filter((st) => !q || st.toLowerCase().includes(q.toLowerCase()));
    const nextName = `Zone ${(zones.reduce((m, z) => Math.max(m, z.seq || 0), 0)) + 1}`;
    const chip = (st) => {
        const on = picked.includes(st);
        return (
            <button key={st} type="button" onClick={() => toggle(st)} aria-pressed={on} title={st}
                style={{
                    padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", cursor: "pointer",
                    border: on ? "1.5px solid #0C447C" : "1px solid #e2e8f0", background: on ? "#0C447C" : "#fff", color: on ? "#fff" : "#334155"
                }}>
                {on ? "✓ " : ""}{placeLabel(st)}
            </button>
        );
    };
    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <LeaveGuard
                when={!readOnly && !busy && (picked.length > 0 || !!editId)}
                title="Unsaved Zone"
                message={
                    <>
                        You have selected states / countries for a zone but not saved it yet.
                        <br />
                        Leaving this page will lose the selection.
                        <br />
                        Are you sure you want to leave?
                    </>
                }
            />
            {!readOnly && <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "14px", padding: "18px", marginBottom: "16px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>{editId ? `Edit ${zones.find((z) => z._id === editId)?.name || "zone"}` : `Create ${nextName}`}</h2>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                            {intl
                                ? "Search and select the countries. You can also add Indian states from the India tab."
                                : "Select the states. Districts are optional. A state can be in more than one zone."}
                        </p>
                    </div>
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={intl ? "Search country" : "Search state"} style={{ border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "7px 10px", fontSize: "12px", background: "#f8fafc", minWidth: "180px" }} />
                </div>

                {/* India / International */}
                <div role="tablist" style={{ display: "inline-flex", gap: "4px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", marginBottom: "14px" }}>
                    {[{ k: "india", label: "🇮🇳 India" }, { k: "intl", label: "🌍 International" }].map((t) => (
                        <button key={t.k} type="button" role="tab" aria-selected={mode === t.k} onClick={() => switchMode(t.k)}
                            style={{ padding: "7px 16px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: mode === t.k ? "#fff" : "transparent", color: mode === t.k ? "#0C447C" : "#64748b", boxShadow: mode === t.k ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {intl ? (
                    <>
                        {picked.some((c) => COUNTRY_SET.has(c)) && (
                            <div style={{ marginBottom: "14px" }}>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 6px" }}>Selected</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{picked.filter((c) => COUNTRY_SET.has(c)).map(chip)}</div>
                            </div>
                        )}
                        {(() => {
                            const ql = q.trim().toLowerCase();
                            const allCountries = Object.values(WORLD_COUNTRIES_BY_CONTINENT).flat();
                            const addMany = (arr) => setPicked((p) => [...p, ...arr.filter((c) => !p.includes(c))]);
                            const removeMany = (arr) => setPicked((p) => p.filter((c) => !arr.includes(c)));
                            const pickedCountries = picked.filter((c) => COUNTRY_SET.has(c)).length;
                            const linkBtn = (label, onClick, color = "#1d4ed8") => (
                                <button type="button" onClick={onClick} style={{ border: "none", background: "none", color, fontWeight: 700, cursor: "pointer", fontSize: "11px", padding: 0 }}>{label}</button>
                            );
                            const groups = Object.entries(WORLD_COUNTRIES_BY_CONTINENT)
                                .map(([cont, list]) => {
                                    const matches = ql ? list.filter((c) => placeLabel(c).toLowerCase().includes(ql)) : list;
                                    return { cont, list, matches, remaining: matches.filter((c) => !picked.includes(c)), selected: list.filter((c) => picked.includes(c)).length };
                                })
                                .filter((g) => g.matches.length);
                            return (
                                <>
                                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", margin: "0 0 10px" }}>
                                        <span style={{ fontSize: "12px", color: "#475569", fontWeight: 600 }}>{pickedCountries} of {allCountries.length} countries selected</span>
                                        {pickedCountries < allCountries.length && linkBtn("Select all countries", () => addMany(allCountries))}
                                        {pickedCountries > 0 && linkBtn("Clear countries", () => removeMany(allCountries), "#64748b")}
                                    </div>
                                    {!groups.length ? (
                                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 16px" }}>No country matches "{q}"</p>
                                    ) : (
                                        <div style={{ maxHeight: "340px", overflowY: "auto", marginBottom: "16px", paddingRight: "4px" }}>
                                            {groups.map((g) => (
                                                <div key={g.cont} style={{ marginBottom: "12px" }}>
                                                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", margin: "0 0 6px" }}>
                                                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                                            {g.cont} <span style={{ fontWeight: 500 }}>({g.selected}/{g.list.length} selected)</span>
                                                        </span>
                                                        {g.remaining.length > 0 && linkBtn(ql ? `Select ${g.remaining.length} shown` : "Select all", () => addMany(g.remaining))}
                                                        {g.selected > 0 && linkBtn("Clear", () => removeMany(g.list), "#64748b")}
                                                    </div>
                                                    {g.remaining.length ? (
                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{g.remaining.map(chip)}</div>
                                                    ) : (
                                                        <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>All selected — see Selected above</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", margin: "4px 0 6px" }}>States</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>{shown.filter((st) => !UT_SET.has(st)).map(chip)}</div>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", margin: "4px 0 6px" }}>Union territories</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>{shown.filter((st) => UT_SET.has(st)).map(chip)}</div>

                        {/* Select panna ovvoru state kum districts — onnum select pannala na full state */}
                        {picked.some((st) => !COUNTRY_SET.has(st)) && (
                            <div style={{ marginBottom: "16px" }}>
                                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", margin: "4px 0 6px" }}>Districts  <span style={{ textTransform: "none", fontWeight: 500 }}>— (optional)</span></div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {picked.filter((st) => !COUNTRY_SET.has(st)).map((st) => {
                                        const all = INDIA_DISTRICTS[st] || [];
                                        const sel = dists[st] || [];
                                        return (
                                            <div key={st} style={{ border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 12px", background: "#f8fafc" }}>
                                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                                                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0C447C" }}>{st}</span>
                                                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px" }}>
                                                        <span style={{ fontWeight: 700, color: sel.length ? "#0369A1" : "#64748b", background: sel.length ? "#E0F2FE" : "#f1f5f9", padding: "2px 8px", borderRadius: "10px" }}>
                                                            {sel.length ? `${sel.length} of ${all.length} districts` : "Whole state"}
                                                        </span>
                                                        {sel.length < all.length && <button type="button" onClick={() => setDists((m) => ({ ...m, [st]: [...all] }))} style={{ border: "none", background: "none", color: "#1d4ed8", fontWeight: 700, cursor: "pointer", fontSize: "11px" }}>Select all</button>}
                                                        {sel.length > 0 && <button type="button" onClick={() => setDists((m) => ({ ...m, [st]: [] }))} style={{ border: "none", background: "none", color: "#64748b", fontWeight: 700, cursor: "pointer", fontSize: "11px" }}>Clear</button>}
                                                    </span>
                                                </div>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                                                    {all.map((d) => {
                                                        const on = sel.includes(d);
                                                        return (
                                                            <button key={d} type="button" onClick={() => toggleDist(st, d)} aria-pressed={on}
                                                                style={{
                                                                    padding: "4px 10px", borderRadius: "16px", fontSize: "11px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                                                                    border: on ? "1.5px solid #0369A1" : "1px solid #e2e8f0", background: on ? "#0369A1" : "#fff", color: on ? "#fff" : "#475569"
                                                                }}>
                                                                {on ? "✓ " : ""}{d}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                    <button onClick={save} disabled={busy || !picked.length || missingDist.length > 0}
                        style={{ padding: "10px 22px", border: "none", borderRadius: "10px", background: busy || !picked.length || missingDist.length ? "#cbd5e1" : "#0C447C", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: busy || !picked.length || missingDist.length ? "not-allowed" : "pointer" }}>
                        {busy ? "Saving…" : editId ? "Save zone" : `Create ${nextName}`}
                    </button>
                    {(editId || picked.length > 0) && (
                        <button onClick={reset} style={{ padding: "10px 18px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#475569", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                    )}
                    <span style={{ fontSize: "12px", color: missingDist.length ? "#B91C1C" : "#64748b" }}>
                        {(() => {
                            const nc = picked.filter((x) => COUNTRY_SET.has(x)).length;
                            const ns = picked.length - nc;
                            const parts = [];
                            if (ns) parts.push(`${ns} state${ns === 1 ? "" : "s"}`);
                            if (nc) parts.push(`${nc} ${nc === 1 ? "country" : "countries"}`);
                            return parts.length ? `${parts.join(" · ")} selected` : `0 ${units} selected`;
                        })()}{missingDist.length ? ` · select districts for ${missingDist.join(", ")}` : ""}
                    </span>
                </div>
            </div>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "12px" }}>
                {zones.length === 0 && (
                    <div style={{ gridColumn: "1/-1", padding: "30px", textAlign: "center", color: "#94a3b8", fontSize: "13px", background: "#fff", border: "0.5px dashed #cbd5e1", borderRadius: "12px" }}>
                        {readOnly ? "No zones yet." : "No zones yet. Create one above — enquiries can be picked up only after choosing a zone."}
                    </div>
                )}
                {zones.map((z) => (
                    <div key={z._id} style={{ background: editId === z._id ? "#EFF6FF" : "#fff", border: editId === z._id ? "1.5px solid #3B82F6" : "0.5px solid #e2e8f0", borderRadius: "12px", padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontSize: "15px", fontWeight: 800, color: "#0C447C" }}>🗺 {z.name}</span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>{zoneCountLabel(z)}</span>
                        </div>
                        <div style={{ marginBottom: "10px" }}><ZoneStateChips z={z} /></div>
                        {/* Yaar create / edit panna (login) */}
                        <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.6, marginBottom: "10px", borderTop: "0.5px solid #f1f5f9", paddingTop: "8px" }}>
                            <div>Created by <b style={{ color: "#334155" }}>{cancelWho(z.createdBy) || "—"}</b>{z.createdAt ? ` · ${zoneWhen(z.createdAt)}` : ""}</div>
                            {z.updatedBy && <div>Edited by <b style={{ color: "#334155" }}>{cancelWho(z.updatedBy) || "—"}</b>{z.updatedAt ? ` · ${zoneWhen(z.updatedAt)}` : ""}</div>}
                        </div>
                        {!readOnly && <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => startEdit(z)} style={{ flex: 1, padding: "7px", border: "none", borderRadius: "8px", background: "#EEF2FF", color: "#4338CA", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>✎ Edit</button>
                            <button onClick={() => remove(z)} style={{ flex: 1, padding: "7px", border: "none", borderRadius: "8px", background: "#FCEBEB", color: "#A32D2D", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>🗑 Delete</button>
                        </div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// FORWARD — Person / Team, reason kandippaa; stage maaraadhu
// ─────────────────────────────────────────────
const ForwardEnquiryModal = ({ enquiry, staff, exclude = [], onCancel, onConfirm, busy }) => {
    const [mode, setMode] = useState("person");
    const [toStaff, setToStaff] = useState("");
    const [toTeam, setToTeam] = useState("");
    const [reason, setReason] = useState("");
    if (!enquiry) return null;
    const skip = new Set(exclude.filter(Boolean).map(String));
    const people = (staff || []).filter((s) => !skip.has(String(s._id)));
    const teams = teamsFromStaff(people);
    const ready = reason.trim() && (mode === "person" ? toStaff : toTeam);
    const inp = { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "9px 10px", fontSize: "13px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box" };
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} role="dialog" aria-modal="true" aria-labelledby="fwd-title">
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "420px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
                <h3 id="fwd-title" style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#0f172a" }}>↪ Forward enquiry</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#475569" }}>
                    <b style={{ color: "#0C447C" }}>{enquiry.fitCode || "—"}</b> · {enquiry.fullName}
                </p>
                <p style={{ margin: "4px 0 14px", fontSize: "12px", color: "#64748b" }}>It stays at the same stage — the new person continues from there. For a team, whoever clicks first takes it.</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <label htmlFor="fwd-to" style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>Forward to</label>
                    <ToModeSwitch value={mode} onChange={setMode} />
                </div>
                {mode === "person" ? (
                    <select id="fwd-to" value={toStaff} onChange={(e) => setToStaff(e.target.value)} style={inp}>
                        <option value="">Choose staff</option>
                        <StaffOptions staff={people} />
                    </select>
                ) : (
                    <select id="fwd-to" value={toTeam} onChange={(e) => setToTeam(e.target.value)} style={inp}>
                        <option value="">Choose team</option>
                        {teams.map((t) => <option key={t._id} value={t._id}>{t.name} team ({t.count} {t.count === 1 ? "member" : "members"})</option>)}
                    </select>
                )}
                <label htmlFor="fwd-reason" style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#374151", margin: "14px 0 6px" }}>Reason <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea id="fwd-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} placeholder="e.g. Customer wants a Kerala specialist" style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} />
                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button onClick={onCancel} disabled={busy} style={{ flex: 1, padding: "10px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#64748b", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => ready && onConfirm(mode === "person" ? { toStaff, reason: reason.trim() } : { toTeam, reason: reason.trim() })} disabled={!ready || busy}
                        style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: !ready || busy ? "#cbd5e1" : "#0E7490", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: !ready || busy ? "not-allowed" : "pointer" }}>
                        {busy ? "Forwarding…" : "Forward"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Forward history (expanded view)
const ForwardHistory = ({ list = [] }) => {
    if (!list?.length) return null;
    const STAGE = { pending: "Pending", pickup: "Picked up", ratePassed: "Rate shared", accepted: "Accepted", rejected: "Rejected" };
    return (
        <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", border: "0.5px solid #A5F3FC" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#0E7490", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>↪ Forward history</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[...list].reverse().map((d, i) => (
                    <div key={i} style={{ background: "#ECFEFF", borderRadius: "8px", padding: "8px 10px", fontSize: "12px" }}>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>{ownerText(d.from) || "Unassigned"} <span style={{ color: "#0E7490" }}>→</span> {ownerText(d.to)}</div>
                        <div style={{ color: "#334155", whiteSpace: "pre-line", wordBreak: "break-word" }}>{d.reason}</div>
                        <div style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>
                            by {cancelWho(d.by) || "—"} · {d.at ? new Date(d.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : ""}{d.stage ? ` · at ${STAGE[d.stage] || d.stage}` : ""}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// CONFIRM MODAL (Accept / Reject / Delete / Rate Shared)
// ─────────────────────────────────────────────
const ConfirmModal = ({ open, type, name, fitCode, sub, onConfirm, onCancel, zones = [], onOpenZones, showGvShare = false }) => {
    const [salesValue, setSalesValue] = useState("");
    const [zoneIds, setZoneIds] = useState([]); // Pickup — oru zone-aavadhu kandippaa (pala zones um select pannalaam)
    const toggleZone = (id) => setZoneIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    const [fitStates, setFitStates] = useState([]);
    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [pickupPlace, setPickupPlace] = useState("");
    const [dropDate, setDropDate] = useState("");
    const [dropTime, setDropTime] = useState("");
    const [dropPlace, setDropPlace] = useState("");
    const [shareVinoth, setShareVinoth] = useState("");
    const [shareGiridhar, setShareGiridhar] = useState("");
    // Cancel (accepted enquiry) — charge mandatory, reason optional
    const [cancelCharge, setCancelCharge] = useState("");
    const [cancelReason, setCancelReason] = useState("");
    useEffect(() => {
        if (open) {
            setSalesValue(""); setFitStates([]);
            setPickupDate(""); setPickupTime(""); setPickupPlace("");
            setDropDate(""); setDropTime(""); setDropPlace("");
            setShareVinoth(""); setShareGiridhar("");
            setCancelCharge(""); setCancelReason(""); setZoneIds([]);
        }
    }, [open]);

    if (!open) return null;

    const allStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
    const toggleState = (s) => setFitStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

    // ── ratePassed uses the same lightweight confirm UI as reject/delete
    // (icon + title + sub text + Yes/Cancel buttons) — no extra form
    // fields needed, just a "are you sure" gate before the toggle fires. ──
    const cfg = {
        accept: { iconBg: "#EAF3DE", iconColor: "#3B6D11", title: "Accept Enquiry", btnBg: "#3B6D11", lbl: "✓ Confirm Accept" },
        reject: { icon: "✕", iconBg: "#FCEBEB", iconColor: "#A32D2D", title: "Reject Enquiry?", sub: "This will mark the enquiry as rejected.", btnBg: "#A32D2D", lbl: "Yes, Reject" },
        delete: { icon: "🗑", iconBg: "#FCEBEB", iconColor: "#A32D2D", title: "Delete Enquiry?", sub: "This action cannot be undone.", btnBg: "#A32D2D", lbl: "Yes, Delete" },
        pickup: { icon: "✋", iconBg: "#E0F2FE", iconColor: "#075985", title: "Pick up Enquiry", sub: "Choose one or more zones. After pick up, only you will see this enquiry.", btnBg: "#0369A1", lbl: "Save & Pick up" },
        ratePassed: { icon: "💰", iconBg: "#FEF3C7", iconColor: "#92400E", title: "Mark Rate Shared?", sub: "This will move the enquiry to the Rate Shared queue, out of the regular Pending list.", btnBg: "#92400E", lbl: "Yes, Mark Rate Shared" },
        close: { icon: "🔒", iconBg: "#E2E8F0", iconColor: "#334155", title: "Close Enquiry?", sub: "This will move the enquiry out of Accepted into the Closed list.", btnBg: "#334155", lbl: "Yes, Close" },
        reopen: { icon: "↺", iconBg: "#E0E7FF", iconColor: "#3730A3", title: "Reopen Enquiry?", sub: "This will move the enquiry back to the stage it was in before it was rejected.", btnBg: "#3730A3", lbl: "Yes, Reopen" },
        reopenClosed: { icon: "↺", iconBg: "#E0E7FF", iconColor: "#3730A3", title: "Reopen Closed Enquiry?", sub: "This will move the enquiry back to Accepted.", btnBg: "#3730A3", lbl: "Yes, Reopen" },
        cancel: { icon: "🚫", iconBg: "#FFE4E6", iconColor: "#9F1239", title: "Cancel Trip?", sub: "This accepted enquiry will move to the Cancelled list.", btnBg: "#9F1239", lbl: "Yes, Cancel Trip" },
    };
    const c = { ...(cfg[type] || cfg.delete), ...(sub ? { sub } : {}) };

    // FIT States is OPTIONAL — selecting at least one is no longer
    // required to enable the Accept button.
    // Drop, pickup ku munnaadi irukka koodaadhu
    const dropBeforePickup = !!(pickupDate && pickupTime && dropDate && dropTime) && `${dropDate}T${dropTime}` < `${pickupDate}T${pickupTime}`;
    const isAcceptDisabled = type === "accept" && (
        !salesValue || Number(salesValue) <= 0 ||
        !pickupDate || !pickupTime || !pickupPlace.trim() ||
        dropBeforePickup
    );

    const isCancelDisabled = type === "cancel" && (cancelCharge === "" || !(Number(cancelCharge) >= 0));
    const isPickupDisabled = type === "pickup" && !zoneIds.length;
    const isDisabled = isAcceptDisabled || isCancelDisabled || isPickupDisabled;

    const handleConfirm = () => {
        if (type === "accept") onConfirm({
            salesValue: Number(salesValue), fitStates, pickupDate, pickupTime, pickupPlace, dropDate, dropTime, dropPlace: dropPlace.trim(),
            ...(showGvShare && (shareVinoth !== "" || shareGiridhar !== "")
                ? { gvShare: { vinoth: shareVinoth === "" ? null : Number(shareVinoth), giridhar: shareGiridhar === "" ? null : Number(shareGiridhar) } }
                : {}),
        });
        else if (type === "cancel") onConfirm({ cancellationCharge: Number(cancelCharge), reason: cancelReason.trim() });
        else if (type === "pickup") onConfirm({ zoneIds });
        else onConfirm({});
    };

    const inpStyle = { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "9px 10px", fontSize: "13px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box" };
    const lblStyle = { fontSize: "12px", fontWeight: 700, color: "#374151", display: "block", marginBottom: "6px" };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: type === "accept" ? "500px" : type === "cancel" || type === "pickup" ? "420px" : "320px", border: "0.5px solid #e2e8f0", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>

                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "20px", color: c.iconColor, fontWeight: 700 }}>
                    {type === "accept" ? "✓" : c.icon}
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", textAlign: "center", marginBottom: "4px" }}>{c.title}</h3>
                <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "18px" }}>
                    <strong style={{ color: "#1e293b" }}>{name}</strong>
                </p>
                {/* FIT Code pill for Reject / Rate Shared / Close / Reopen
                    (Accept already shows it in its own block below) */}
                {type !== "accept" && fitCode && (
                    <div style={{ textAlign: "center", marginTop: "-10px", marginBottom: "14px" }}>
                        <span style={{ display: "inline-block", fontSize: "12px", fontWeight: 800, color: "#0C447C", background: "#E6F1FB", padding: "4px 12px", borderRadius: "6px", letterSpacing: "1px", fontFamily: "monospace" }}>
                            🏷 {fitCode}
                        </span>
                    </div>
                )}

                {type === "accept" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>

                        {/* FIT Code */}
                        <div style={{ background: "#E6F1FB", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "12px", color: "#0C447C", fontWeight: 500 }}>🏷 FIT Code</span>
                            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0C447C", background: "#fff", padding: "4px 12px", borderRadius: "6px", letterSpacing: "1px", fontFamily: "monospace" }}>
                                {fitCode || "—"}
                            </span>
                        </div>

                        {/* FIT States — now OPTIONAL */}
                        <div>
                            <label style={lblStyle}>
                                🗺 FIT States <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span>
                                <span style={{ float: "right", fontSize: "11px", fontWeight: 600, background: fitStates.length > 0 ? "#EAF3DE" : "#f1f5f9", color: fitStates.length > 0 ? "#3B6D11" : "#94a3b8", padding: "2px 8px", borderRadius: "10px" }}>
                                    {fitStates.length} selected
                                </span>
                            </label>
                            <div style={{ maxHeight: "160px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: "1.5px solid #e2e8f0" }}>
                                {allStates.map((state) => (
                                    <button key={state} type="button" onClick={() => toggleState(state)}
                                        style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: fitStates.includes(state) ? "none" : "1px solid #e2e8f0", background: fitStates.includes(state) ? "#0C447C" : "#fff", color: fitStates.includes(state) ? "#fff" : "#475569", whiteSpace: "nowrap" }}>
                                        {fitStates.includes(state) ? "✓ " : ""}{state}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sales Value */}
                        <div>
                            <label style={lblStyle}>💰 Sales Value (₹) <span style={{ color: "#ef4444" }}>*</span></label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#94a3b8" }}>₹</span>
                                <input type="number" min="1" placeholder="e.g. 25000" value={salesValue} onChange={(e) => setSalesValue(e.target.value)}
                                    style={{ ...inpStyle, paddingLeft: "28px", border: `1.5px solid ${!salesValue || Number(salesValue) <= 0 ? "#fca5a5" : "#e2e8f0"}` }} />
                            </div>
                            {(!salesValue || Number(salesValue) <= 0) && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Enter a valid sales value</p>}
                        </div>

                        {/* Pickup Date + Time */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label style={lblStyle}>📅 Pickup Date <span style={{ color: "#ef4444" }}>*</span></label>
                                <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)}
                                    style={{ ...inpStyle, border: `1.5px solid ${!pickupDate ? "#fca5a5" : "#e2e8f0"}` }} />
                                {!pickupDate && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Required</p>}
                            </div>
                            <div>
                                <label style={lblStyle}>🕐 Pickup Time <span style={{ color: "#ef4444" }}>*</span></label>
                                <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)}
                                    style={{ ...inpStyle, border: `1.5px solid ${!pickupTime ? "#fca5a5" : "#e2e8f0"}` }} />
                                {!pickupTime && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Required</p>}
                            </div>
                        </div>

                        {/* GV Share — Vinoth / Giridhar / Tour admin / Admin ku mattum */}
                        {showGvShare && (
                            <div style={{ border: "1px dashed #CBD5E1", borderRadius: "10px", padding: "10px 12px", background: "#F8FAFC" }}>
                                <div style={{ fontSize: "12px", fontWeight: 800, color: "#0C447C", marginBottom: "8px" }}>🤝 GV Share <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div>
                                        <label style={lblStyle}>Vinoth (GVEMP008) share (₹)</label>
                                        <input type="number" min="0" placeholder="e.g. 5000" value={shareVinoth} onChange={(e) => setShareVinoth(e.target.value)} style={inpStyle} />
                                    </div>
                                    <div>
                                        <label style={lblStyle}>Giridharan (GVEMP009) share (₹)</label>
                                        <input type="number" min="0" placeholder="e.g. 3000" value={shareGiridhar} onChange={(e) => setShareGiridhar(e.target.value)} style={inpStyle} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Drop Date + Time — idhu thaandinaa accepted enquiry auto close */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label style={lblStyle}>📅 Drop Date <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
                                <input type="date" value={dropDate} min={pickupDate || undefined} onChange={(e) => setDropDate(e.target.value)}
                                    style={{ ...inpStyle, border: `1.5px solid ${dropBeforePickup ? "#fca5a5" : "#e2e8f0"}` }} />
                            </div>
                            <div>
                                <label style={lblStyle}>🕐 Drop Time <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
                                <input type="time" value={dropTime} onChange={(e) => setDropTime(e.target.value)}
                                    style={{ ...inpStyle, border: `1.5px solid ${dropBeforePickup ? "#fca5a5" : "#e2e8f0"}` }} />
                            </div>
                        </div>
                        {dropBeforePickup && <p style={{ fontSize: "11px", color: "#ef4444", margin: "-6px 0 0" }}>⚠ Drop date and time must be after pickup</p>}
                        <p style={{ fontSize: "11px", color: "#64748b", margin: "-6px 0 0" }}>If a drop date is given, the enquiry closes automatically after the drop date and time.</p>

                        {/* Pickup Place */}
                        <div>
                            <label style={lblStyle}>📍 Pickup Place <span style={{ color: "#ef4444" }}>*</span></label>
                            <input type="text" placeholder="e.g. Chennai Airport, T2" value={pickupPlace} onChange={(e) => setPickupPlace(e.target.value)}
                                style={{ ...inpStyle, border: `1.5px solid ${!pickupPlace.trim() ? "#fca5a5" : "#e2e8f0"}` }} />
                            {!pickupPlace.trim() && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Required</p>}
                        </div>

                        {/* Drop Place */}
                        <div>
                            <label style={lblStyle}>📍 Drop Place <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
                            <input type="text" placeholder="e.g. Madurai Railway Station" value={dropPlace} onChange={(e) => setDropPlace(e.target.value)}
                                style={{ ...inpStyle, border: "1.5px solid #e2e8f0" }} />
                        </div>
                    </div>
                )}

                {type !== "accept" && (
                    <p style={{ fontSize: "13px", color: "#64748b", textAlign: "center", marginBottom: "18px" }}>{c.sub}</p>
                )}

                {/* Pick up — zone select (kandippaa) */}
                {type === "pickup" && (
                    <div style={{ marginBottom: "18px" }}>
                        <label style={lblStyle}>
                            🗺 Zones <span style={{ color: "#ef4444" }}>*</span>
                            <span style={{ float: "right", fontSize: "11px", fontWeight: 600, background: zoneIds.length ? "#E0F2FE" : "#f1f5f9", color: zoneIds.length ? "#075985" : "#94a3b8", padding: "2px 8px", borderRadius: "10px" }}>{zoneIds.length} selected</span>
                        </label>
                        {zones.length === 0 ? (
                            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", color: "#92400E" }}>
                                No zones yet. Create a zone first.
                                {onOpenZones && <button type="button" onClick={onOpenZones} style={{ marginLeft: "6px", border: "none", background: "none", color: "#1d4ed8", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Open Zones</button>}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "320px", overflowY: "auto" }}>
                                {zones.map((z) => {
                                    const on = zoneIds.includes(z._id);
                                    return (
                                        <div key={z._id} role="checkbox" aria-checked={on} tabIndex={0} onClick={() => toggleZone(z._id)}
                                            onKeyDown={(ev) => { if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); toggleZone(z._id); } }}
                                            style={{ textAlign: "left", padding: "10px 12px", borderRadius: "10px", cursor: "pointer", border: on ? "2px solid #0369A1" : "1px solid #e2e8f0", background: on ? "#E0F2FE" : "#fff" }}>
                                            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0C447C", marginBottom: "6px" }}>{on ? "☑ " : "☐ "}{z.name}</div>
                                            <ZoneStateChips z={z} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Cancel Trip — charge (mandatory) + reason (optional) */}
                {type === "cancel" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                        <div>
                            <label style={lblStyle}>💸 Cancellation Charge (₹) <span style={{ color: "#ef4444" }}>*</span></label>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#94a3b8" }}>₹</span>
                                <input type="number" min="0" placeholder="e.g. 2000  (0 if no charge)" value={cancelCharge} onChange={(e) => setCancelCharge(e.target.value)}
                                    style={{ ...inpStyle, paddingLeft: "28px", border: `1.5px solid ${isCancelDisabled ? "#fca5a5" : "#e2e8f0"}` }} />
                            </div>
                            {isCancelDisabled && <p style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>⚠ Enter the charge (0 if none)</p>}
                        </div>
                        <div>
                            <label style={lblStyle}>📝 Reason / Remarks <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
                            <textarea rows={3} placeholder="e.g. Customer health issue, trip postponed…" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                                style={{ ...inpStyle, resize: "vertical", fontFamily: "inherit" }} />
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: "10px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#64748b", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>{type === "cancel" ? "Go Back" : "Cancel"}</button>
                    <button onClick={handleConfirm} disabled={isDisabled}
                        style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: isDisabled ? "#cbd5e1" : c.btnBg, color: "#fff", fontSize: "13px", cursor: isDisabled ? "not-allowed" : "pointer", fontWeight: 700 }}>
                        {c.lbl}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// EDIT ENQUIRY MODAL
// ─────────────────────────────────────────────
const EditEnquiryModal = ({ open, data, onClose, onSave, zones = [], onSaveZones, showGvShare = false }) => {
    const [form, setForm] = useState({});
    // Zones — pick up aana enquiry la endha stage la irundhaalum maathalaam
    const [zoneIds, setZoneIds] = useState([]);
    const origZoneIds = (zonesOfEnq(data).map((z) => String(z.zoneId || "")).filter(Boolean)).sort().join(",");
    const [saving, setSaving] = useState(false);
    const [counts, setCounts] = useState({ a: 1, c: 0, i: 0 });
    const [fitStates, setFitStates] = useState([]);

    useEffect(() => {
        if (open && data) {
            setForm({
                fullName: data.fullName || "",
                mobileNumber: data.mobileNumber || "",
                email: data.email || "",
                city: data.city || "",
                destination: data.destination || "",
                tourType: data.tourType || "",
                preferredTravelDate: data.preferredTravelDate ? new Date(data.preferredTravelDate).toISOString().split("T")[0] : "",
                numberOfDays: data.numberOfDays || "",
                numberOfNights: data.numberOfNights || "",
                specialRequests: data.specialRequests || "",
                source: data.source || "",
                status: data.status || "pending",
                salesValue: data.salesValue || "",
                pickupDate: data.pickupDate ? new Date(data.pickupDate).toISOString().split("T")[0] : "",
                pickupTime: data.pickupTime || "",
                pickupPlace: data.pickupPlace || "",
                dropDate: data.dropDate ? new Date(data.dropDate).toISOString().split("T")[0] : "",
                dropTime: data.dropTime || "",
                dropPlace: data.dropPlace || "",
                shareVinoth: data.gvShare?.vinoth ?? "",
                shareGiridhar: data.gvShare?.giridhar ?? "",
                // Cancelled trip → charge / reason thiruthalaam
                ...(data.isCancelled ? {
                    cancellationCharge: data.cancellationCharge ?? 0,
                    cancelReason: data.cancelReason || "",
                } : {}),
            });
            setCounts({ a: data.adults || 1, c: data.children || 0, i: data.infants || 0 });
            setFitStates(data.fitStates || []);
            setZoneIds(zonesOfEnq(data).map((z) => String(z.zoneId || "")).filter(Boolean));
        }
    }, [open, data]);

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => {
            const updated = { ...p, [name]: value };
            if (name === "numberOfDays") {
                const days = Number(value);
                updated.numberOfNights = days > 0 ? String(days - 1) : "";
            }
            return updated;
        });
    };

    // original values store
    const original = {
        fullName: data?.fullName || "", mobileNumber: data?.mobileNumber || "",
        email: data?.email || "", city: data?.city || "",
        destination: data?.destination || "", tourType: data?.tourType || "",
        preferredTravelDate: data?.preferredTravelDate ? new Date(data.preferredTravelDate).toISOString().split("T")[0] : "",
        numberOfDays: String(data?.numberOfDays || ""), numberOfNights: String(data?.numberOfNights || ""),
        specialRequests: data?.specialRequests || "", source: data?.source || "",
        status: data?.status || "pending", salesValue: String(data?.salesValue || ""),
        pickupDate: data?.pickupDate ? new Date(data.pickupDate).toISOString().split("T")[0] : "",
        pickupTime: data?.pickupTime || "", pickupPlace: data?.pickupPlace || "",
        dropDate: data?.dropDate ? new Date(data.dropDate).toISOString().split("T")[0] : "",
        dropTime: data?.dropTime || "",
        dropPlace: data?.dropPlace || "",
    };

    const changeCount = (key, delta) => {
        setCounts((prev) => {
            const u = { ...prev, [key]: Math.max(0, prev[key] + delta) };
            if (key === "a" && u[key] < 1) u[key] = 1;
            return u;
        });
    };

    const toggleState = (s) => setFitStates((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

    const zonesChanged = [...zoneIds].sort().join(",") !== origZoneIds;
    const showZones = !!data?.isPickedUp || zonesOfEnq(data).length > 0;
    const toggleZoneId = (id) => setZoneIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    const handleSave = async () => {
        if (showZones && !zoneIds.length) return toast.error("Select at least one zone");
        setSaving(true);
        if (showZones && zonesChanged && onSaveZones) {
            const zr = await onSaveZones(data._id, zoneIds);
            if (!zr?.success) { setSaving(false); return; }
        }
        const { shareVinoth, shareGiridhar, ...formRest } = form;
        const result = await onSave(data._id, {
            ...formRest,
            ...(showGvShare && data.status === "accepted"
                ? { gvShare: { vinoth: shareVinoth === "" || shareVinoth === null ? null : Number(shareVinoth), giridhar: shareGiridhar === "" || shareGiridhar === null ? null : Number(shareGiridhar) } }
                : {}),
            adults: counts.a,
            children: counts.c,
            infants: counts.i,
            numberOfDays: Number(form.numberOfDays),
            numberOfNights: Number(form.numberOfNights),
            salesValue: form.salesValue ? Number(form.salesValue) : null,
            fitStates,
            ...(data.isCancelled ? {
                cancellationCharge: Number(form.cancellationCharge) || 0,
                cancelReason: (form.cancelReason || "").trim(),
            } : {}),
        });
        setSaving(false);
        if (result?.success) onClose();
    };

    const allStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

    const inp = { width: "100%", border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "11px 12px", fontSize: "14px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box", height: "44px" }; const lbl = { fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" };
    const sec = { fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" };

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <style>{`
            .eq-edit-add { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) { .eq-edit-add { grid-template-columns: 1fr !important; } }
    .eq-edit-grid2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }
    .eq-edit-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .eq-edit-grid2c { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 12px; }
    .eq-edit-grid3t { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    @media (max-width: 600px) {
        .eq-edit-grid2  { grid-template-columns: 1fr !important; }
        .eq-edit-grid3  { grid-template-columns: 1fr !important; }
        .eq-edit-grid2c { grid-template-columns: 1fr !important; }
        .eq-edit-grid3t { grid-template-columns: 1fr !important; }
    }
`}</style>
            <div style={{ background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "700px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

                {/* Header */}
                <div style={{ position: "sticky", top: 0, background: "#1e293b", padding: "16px 20px", borderRadius: "16px 16px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
                    <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>✎ Edit Enquiry</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{data?.fitCode} — {data?.fullName}</div>
                    </div>
                    <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px" }}>✕</button>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>

                    {/* Personal Details */}
                    <div>
                        <div style={sec}><span style={{ background: "#dbeafe", borderRadius: "6px", padding: "4px 8px" }}>👤</span> Personal Details</div>
                        <div className="eq-edit-grid2">                            {[
                            { label: "Full Name", name: "fullName", placeholder: "Full name" },
                            { label: "Mobile Number", name: "mobileNumber", placeholder: "+91 XXXXX XXXXX" },
                            { label: "Email", name: "email", placeholder: "email@example.com", type: "email" },
                            { label: "City", name: "city", placeholder: "e.g. Chennai" },
                        ].map((f) => (
                            <div key={f.name}>
                                <label style={lbl}>{f.label}</label>
                                <input name={f.name} value={form[f.name] || ""} onChange={handleChange} type={f.type || "text"} placeholder={f.placeholder} style={inp} />
                            </div>
                        ))}
                        </div>
                    </div>

                    {/* Tour Details */}
                    <div>
                        <div style={sec}><span style={{ background: "#d1fae5", borderRadius: "6px", padding: "4px 8px" }}>🗺️</span> Tour Details</div>
                        <div className="eq-edit-grid2c">                            <div>
                            <label style={lbl}>Destination</label>
                            <input name="destination" value={form.destination || ""} onChange={handleChange} placeholder="e.g. Kerala" style={inp} />
                        </div>
                            <div>
                                <label style={lbl}>Tour Type</label>
                                <select name="tourType" value={form.tourType || ""} onChange={handleChange} style={{ ...inp, appearance: "none" }}>
                                    <option value="">Select type</option>
                                    <option>Group tour(fixed departure)</option>
                                    <option>Customized/Private tour</option>
                                    <option>Friends</option><option>Family</option>
                                    <option>Corporate/Team Outing</option>
                                    <option>Honeymoon</option>
                                    <option>pilgrimage tour</option>
                                    <option>Others</option>
                                </select>
                            </div>
                        </div>
                        <div className="eq-edit-grid3">
                            <div>
                                <label style={lbl}>Travel Date</label>
                                <input type="date" name="preferredTravelDate" value={form.preferredTravelDate || ""} onChange={handleChange}
                                    min={new Date().toISOString().split("T")[0]}
                                    style={inp} />

                            </div>
                            <div>
                                <label style={lbl}>No. of Days</label>
                                <input type="number" name="numberOfDays" value={form.numberOfDays || ""} onChange={handleChange} min="1" placeholder="5" style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>No. of Nights</label>
                                <input type="number" name="numberOfNights" value={form.numberOfNights || ""} onChange={handleChange} min="0" placeholder="4" style={inp} />
                            </div>
                        </div>
                    </div>

                    {/* Travellers */}
                    <div>
                        <div style={sec}><span style={{ background: "#ede9fe", borderRadius: "6px", padding: "4px 8px" }}>👥</span> Travellers</div>
                        <div className="eq-edit-grid3t">                            {[
                            { key: "a", label: "Adults", color: "#2563eb", bg: "#dbeafe" },
                            { key: "c", label: "Children (6–10)", color: "#ec4899", bg: "#fce7f3" },
                            { key: "i", label: "Infants (0–5)", color: "#f97316", bg: "#ffedd5" },
                        ].map((t) => (
                            <div key={t.key} style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                                <div style={{ fontSize: "12px", fontWeight: 600, color: t.color, marginBottom: "8px" }}>{t.label}</div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                                    <button type="button" onClick={() => changeCount(t.key, -1)} style={{ width: "30px", height: "30px", borderRadius: "6px", background: t.bg, border: "none", color: t.color, fontSize: "18px", cursor: "pointer" }}>−</button>
                                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a", minWidth: "24px" }}>{counts[t.key]}</span>
                                    <button type="button" onClick={() => changeCount(t.key, 1)} style={{ width: "30px", height: "30px", borderRadius: "6px", background: t.bg, border: "none", color: t.color, fontSize: "18px", cursor: "pointer" }}>+</button>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>

                    {/* Status & Sales */}
                    {data?.status === "accepted" && <div>
                        <div style={sec}><span style={{ background: "#fef3c7", borderRadius: "6px", padding: "4px 8px" }}>📊</span> Status & Sales</div>
                        <div className="eq-edit-grid2">                            <div>
                            <label style={lbl}>Status</label>
                            <select name="status" value={form.status || ""} onChange={handleChange} style={{ ...inp, appearance: "none" }}>
                                <option value="pending">Pending</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                            <div>
                                <label style={lbl}>Sales Value (₹)</label>
                                <input type="number" name="salesValue" value={form.salesValue || ""} onChange={handleChange} min="0" placeholder="e.g. 25000" style={inp} />
                            </div>
                        </div>
                    </div>}

                    {/* Pickup Details */}
                    {data?.status === "accepted" && <div>
                        <div style={sec}><span style={{ background: "#ffedd5", borderRadius: "6px", padding: "4px 8px" }}>🚐</span> Pickup Details</div>
                        <div className="eq-edit-grid2c">                            <div>
                            <label style={lbl}>Pickup Date</label>
                            <input type="date" name="pickupDate" value={form.pickupDate || ""} onChange={handleChange} style={inp} />
                        </div>
                            <div>
                                <label style={lbl}>Pickup Time</label>
                                <input type="time" name="pickupTime" value={form.pickupTime || ""} onChange={handleChange} style={inp} />
                            </div>
                        </div>
                        <div className="eq-edit-grid2c">
                            <div>
                                <label style={lbl}>Drop Date</label>
                                <input type="date" name="dropDate" value={form.dropDate || ""} min={form.pickupDate || undefined} onChange={handleChange} style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>Drop Time</label>
                                <input type="time" name="dropTime" value={form.dropTime || ""} onChange={handleChange} style={inp} />
                            </div>
                        </div>
                        <div>
                            <label style={lbl}>Pickup Place</label>
                            <input type="text" name="pickupPlace" value={form.pickupPlace || ""} onChange={handleChange} placeholder="e.g. Chennai Airport T2" style={inp} />
                        </div>
                        <div style={{ marginTop: "12px" }}>
                            <label style={lbl}>Drop Place</label>
                            <input type="text" name="dropPlace" value={form.dropPlace || ""} onChange={handleChange} placeholder="e.g. Madurai Railway Station" style={inp} />
                        </div>
                    </div>}

                    {/* GV Share — Vinoth / Giridhar / Tour admin / Admin ku mattum */}
                    {showGvShare && data?.status === "accepted" && <div>
                        <div style={sec}><span style={{ background: "#F1F5F9", borderRadius: "6px", padding: "4px 8px" }}>🤝</span> GV Share</div>
                        <div className="eq-edit-grid2c">
                            <div>
                                <label style={lbl}>Vinoth (GVEMP008) share (₹)</label>
                                <input type="number" min="0" name="shareVinoth" value={form.shareVinoth ?? ""} onChange={handleChange} placeholder="e.g. 5000" style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>Giridharan (GVEMP009) share (₹)</label>
                                <input type="number" min="0" name="shareGiridhar" value={form.shareGiridhar ?? ""} onChange={handleChange} placeholder="e.g. 3000" style={inp} />
                            </div>
                        </div>
                    </div>}

                    {/* Zones — endha stage la irundhaalum maathalaam */}
                    {showZones && <div>
                        <div style={sec}><span style={{ background: "#E0F2FE", borderRadius: "6px", padding: "4px 8px" }}>🗺</span> Zones <span style={{ color: "#ef4444" }}>*</span>
                            <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 600, background: zoneIds.length ? "#E0F2FE" : "#FEE2E2", color: zoneIds.length ? "#075985" : "#B91C1C", padding: "2px 8px", borderRadius: "10px" }}>{zoneIds.length} selected</span>
                        </div>
                        {zones.length === 0 ? (
                            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>No zones available.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
                                {zones.map((z) => {
                                    const id = String(z._id);
                                    const on = zoneIds.includes(id);
                                    return (
                                        <div key={id} role="checkbox" aria-checked={on} tabIndex={0} onClick={() => toggleZoneId(id)}
                                            onKeyDown={(ev) => { if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); toggleZoneId(id); } }}
                                            style={{ padding: "10px 12px", borderRadius: "10px", cursor: "pointer", border: on ? "2px solid #0369A1" : "1px solid #e2e8f0", background: on ? "#E0F2FE" : "#fff" }}>
                                            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0C447C", marginBottom: "6px" }}>{on ? "☑ " : "☐ "}{z.name}</div>
                                            <ZoneStateChips z={z} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>}

                    {/* FIT States */}
                    {data?.status === "accepted" && <div>
                        <div style={sec}>
                            <span style={{ background: "#E6F1FB", borderRadius: "6px", padding: "4px 8px" }}>🗺</span> FIT States
                            <span style={{ marginLeft: "auto", fontSize: "11px", background: fitStates.length > 0 ? "#EAF3DE" : "#f1f5f9", color: fitStates.length > 0 ? "#3B6D11" : "#94a3b8", padding: "2px 8px", borderRadius: "10px" }}>
                                {fitStates.length} selected
                            </span>
                        </div>
                        <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: "0.5px solid #e2e8f0" }}>
                            {allStates.map((state) => (
                                <button key={state} type="button" onClick={() => toggleState(state)}
                                    style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, cursor: "pointer", border: fitStates.includes(state) ? "none" : "1px solid #e2e8f0", background: fitStates.includes(state) ? "#0C447C" : "#fff", color: fitStates.includes(state) ? "#fff" : "#475569", whiteSpace: "nowrap" }}>
                                    {fitStates.includes(state) ? "✓ " : ""}{state}
                                </button>
                            ))}
                        </div>
                    </div>}

                    {/* Cancellation (cancelled trip mattum) — thappa pottirundha thiruthalaam */}
                    {data?.isCancelled && <div>
                        <div style={sec}><span style={{ background: "#FFE4E6", borderRadius: "6px", padding: "4px 8px" }}>🚫</span> Cancellation</div>
                        <div className="eq-edit-add">
                            <div>
                                <label style={lbl}>Cancellation Charge (₹) <span style={{ color: "#ef4444" }}>*</span></label>
                                <input type="number" name="cancellationCharge" value={form.cancellationCharge ?? ""} onChange={handleChange} min="0" placeholder="0 if no charge" style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>Reason / Remarks <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span></label>
                                <textarea name="cancelReason" value={form.cancelReason || ""} onChange={handleChange} rows={2}
                                    placeholder="Reason for cancellation"
                                    style={{ ...inp, height: "auto", resize: "vertical", fontFamily: "inherit" }} />
                            </div>
                        </div>
                    </div>}

                    {/* Additional Info */}
                    <div>
                        <div style={sec}><span style={{ background: "#ffedd5", borderRadius: "6px", padding: "4px 8px" }}>💬</span> Additional Info</div>
                        <div className="eq-edit-add">                            <div>
                            <label style={lbl}>Special Requests</label>
                            <textarea name="specialRequests" value={form.specialRequests || ""} onChange={handleChange} rows={3}
                                placeholder="e.g. vegetarian meals..."
                                style={{ ...inp, height: "auto", resize: "none" }} />
                        </div>
                            <div>
                                <label style={lbl}>Source</label>
                                <select name="source" value={form.source || ""} onChange={handleChange} style={{ ...inp, appearance: "none" }}>
                                    <option value="">Select source</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Google">Google</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option>
                                    <option value="YouTube">YouTube</option>
                                    <option value="Friends & Family">Friends & Family</option>
                                    <option value="Whatsapp/Referral">Whatsapp/Referral</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: "0.5px solid #e2e8f0", padding: "14px 20px", display: "flex", gap: "10px", borderRadius: "0 0 16px 16px" }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "11px", border: "0.5px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc", color: "#64748b", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving}
                        style={{ flex: 2, padding: "11px", border: "none", borderRadius: "10px", background: saving ? "#93c5fd" : "#2563eb", color: "#fff", fontSize: "13px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        {saving
                            ? <><div style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Saving...</>
                            : "💾 Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────
// ADMIN ENQUIRY FORM (Raise Enquiry tab)
// ─────────────────────────────────────────────
const AdminEnquiryForm = ({ onSuccess }) => {
    const { adminCreateEnquiry, enquiryLoading } = useContext(TourContext);
    const [submitted, setSubmitted] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "", mobileNumber: "", email: "", city: "",
        destination: "", tourType: "", preferredTravelDate: "",
        numberOfDays: "", numberOfNights: "", specialRequests: "", source: "admin",
    });
    const [counts, setCounts] = useState({ a: 1, c: 0, i: 0 });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => {
            const updated = { ...p, [name]: value };
            if (name === "numberOfDays") {
                const days = Number(value);
                updated.numberOfNights = days > 0 ? String(days - 1) : "";
            }
            return updated;
        });
    };

    const changeCount = (key, delta) => {
        setCounts((prev) => { const u = { ...prev, [key]: Math.max(0, prev[key] + delta) }; if (key === "a" && u[key] < 1) u[key] = 1; return u; });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        const result = await adminCreateEnquiry({ ...formData, adults: counts.a, children: counts.c, infants: counts.i, numberOfDays: Number(formData.numberOfDays), numberOfNights: Number(formData.numberOfNights) });
        if (result.success) {
            setSubmitted(result.fitCode);
            setFormData({ fullName: "", mobileNumber: "", email: "", city: "", destination: "", tourType: "", preferredTravelDate: "", numberOfDays: "", numberOfNights: "", specialRequests: "", source: "admin" });
            setCounts({ a: 1, c: 0, i: 0 });
            setTimeout(() => { setSubmitted(null); if (onSuccess) onSuccess(); }, 3000);
        }
    };

    const inp = { width: "100%", border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px 10px 36px", fontSize: "13px", color: "#1e293b", outline: "none", background: "#f8fafc", boxSizing: "border-box", height: "46px" };
    const lbl = { fontSize: "14px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" };
    const sec = { fontSize: "14px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" };
    const enquiryFormDirty = Object.entries(formData).some(([k, v]) => k !== "source" && String(v || "").trim() !== "");
    return (
        <div>
            <LeaveGuard
                when={enquiryFormDirty}
                title="Unsaved Enquiry"
                message={
                    <>
                        The enquiry you started is not submitted yet.
                        <br />
                        Leaving this page will lose the details you entered.
                        <br />
                        Are you sure you want to leave?
                    </>
                }
            />

            <style>{`
                @keyframes spin { to { transform:rotate(360deg); } }
                .aeq-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
                .aeq-trav { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
                .aeq-add  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
                .aeq-tour-r1 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
                .aeq-tour-r2 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
                @media (max-width:1024px) { .aeq-trav { grid-template-columns:repeat(2,1fr) !important; } }
                @media (max-width:640px) {
                    .aeq-grid    { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-trav    { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-add     { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-tour-r1 { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-tour-r2 { grid-template-columns:1fr !important; gap:10px !important; }
                    .aeq-inp     { height:50px !important; font-size:14px !important; padding:12px 12px 12px 36px !important; }
                    .aeq-lbl     { font-size:13px !important; margin-bottom:5px !important; }
                }
            `}</style>

            {submitted && (
                <div style={{ background: "#0C447C", borderRadius: "14px", padding: "20px 24px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#1e6db5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>✅</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "13px", color: "#93c5fd", marginBottom: "4px" }}>Enquiry created successfully!</div>
                            <div style={{ fontSize: "12px", color: "#bfdbfe" }}>FIT Code assigned:</div>
                            <div style={{ fontSize: "28px", fontWeight: 800, color: "#fff", letterSpacing: "2px", fontFamily: "monospace" }}>{submitted}</div>
                            <div style={{ fontSize: "11px", color: "#93c5fd", marginTop: "4px" }}>Switching to All Enquiries in 3 seconds...</div>
                        </div>
                        <button onClick={() => { setSubmitted(null); if (onSuccess) onSuccess(); }} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #3b82f6", borderRadius: "8px", color: "#93c5fd", fontSize: "12px", cursor: "pointer" }}>View Now →</button>
                    </div>
                </div>
            )}

            <div style={{ background: "#E6F1FB", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #bfdbfe" }}>
                <span style={{ fontSize: "20px" }}>🏷</span>
                <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#0C447C" }}>FIT Code Auto-Generation</div>
                    <div style={{ fontSize: "11px", color: "#1e40af" }}>A unique FIT Code will be automatically assigned when submitted.</div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ background: "#fff", borderRadius: "14px", border: "0.5px solid #e2e8f0", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                        <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>👤</span>Personal Details</div>
                        <div className="aeq-grid">
                            {[
                                { label: "Full Name *", name: "fullName", placeholder: "Enter full name", required: true },
                                { label: "Mobile Number *", name: "mobileNumber", placeholder: "+91 XXXXX XXXXX", required: true },
                                { label: "Email Address", name: "email", placeholder: "email@example.com", type: "email" },
                                { label: "City / Location", name: "city", placeholder: "e.g. Chennai" },
                            ].map((f) => (
                                <div key={f.name}>
                                    <label className="aeq-lbl" style={lbl}>{f.label}</label>
                                    <input className="aeq-inp" name={f.name} value={formData[f.name]} onChange={handleChange} required={f.required} type={f.type || "text"} placeholder={f.placeholder} style={{ ...inp, paddingLeft: "12px" }} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>🗺️</span>Tour Details</div>
                        <div className="aeq-tour-r1">
                            <div>
                                <label className="aeq-lbl" style={lbl}>Destination *</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", zIndex: 1 }}>🌍</span>
                                    <input className="aeq-inp" name="destination" value={formData.destination} onChange={(e) => { const v = e.target.value; setFormData(p => ({ ...p, destination: v.charAt(0).toUpperCase() + v.slice(1) })); }} required placeholder="e.g. Kerala" style={inp} />
                                </div>
                            </div>
                            <div>
                                <label className="aeq-lbl" style={lbl}>Tour Type *</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", zIndex: 1 }}>🏷️</span>
                                    <select className="aeq-inp" name="tourType" value={formData.tourType} onChange={handleChange} required style={{ ...inp, appearance: "none" }}>
                                        <option value="">Select type</option>
                                        <option>Group tour(fixed departure)</option><option>Customized/Private tour</option>
                                        <option>Friends</option><option>Family</option><option>Corporate/Team Outing</option>
                                        <option>Honeymoon</option><option>pilgrimage tour</option><option>Others</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="aeq-tour-r2">
                            <div>
                                <label className="aeq-lbl" style={lbl}>Travel Date</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>📅</span>
                                    <input className="aeq-inp" name="preferredTravelDate" value={formData.preferredTravelDate} onChange={handleChange} type="date" min={new Date().toISOString().split("T")[0]} style={inp} />
                                </div>
                            </div>
                            <div>
                                <label className="aeq-lbl" style={lbl}>No. of Days</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🌤️</span>
                                    <input className="aeq-inp" name="numberOfDays" value={formData.numberOfDays} onChange={handleChange} type="number" min="1" placeholder="5" style={inp} />
                                </div>
                            </div>
                            <div>
                                <label className="aeq-lbl" style={lbl}>No. of Nights</label>
                                <div style={{ position: "relative" }}>
                                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🌙</span>
                                    <input className="aeq-inp" name="numberOfNights" value={formData.numberOfNights} onChange={handleChange} type="number" min="0" placeholder="4" style={inp} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center" }}>👥</span>Travellers</div>
                        <div className="aeq-trav">
                            {[
                                { key: "a", label: "Adults", color: "#2563eb", bg: "#dbeafe" },
                                { key: "c", label: "Children (6–10)", color: "#ec4899", bg: "#fce7f3" },
                                { key: "i", label: "Infants (0–5)", color: "#f97316", bg: "#ffedd5" },
                            ].map((t) => (
                                <div key={t.key} style={{ background: "#f8fafc", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "12px" }}>
                                    <div style={{ fontSize: "12px", fontWeight: 600, color: t.color, marginBottom: "10px" }}>{t.label}</div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "8px" }}>
                                        <button type="button" onClick={() => changeCount(t.key, -1)} style={{ height: "36px", borderRadius: "8px", background: t.bg, border: "none", color: t.color, fontSize: "20px", cursor: "pointer" }}>−</button>
                                        <span style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", textAlign: "center", minWidth: "28px" }}>{counts[t.key]}</span>
                                        <button type="button" onClick={() => changeCount(t.key, 1)} style={{ height: "36px", borderRadius: "8px", background: t.bg, border: "none", color: t.color, fontSize: "20px", cursor: "pointer" }}>+</button>
                                    </div>
                                </div>
                            ))}
                            <div style={{ background: "#eff6ff", border: "0.5px solid #bfdbfe", borderRadius: "10px", padding: "12px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: 600, marginBottom: "4px" }}>Total Pax</div>
                                <div style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>{counts.a + counts.c + counts.i}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style={sec}><span style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center" }}>💬</span>Additional Info</div>
                        <div className="aeq-add">
                            <div>
                                <label style={lbl}>Special Requests</label>
                                <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} rows={3} placeholder="e.g. vegetarian meals..." style={{ ...inp, height: "auto", resize: "none" }} />
                            </div>
                            <div>
                                <label style={lbl}>Source</label>
                                <select name="source" value={formData.source} onChange={handleChange} style={inp}>
                                    <option value="">Select Source</option>
                                    <option value="Regular">Regular</option>
                                    <option value="Google">Google</option><option value="Facebook">Facebook</option>
                                    <option value="Instagram">Instagram</option><option value="YouTube">YouTube</option>
                                    <option value="Friends & Family">Friends & Family</option>
                                    <option value="Whatsapp/Referral">Whatsapp/Referral</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="submit" disabled={enquiryLoading}
                    style={{ width: "100%", marginTop: "16px", padding: "14px", background: enquiryLoading ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, cursor: enquiryLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {enquiryLoading
                        ? <><div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Creating Enquiry...</>
                        : "✈️ Create Enquiry"}
                </button>
            </form>
        </div>
    );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const TripEnquiries = ({ adminView = false }) => {
    const { getAllEnquiries: tcGetAllEnquiries, enquiries: tcEnquiries, enquiryLoading: tcEnquiryLoading, acceptEnquiry, rejectEnquiry, updateEnquiry, toggleRatePassed, closeEnquiry, reopenEnquiry, backendUrl, ttoken } = useContext(TourContext);
    // Admin login (Tour Admin illa) → VIEW ONLY: Raise, Edit, Accept, Close, Cancel… ellaam maraiyum
    const { aToken, adminViewEnquiries } = useContext(TourAdminContext);
    const viewOnly = adminView || (!ttoken && !!aToken);
    const me = useStaffSelf(); // staff login na avanga, Tour admin na null
    // GV Share — backend sollum (Vinoth / Giridhar staff login, Tour admin, Admin ku mattum true)
    const [gvShareOk, setGvShareOk] = useState(false);

    // View only → list TourAdminContext la irundhu (aToken). Tour Admin / Staff → munnaadi maadhiriye.
    const [adminList, setAdminList] = useState({ list: [], loading: false });
    const loadAdminEnquiries = useCallback(async () => {
        setAdminList((p) => ({ ...p, loading: true }));
        try {
            const list = await adminViewEnquiries();
            setAdminList({ list, loading: false });
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
            setAdminList({ list: [], loading: false });
        }
    }, [adminViewEnquiries]);
    const enquiries = viewOnly ? adminList.list : tcEnquiries;
    const enquiryLoading = viewOnly ? adminList.loading : tcEnquiryLoading;
    const getAllEnquiries = viewOnly ? loadAdminEnquiries : tcGetAllEnquiries;

    // Accepted trip ah cancel panna — charge + reason (optional)
    // Pending enquiry ah pick up panna (login la irukkuravanga per la)
    const pickupEnquiryReq = async (id, body = {}) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${id}/pickup`, body, { headers: { ttoken } });
            data.success ? toast.success(data.message) : toast.error(data.message);
            return data;
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
            return { success: false };
        }
    };

    const cancelEnquiryTrip = async (id, body) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${id}/cancel`, body, { headers: { ttoken } });
            data.success ? toast.success(data.message) : toast.error(data.message);
            return data;
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
            return { success: false };
        }
    };
    const [activeTab, setActiveTab] = useState("all");
    // My Enquiries → default Pickup stage (Pending inga varaadhu); All Enquiries → Pending
    useEffect(() => {
        if (activeTab === "mine") setFilters((p) => ({ ...p, status: "pickup", raisedBy: "" }));
        else if (activeTab === "all") setFilters((p) => (p.status === "pickup" ? { ...p, status: "pending" } : p));
    }, [activeTab]);

    // ── Zones + Forward ──
    const [zones, setZones] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [forwarding, setForwarding] = useState(null); // forward panra enquiry
    const [fwdBusy, setFwdBusy] = useState(false);
    const zoneApi = {
        createZone: async (states, districts = {}) => (await axios.post(`${backendUrl}/api/tour/fit-zones`, { states, districts }, { headers: { ttoken } })).data,
        updateZone: async (id, states, districts = {}) => (await axios.put(`${backendUrl}/api/tour/fit-zones/${id}`, { states, districts }, { headers: { ttoken } })).data,
        deleteZone: async (id) => (await axios.delete(`${backendUrl}/api/tour/fit-zones/${id}`, { headers: { ttoken } })).data,
    };
    // axios error → message
    const wrapApi = Object.fromEntries(Object.entries(zoneApi).map(([k, fn]) => [k, async (...a) => {
        try { return await fn(...a); } catch (err) { throw new Error(err.response?.data?.message || err.message); }
    }]));
    const loadZones = useCallback(async () => {

        try {
            const { data } = await axios.get(`${backendUrl}/api/tour/fit-zones`, { headers: viewOnly ? { aToken, atoken: aToken } : { ttoken } });
            if (data.success) setZones(data.data || []);
        } catch { /* zones illaama list velai seyyum */ }
    }, [backendUrl, ttoken, aToken, viewOnly]);
    const loadStaff = useCallback(async () => {
        if (viewOnly) return;
        try {
            const { data } = await axios.get(`${backendUrl}/api/tour/staff/all`, { headers: { ttoken } });
            // Active + login ON staff ku mattum forward
            setStaffList((data.data || []).filter((s) => s.status !== "Inactive" && s.loginEnabled !== false));
        } catch { setStaffList([]); }
    }, [backendUrl, ttoken, viewOnly]);
    useEffect(() => { loadZones(); loadStaff(); }, [loadZones, loadStaff]);
    useEffect(() => {
        let alive = true;
        axios.get(`${backendUrl}/api/tour/gv-share/access`, { headers: viewOnly ? { aToken, atoken: aToken } : { ttoken } })
            .then(({ data }) => { if (alive) setGvShareOk(!!data?.allowed); })
            .catch(() => { if (alive) setGvShareOk(false); });
        return () => { alive = false; };
    }, [backendUrl, ttoken, aToken, viewOnly]);

    const forwardEnquiryReq = async (e, payload) => {
        setFwdBusy(true);
        try {
            const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${e._id}/forward`, payload, { headers: { ttoken } });
            data.success ? toast.success(data.message) : toast.error(data.message);
            if (data.success) setForwarding(null);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setFwdBusy(false);
            await getAllEnquiries();
        }
    };
    // Forward — Closed / Cancelled / Rejected thavira ella stage la um
    const canForward = (e) => !viewOnly && !["closed", "cancelled", "rejected"].includes(stageOfEnq(e)); // Rejected la Reopen mattum
    // ── "ratePassed" is a virtual filter value layered on top of `status`.
    //    It does NOT correspond to a real status in the DB — selecting it
    //    filters to status === "pending" AND isRatePassed === true. ──
    const [filters, setFilters] = useState({ search: "", destination: "", tourType: "", status: "pending", fromDate: "", toDate: "", raisedBy: "", fitCode: "" });
    const [expandedId, setExpandedId] = useState(null);
    const [modal, setModal] = useState({ open: false, type: "", id: "", name: "", fitCode: "", sub: "" });
    const [editModal, setEditModal] = useState({ open: false, data: null });
    const [loadingId, setLoadingId] = useState(null);
    const [lastEditedId, setLastEditedId] = useState(() => localStorage.getItem("gv_lastEditedId") || null);
    const [lastEditedFields, setLastEditedFields] = useState(() => {
        try { return JSON.parse(localStorage.getItem("gv_lastEditedFields") || "{}"); } catch { return {}; }
    });

    useEffect(() => { getAllEnquiries(); }, []);

    // Stat card click → andha list open aagum (status / raised-by filter)
    //   "total" → ellaam, "s:<stage>" → status, "r:<admin|user>" → raised by
    const openStatCard = (key) => {
        if (key === "total") setFilters((p) => ({ ...p, status: "", raisedBy: "" }));
        else if (key.startsWith("s:")) setFilters((p) => ({ ...p, status: key.slice(2), raisedBy: "" }));
        else if (key.startsWith("r:")) setFilters((p) => ({ ...p, status: "", raisedBy: key.slice(2) }));
        setExpandedId(null);
        setTimeout(() => document.getElementById("eq-list-top")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    };
    const statCardActive = (key) => {
        if (key === "total") return !filters.status && !filters.raisedBy;
        if (key.startsWith("s:")) return filters.status === key.slice(2) && !filters.raisedBy;
        if (key.startsWith("r:")) return filters.raisedBy === key.slice(2) && !filters.status;
        return false;
    };

    // Date filter → inniku varai dhaan (local date, IST)
    const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
    const handleFilter = (e) => {
        const { name, value } = e.target;
        // Type panni future date pottaalum inniku ku maathidum
        const v = (name === "fromDate" || name === "toDate") && value && value > todayStr ? todayStr : value;
        setFilters((p) => ({ ...p, [name]: v }));
    };
    const clearFilters = () => setFilters({ search: "", destination: "", tourType: "", status: activeTab === "mine" ? "pickup" : "pending", fromDate: "", toDate: "", raisedBy: "", fitCode: "" });

    const openModal = (type, id, name, fitCode = "", sub = "") => setModal({ open: true, type, id, name, fitCode, sub });
    const closeModal = () => setModal({ open: false, type: "", id: "", name: "", fitCode: "", sub: "" });

    // ── Stage helpers ──────────────────────────────────────────────────
    // "Rate Shared" and "Closed" are flags layered on top of the real
    // status (pending / accepted), same idea as before. stageOf() gives the
    // single stage key an enquiry is CURRENTLY in; restoreStageOf() gives
    // the stage a rejected enquiry will go back to when reopened.
    const stageLabels = { pending: "Pending", pickup: "Pickup", ratePassed: "Rate Shared", accepted: "Accepted", closed: "Closed", cancelled: "Cancelled", rejected: "Rejected" };
    const stageOf = (e) => {
        if (e.status === "pending") return e.isRatePassed ? "ratePassed" : e.isPickedUp ? "pickup" : "pending";
        if (e.status === "accepted") return e.isCancelled ? "cancelled" : e.isClosed ? "closed" : "accepted";
        return e.status;
    };
    const restoreStageOf = (e) => {
        const prev = ["pending", "accepted"].includes(e.previousStatus) ? e.previousStatus : "pending";
        return stageOf({ ...e, status: prev });
    };
    // Target stage is shown as a coloured pill (same colours as the Status
    // badge in the table) so it's obvious where the enquiry will land.
    const openReopen = (e) => {
        const stage = restoreStageOf(e);
        const sc = statusConfig[stage] || statusConfig.pending;
        const rj = statusConfig.rejected;
        const pill = (cfg, label, strong) => (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: cfg.bg, color: cfg.color, padding: strong ? "6px 14px" : "5px 12px", borderRadius: "20px", fontSize: strong ? "13px" : "12px", fontWeight: 700, whiteSpace: "nowrap", opacity: strong ? 1 : 0.6, border: strong ? `1.5px solid ${cfg.dot}` : "1.5px solid transparent" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
                {label}
            </span>
        );
        // Rendered inside ConfirmModal's <p>, so only <span>s here (no <div>).
        openModal("reopen", e._id, e.fullName, e.fitCode || "", (
            <>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px", marginBottom: "10px" }}>
                    {pill(rj, "Rejected", false)}
                    <span style={{ fontSize: "16px", color: "#94a3b8", fontWeight: 700 }}>→</span>
                    {pill(sc, stageLabels[stage], true)}
                </span>
                <span style={{ display: "block", fontSize: "12px", color: "#64748b" }}>
                    Goes back to the stage it was in before it was rejected.
                </span>
            </>
        ));
    };

    // ── Rate Shared toggle now goes through the SAME confirm modal as
    // Accept/Reject/Delete — clicking the button no longer fires the
    // toggle directly, it opens a "are you sure?" gate first. ──────────
    // ── My Enquiries / All Enquiries ──
    // My = ippo en kitta irukkuradhu (naan pick panna / action panna / enakku forward aanadhu).
    // Staff: All = innum yaar kittaiyum illaadhadhu (common) — My la irukkuradhu inga varaadhu.
    // Tour admin / Admin: All = ellaame.
    const isMineEnq = (e) => {
        const o = ownerOfEnq(e);
        if (!o) return false;
        return me ? o.type === "staff" && String(o.staffId) === String(me._id) : o.type === "touradmin";
    };
    const allList = enquiries || [];
    const showMineTab = !viewOnly && !!me; // My Enquiries — staff login la mattum (Admin / Tour admin ku ellaam All la)
    const myCount = showMineTab ? allList.filter(isMineEnq).length : 0;
    const tabList = activeTab === "mine" && showMineTab ? allList.filter(isMineEnq) : me ? allList.filter((e) => !isMineEnq(e)) : allList;

    const filtered = tabList.filter((e) => {
        const s = filters.search.toLowerCase();
        // "pending" and "ratePassed" are mutually exclusive views over the
        // same underlying status==="pending" enquiries, split by the
        // isRatePassed flag. Without this split, toggling Rate Shared on
        // an enquiry would leave it visible in BOTH the Pending filter
        // AND the Rate Shared filter — defeating the purpose of the
        // toggle (it's meant to move enquiries out of the regular
        // Pending queue into a separate "on hold" queue).
        // Same split for accepted: "accepted" shows only open ones,
        // "closed" shows accepted + isClosed.
        const statusMatches = !filters.status ? true : stageOf(e) === filters.status;
        return (
            (!s || e.fullName?.toLowerCase().includes(s) || e.mobileNumber?.includes(s) || e.email?.toLowerCase().includes(s)) &&
            (!filters.destination || e.destination?.toLowerCase().includes(filters.destination.toLowerCase())) &&
            (!filters.fitCode || e.fitCode?.toLowerCase().includes(filters.fitCode.toLowerCase())) &&
            (!filters.tourType || e.tourType === filters.tourType) &&
            statusMatches &&
            (!filters.raisedBy || e.raisedBy === filters.raisedBy) &&
            (!filters.fromDate || new Date(e.createdAt) >= new Date(`${filters.fromDate}T00:00:00`)) &&
            (!filters.toDate || new Date(e.createdAt) <= new Date(`${filters.toDate}T23:59:59.999`))
        );
    }).sort((a, b) => {
        // accepted filter → pickup date wise (earliest first)
        if (filters.status === "accepted" || filters.status === "closed" || filters.status === "cancelled") {
            const da = a.pickupDate ? new Date(a.pickupDate) : new Date(0);
            const db = b.pickupDate ? new Date(b.pickupDate) : new Date(0);
            return da - db;
        }
        // default → fitCode ascending (GVFIT0001 first)
        const numA = parseInt(a.fitCode?.replace(/\D/g, "") || "0");
        const numB = parseInt(b.fitCode?.replace(/\D/g, "") || "0");
        return numA - numB;
    });

    // Closed → Accepted ku thirumba
    const reopenClosedReq = async (id) => {
        try {
            const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${id}/reopen-closed`, {}, { headers: { ttoken } });
            if (data.success) toast.success(data.message); else toast.error(data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        }
    };
    const handleConfirm = async (extraData = {}) => {
        const { type, id } = modal;
        closeModal();
        setLoadingId(id + "_" + type);
        try {
            if (type === "accept") await acceptEnquiry(id, extraData);
            else if (type === "reject") await rejectEnquiry(id);
            else if (type === "ratePassed") await toggleRatePassed(id);
            else if (type === "close") await closeEnquiry(id);
            else if (type === "reopen") await reopenEnquiry(id);
            else if (type === "reopenClosed") await reopenClosedReq(id);
            else if (type === "cancel") await cancelEnquiryTrip(id, extraData);
            else if (type === "pickup") await pickupEnquiryReq(id, extraData); // { zoneIds: [...] }
        } catch (err) {
            console.error("Accept/Reject/RateShared/Close/Reopen Error:", err);
        }
        setLoadingId(null);
        await getAllEnquiries();
    };

    const statusConfig = {
        pending: { bg: "#FAEEDA", color: "#633806", dot: "#EF9F27", label: "Pending" },
        accepted: { bg: "#EAF3DE", color: "#27500A", dot: "#639922", label: "Accepted" },
        rejected: { bg: "#FCEBEB", color: "#501313", dot: "#E24B4A", label: "Rejected" },
        pickup: { bg: "#E0F2FE", color: "#075985", dot: "#0EA5E9", label: "Pickup" },
        ratePassed: { bg: "#FEF3C7", color: "#92400E", dot: "#EAB308", label: "Rate Shared" },
        closed: { bg: "#E2E8F0", color: "#334155", dot: "#64748B", label: "Closed" },
        cancelled: { bg: "#FFE4E6", color: "#9F1239", dot: "#E11D48", label: "Cancelled" },
    };

    // Cancel details (Cancelled stage la kaatta)
    const fmtDT = (d) => d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
    // ── Yaaru enna panna (actionLog) ─────────────────────────────────
    const ACTION_LABEL = {
        created: "Raised", pickedUp: "Picked up", rateShared: "Rate shared", rateCleared: "Rate shared removed",
        accepted: "Accepted", closed: "Closed", cancelled: "Cancelled", cancelEdited: "Cancel charge edited",
        rejected: "Rejected", reopened: "Reopened", forwarded: "Forwarded",
    };
    const ACTION_COLOR = {
        created: "#64748b", pickedUp: "#0369A1", rateShared: "#B45309", rateCleared: "#B45309",
        accepted: "#3B6D11", closed: "#334155", cancelled: "#9F1239", cancelEdited: "#9F1239",
        rejected: "#A32D2D", reopened: "#3730A3", forwarded: "#0E7490",
    };
    const shortWho = (b) => !b ? "" : b.type === "staff" ? (b.name || "Staff") : b.type === "touradmin" ? "Tour admin" : b.type === "admin" ? "Admin" : (b.name || "");
    // actionLog + pazhaya cancel (log illaama pannadhu) → time order
    const activityOf = (e) => {
        const log = Array.isArray(e.actionLog) ? [...e.actionLog] : [];
        if (e.isCancelled && e.cancelledBy && !log.some((a) => a.action === "cancelled")) {
            log.push({ action: "cancelled", by: e.cancelledBy, at: e.cancelledAt });
        }
        return log.sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0));
    };
    // Raised By — login per (Staff / Tour admin). Pazhaya enquiries ku "Admin" / "User" apdiye.
    const raisedByLabel = (e) => {
        const c = activityOf(e).find((a) => a.action === "created");
        if (c?.by) return `🔧 ${shortWho(c.by)}`;
        return e.raisedBy === "admin" ? "🔧 Admin" : "🌐 User";
    };
    // Status badge keezha kaatta — indha stage ku vandha action yaaru panna
    const stageWho = (e) => {
        const want = { pickup: "pickedUp", ratePassed: "rateShared", accepted: "accepted", closed: "closed", cancelled: "cancelled", rejected: "rejected" }[stageOf(e)];
        if (!want) return null;
        const hit = activityOf(e).filter((a) => a.action === want).pop();
        return hit?.by ? shortWho(hit.by) : (stageOf(e) === "pickup" ? shortWho(e.pickedUpBy) : null);
    };
    const ActivityList = ({ e }) => {
        const items = activityOf(e);
        if (!items.length) return null;
        return (
            <div style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", border: "0.5px solid #e2e8f0" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369A1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>🕒 Activity Log</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {items.map((a, idx) => (
                        <div key={idx} style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px", fontSize: "12px" }}>
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: ACTION_COLOR[a.action] || "#64748b", display: "inline-block", flexShrink: 0, alignSelf: "center" }} />
                            <span style={{ fontWeight: 700, color: ACTION_COLOR[a.action] || "#334155" }}>{ACTION_LABEL[a.action] || a.action}</span>
                            <span style={{ color: "#1e293b" }}>by <b>{cancelWho(a.by) || "—"}</b>{a.to ? <> → <b>{a.to}</b></> : null}{a.zone ? <> · 🗺 {a.zone}</> : null}</span>
                            <span style={{ color: "#94a3b8" }}>· {fmtDT(a.at)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const cancelRows = (e) => [
        ["Cancellation Charge", `₹${Number(e.cancellationCharge || 0).toLocaleString("en-IN")}`],
        ["Reason", e.cancelReason || "—"],
        ["Cancelled By", cancelWho(e.cancelledBy) || "—"],
        ["Cancelled On", fmtDT(e.cancelledAt)],
        ...(e.cancelEditedBy ? [["Charge Edited By", `${cancelWho(e.cancelEditedBy)} · ${fmtDT(e.cancelEditedAt)}`]] : []),
    ];

    // minmax() on the badge columns (FIT Code / Raised By / Status) so the
    // pills never get clipped on narrower laptop/tablet widths — the text
    // columns (Name, Destination) shrink with ellipsis instead.
    const col = "56px minmax(0,1.5fr) minmax(104px,1fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,1fr) minmax(96px,0.9fr) minmax(140px,1.1fr)"; // Actions column illa — expand la
    const headers = ["S.No", "Name", "FIT Code", "Destination", "Travel Date", "Enquired On", "Raised By", "Status"];
    const fInp = { border: "0.5px solid #e2e8f0", borderRadius: "8px", padding: "7px 10px", fontSize: "12px", outline: "none", background: "#f8fafc", color: "#1e293b", height: "34px", width: "100%" };
    const destFmt = (d) => d ? d.charAt(0).toUpperCase() + d.slice(1).toLowerCase() : "—";
    const P = "11px 11px";

    return (
        <div style={{ padding: "16px 20px", background: "white", minHeight: "100vh", width: "100%", boxSizing: "border-box" }}>
            <LeaveGuard
                when={editModal.open}
                title="Unsaved Changes"
                message={
                    <>
                        You are editing an enquiry and the changes are not saved yet.
                        <br />
                        Leaving this page will lose them.
                        <br />
                        Are you sure you want to leave?
                    </>
                }
            />
            <style>{`
                @keyframes spin { to { transform:rotate(360deg); } }
                @media (max-width:1279px) { .eq-desk { display:none !important; } } /* sidebar + table nerukkam — 1280 keezha cards */
                                @media (max-width:600px) { .eq-tabs { display:grid !important; grid-template-columns:1fr 1fr; width:100% !important; } .eq-tabs > button { white-space:nowrap; } }
                @media (min-width:1280px) { .eq-mob  { display:none !important; } }
.eq-stats { display:grid; gap:10px; grid-template-columns:repeat(4,1fr); }
@media (max-width:900px)  { .eq-stats { grid-template-columns:repeat(3,1fr) !important; } }
@media (max-width:600px)  { .eq-stats { grid-template-columns:repeat(2,1fr) !important; } }
                @media (max-width:600px)  { .eq-stats { grid-template-columns:repeat(2,1fr) !important; } }
                .eq-flt-desk { display:flex; flex-direction:column; gap:10px; }
                @media (max-width:900px) { .eq-flt-mob { display:block !important; } .eq-flt-desk { display:none !important; } }
            `}</style>

            <ConfirmModal open={modal.open} type={modal.type} name={modal.name} fitCode={modal.fitCode} sub={modal.sub} onConfirm={handleConfirm} onCancel={closeModal} showGvShare={gvShareOk}
                zones={zones} onOpenZones={() => { closeModal(); setActiveTab("zones"); }} />
            <ForwardEnquiryModal
                key={forwarding?._id || "none"}
                enquiry={forwarding}
                staff={staffList}
                exclude={[ownerOfEnq(forwarding)?.staffId, me?._id]}
                busy={fwdBusy}
                onCancel={() => setForwarding(null)}
                onConfirm={(payload) => forwardEnquiryReq(forwarding, payload)}
            />

            <EditEnquiryModal
                open={editModal.open}
                data={editModal.data}
                zones={zones}
                showGvShare={gvShareOk}
                onSaveZones={async (id, zoneIds) => {
                    try {
                        const { data } = await axios.put(`${backendUrl}/api/tour/enquiry/${id}/zones`, { zoneIds }, { headers: { ttoken } });
                        if (!data.success) { toast.error(data.message); return { success: false }; }
                        toast.success(data.message);
                        await getAllEnquiries();
                        return { success: true };
                    } catch (err) {
                        toast.error(err.response?.data?.message || err.message);
                        return { success: false };
                    }
                }}
                onClose={() => setEditModal({ open: false, data: null })}
                onSave={async (id, savedData) => {
                    const original = editModal.data;
                    const changed = {};
                    Object.keys(savedData).forEach((key) => {
                        if (String(savedData[key] ?? "") !== String(original[key] ?? "")) {
                            changed[key] = true;
                        }
                    });
                    const result = await updateEnquiry(id, savedData);
                    if (result?.success) {
                        setLastEditedId(id);
                        setLastEditedFields(changed);
                        localStorage.setItem("gv_lastEditedId", String(id));
                        localStorage.setItem("gv_lastEditedFields", JSON.stringify(changed));
                        await getAllEnquiries();
                    }
                    return result;
                }}
            />

            {/* Tabs */}
            <div style={{ marginBottom: "16px", textAlign: "center" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", margin: "0 0 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>FIT Enquiries
                    {viewOnly && <span style={{ fontSize: "12px", fontWeight: 600, background: "#f1f5f9", color: "#475569", padding: "3px 10px", borderRadius: "20px" }}>👁 View only</span>}
                </h1><br />
                <div className="eq-tabs" style={{ display: "flex", gap: "4px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content", margin: "0 auto" }}>
                    {[{ key: "all", label: "📋 All Enquiries" }, ...(viewOnly ? [{ key: "zones", label: `🗺 Zones${zones.length ? ` (${zones.length})` : ""}` }] : [...(showMineTab ? [{ key: "mine", label: `👤 My Enquiries${myCount ? ` (${myCount})` : ""}` }] : []), { key: "raise", label: "➕ Raise Enquiry" }, { key: "zones", label: `🗺 Zones${zones.length ? ` (${zones.length})` : ""}` }])].map((t) => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            style={{ padding: "7px 18px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: activeTab === t.key ? "#fff" : "transparent", color: activeTab === t.key ? "#0f172a" : "#64748b", boxShadow: activeTab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === "zones" && <ZonesPanel zones={zones} reload={loadZones} api={wrapApi} readOnly={viewOnly} />}
            {activeTab === "raise" && !viewOnly && <AdminEnquiryForm onSuccess={() => { setActiveTab("all"); setFilters(p => ({ ...p, status: "pending" })); getAllEnquiries(); }} />}
            {(activeTab === "all" || activeTab === "mine") && (
                <>
                    {/* Stats — 3 columns on desktop now */}
                    <div className="eq-stats" style={{ marginBottom: "14px" }}>
                        {[
                            { key: "total", label: "Total", count: tabList.length, bg: "#E6F1FB", color: "#0C447C", icon: "📋" },
                            ...(activeTab === "mine" ? [] : [{ key: "s:pending", label: "Pending", count: tabList.filter(e => stageOf(e) === "pending").length, bg: "#FAEEDA", color: "#633806", icon: "⏳" }]),
                            { key: "s:pickup", label: "Pickup", count: tabList.filter(e => stageOf(e) === "pickup").length, bg: "#E0F2FE", color: "#075985", icon: "✋" },
                            { key: "s:ratePassed", label: "Rate shared", count: tabList.filter(e => stageOf(e) === "ratePassed").length, bg: "#FEF3C7", color: "#92400E", icon: "💰" },
                            { key: "s:accepted", label: "Accepted", count: tabList.filter(e => stageOf(e) === "accepted").length, bg: "#EAF3DE", color: "#27500A", icon: "✅" },
                            { key: "s:closed", label: "Closed", count: tabList.filter(e => stageOf(e) === "closed").length, bg: "#E2E8F0", color: "#334155", icon: "🔒" },
                            { key: "s:cancelled", label: "Cancelled", count: tabList.filter(e => stageOf(e) === "cancelled").length, bg: "#FFE4E6", color: "#9F1239", icon: "🚫" },
                            { key: "s:rejected", label: "Rejected", count: tabList.filter(e => e.status === "rejected").length, bg: "#FCEBEB", color: "#501313", icon: "❌" },
                            { key: "r:admin", label: "By Admin", count: tabList.filter(e => e.raisedBy === "admin").length, bg: "#FFF7ED", color: "#92400e", icon: "🔧" },
                            { key: "r:user", label: "By User", count: tabList.filter(e => e.raisedBy === "user").length, bg: "#EEEDFE", color: "#26215C", icon: "🌐" },
                        ]
                            // Staff portal → All Enquiries: Total, Pending, By Admin, By User mattum
                            .filter((s) => !(me && activeTab === "all") || ["total", "s:pending", "r:admin", "r:user"].includes(s.key))
                            .map((s, i) => {
                            const active = statCardActive(s.key);
                            return (
                                <div key={i} role="button" tabIndex={0} title={`Show ${s.label}`}
                                    onClick={() => openStatCard(s.key)}
                                    onKeyDown={(ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openStatCard(s.key); } }}
                                    style={{ background: s.bg, borderRadius: "12px", padding: "12px 14px", position: "relative", overflow: "hidden", minHeight: "70px", cursor: "pointer", outline: "none", boxShadow: active ? `0 0 0 2px ${s.color}` : "none", transition: "box-shadow 0.15s, transform 0.15s" }}
                                    onMouseEnter={(ev) => { ev.currentTarget.style.transform = "translateY(-1px)"; }}
                                    onMouseLeave={(ev) => { ev.currentTarget.style.transform = "none"; }}>
                                    <div style={{ position: "absolute", right: "-6px", top: "-6px", fontSize: "40px", opacity: 0.12 }}>{s.icon}</div>
                                    <div style={{ fontSize: "24px", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</div>
                                    <div style={{ fontSize: "11px", fontWeight: 500, color: s.color, opacity: 0.85, marginTop: "4px" }}>{s.icon} {s.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Filters */}
                    <div className="eq-flt-desk" style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>SEARCH</label>
                                <input name="search" value={filters.search} onChange={handleFilter} placeholder="Name / mobile / email" style={fInp} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>FIT CODE</label>
                                <input name="fitCode" value={filters.fitCode} onChange={handleFilter} placeholder="GVFIT0001" style={fInp} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>DESTINATION</label>
                                <input name="destination" value={filters.destination} onChange={handleFilter} placeholder="e.g. Manali" style={fInp} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>TOUR TYPE</label>
                                <select name="tourType" value={filters.tourType} onChange={handleFilter} style={fInp}>
                                    <option value="">All types</option>
                                    <option>Group tour(fixed departure)</option>
                                    <option>Customized/Private tour</option>
                                    <option>Friends</option><option>Family</option>
                                    <option>Corporate/Team Outing</option>
                                    <option>Honeymoon</option>
                                    <option>pilgrimage tour</option>
                                    <option>Others</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>STATUS</label>
                                <select name="status" value={filters.status} onChange={handleFilter} style={fInp}>
                                    <option value="">All</option>
                                    {activeTab !== "mine" && <option value="pending">Pending</option>}
                                    <option value="pickup">Pickup</option>
                                    <option value="ratePassed">Rate shared</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="closed">Closed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>RAISED BY</label>
                                <select name="raisedBy" value={filters.raisedBy} onChange={handleFilter} style={fInp}>
                                    <option value="">All</option>
                                    <option value="user">🌐 User</option>
                                    <option value="admin">🔧 Admin</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>FROM</label>
                                <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilter} max={filters.toDate || todayStr} style={fInp} />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px", display: "block" }}>TO</label>
                                <input type="date" name="toDate" value={filters.toDate} onChange={handleFilter} min={filters.fromDate || undefined} max={todayStr} style={fInp} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button onClick={clearFilters} style={{ padding: "10px 28px", background: "royalblue", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer" }}>Clear Filters</button>
                            <button onClick={getAllEnquiries} style={{ padding: "10px 24px", background: "royalblue", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "whitesmoke", cursor: "pointer" }}>🔄 Refresh</button>
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    <div className="eq-flt-mob" style={{ display: "none" }}>
                        <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {[
                                    { label: "Search", name: "search", placeholder: "Name / mobile", type: "text" },
                                    { label: "FIT Code", name: "fitCode", placeholder: "GVFIT0001", type: "text" },
                                    { label: "Destination", name: "destination", placeholder: "e.g. Manali", type: "text" },
                                ].map((f) => (
                                    <div key={f.name}>
                                        <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>{f.label}</label>
                                        <input name={f.name} value={filters[f.name]} onChange={handleFilter} placeholder={f.placeholder} style={fInp} />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>Tour Type</label>
                                    <select name="tourType" value={filters.tourType} onChange={handleFilter} style={fInp}>
                                        <option value="">All types</option>
                                        <option>Group tour(fixed departure)</option>
                                        <option>Customized/Private tour</option>
                                        <option>Friends</option><option>Family</option>
                                        <option>Corporate/Team Outing</option>
                                        <option>Honeymoon</option>
                                        <option>pilgrimage tour</option>
                                        <option>Others</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>Status</label>
                                    <select name="status" value={filters.status} onChange={handleFilter} style={fInp}>
                                        <option value="">All</option>
                                        {activeTab !== "mine" && <option value="pending">Pending</option>}
                                        <option value="pickup">Pickup</option>
                                        <option value="ratePassed">Rate shared</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="closed">Closed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>Raised By</label>
                                    <select name="raisedBy" value={filters.raisedBy} onChange={handleFilter} style={fInp}>
                                        <option value="">All</option>
                                        <option value="user">🌐 User</option>
                                        <option value="admin">🔧 Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>From Date</label>
                                    <input type="date" name="fromDate" value={filters.fromDate} onChange={handleFilter} max={filters.toDate || todayStr} style={fInp} />
                                </div>
                                <div>
                                    <label style={{ fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "6px", display: "block" }}>To Date</label>
                                    <input type="date" name="toDate" value={filters.toDate} onChange={handleFilter} min={filters.fromDate || undefined} max={todayStr} style={fInp} />
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                                <button onClick={clearFilters} style={{ flex: 1, padding: "11px", background: "royalblue", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "white", cursor: "pointer" }}>Clear Filters</button>
                                <button onClick={getAllEnquiries} style={{ flex: 1, padding: "11px", background: "royalblue", border: "0.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "whitesmoke", cursor: "pointer" }}>🔄 Refresh</button>
                            </div>
                        </div>
                    </div>

                    <div id="eq-list-top" style={{ scrollMarginTop: "80px" }} />
                    {/* ── MOBILE VIEW ── */}
                    <div className="eq-mob">
                        <div style={{ background: "#fff", borderRadius: "12px", border: "0.5px solid #e2e8f0", overflow: "hidden" }}>
                            {enquiryLoading ? (
                                <div style={{ padding: "40px", textAlign: "center" }}>
                                    <div style={{ width: "28px", height: "28px", border: "3px solid #e2e8f0", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center" }}>
                                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>No enquiries found</p>
                                </div>
                            ) : filtered.map((e, i) => {
                                const sc = statusConfig[stageOf(e)] || statusConfig.pending;
                                const isDone = e.status !== "pending";
                                const isEditBlocked = e.status === "rejected";
                                const isExp = expandedId === e._id;
                                const total = (e.adults || 0) + (e.children || 0) + (e.infants || 0);
                                const isRatePassedLoading = loadingId === e._id + "_ratePassed";
                                return (
                                    <div key={e._id} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
                                        <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: isExp ? "#f8fafc" : stageOf(e) === "accepted" ? "#f0fdf4" : "#fff" }}
                                            onClick={() => setExpandedId(isExp ? null : e._id)}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                                                <span style={{ minWidth: "22px", height: "22px", borderRadius: "6px", background: "#e2e8f0", color: "#475569", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <p style={{ fontWeight: 600, color: "#0f172a", margin: 0, fontSize: "14px", wordBreak: "break-word", lineHeight: "1.3" }}>{e.fullName}</p>
                                                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{e.destination}</p>
                                                    {stageWho(e) && <p style={{ fontSize: "11px", color: sc.color, margin: "2px 0 0" }}>{sc.label} by <b>{stageWho(e)}</b></p>}
                                                    {(e.zone?.name || ownerOfEnq(e)) && (
                                                        <p style={{ fontSize: "11px", margin: "2px 0 0", color: "#0C447C" }}>
                                                            {e.zone?.name ? `🗺 ${e.zone.name}` : ""}{e.zone?.name && ownerOfEnq(e) ? " · " : ""}
                                                            {ownerOfEnq(e) ? <span style={{ color: "#0E7490" }}>{e.delegatedCount > 0 ? "↪" : "👤"} {ownerText(ownerOfEnq(e))}</span> : null}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                                                {e.status === "pending" && e.isRatePassed ? (
                                                    <span style={{ background: "#FEF3C7", color: "#92400E", padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>Rate Shared</span>
                                                ) : (
                                                    <span style={{ background: sc.bg, color: sc.color, padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>{sc.label}</span>
                                                )}
                                                <span style={{ transform: isExp ? "rotate(90deg)" : "none", transition: "0.2s" }}>▶</span>
                                            </div>
                                        </div>

                                        {isExp && (
                                            <div style={{ padding: "16px", background: "#f8fafc" }}>
                                                {e.fitCode && (
                                                    <div style={{ background: "#E6F1FB", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px" }}>
                                                        <span style={{ fontSize: "13px", color: "#0C447C" }}>FIT Code: </span>
                                                        <span style={{ fontSize: "15px", fontWeight: 800, color: "#0C447C" }}>{e.fitCode}</span>
                                                    </div>
                                                )}
                                                {/* Contact */}
                                                <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0ea5e9", marginBottom: "10px" }}>Contact Details</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>📞 {e.mobileNumber}</div>
                                                    {e.email && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>✉ {e.email}</div>}
                                                    {e.city && <div style={{ padding: "6px 0" }}>📍 {e.city}</div>}
                                                </div>
                                                {/* Trip */}
                                                <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669", marginBottom: "10px" }}>Trip Details</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Destination:</strong> {e.destination}</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Tour Type:</strong> {e.tourType}</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Travel Date:</strong> {e.preferredTravelDate ? new Date(e.preferredTravelDate).toLocaleDateString("en-IN") : "—"}</div>
                                                    {e.pickupDate && (
                                                        <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>
                                                            <strong style={{ color: "#dc2626" }}>🚐 Pickup:</strong>
                                                            <span style={{ color: "#dc2626", fontWeight: 600, marginLeft: "6px" }}>
                                                                {new Date(e.pickupDate).toLocaleDateString("en-IN")}{e.pickupTime ? ` ${e.pickupTime}` : ""}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div style={{ padding: "6px 0" }}><strong>Duration:</strong> {e.numberOfDays || 0}D / {e.numberOfNights || 0}N</div>
                                                </div>
                                                {/* Travellers */}
                                                <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
                                                    <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "10px" }}>Travellers ({total} pax)</div>
                                                    <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>Adults: {e.adults || 0}</div>
                                                    {(e.children || 0) > 0 && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>Children: {e.children}</div>}
                                                    {(e.infants || 0) > 0 && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}>Infants: {e.infants}</div>}
                                                    {e.source && <div style={{ padding: "6px 0" }}>Source: {e.source}</div>}
                                                </div>
                                                {/* Acceptance Details */}
                                                {e.status === "accepted" && (
                                                    <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "12px" }}>
                                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#3B6D11", marginBottom: "10px" }}>✅ Acceptance Details</div>
                                                        {e.salesValue && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Sales Value:</strong> ₹{e.salesValue.toLocaleString("en-IN")}</div>}
                                                        {e.pickupDate && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Pickup Date:</strong> {new Date(e.pickupDate).toLocaleDateString("en-IN")}</div>}
                                                        {e.pickupTime && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Pickup Time:</strong> {e.pickupTime}</div>}
                                                        {gvShareOk && e.gvShare && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>GV Share:</strong> Vinoth (GVEMP008) {gvShareText(e.gvShare.vinoth)} · Giridharan (GVEMP009) {gvShareText(e.gvShare.giridhar)}</div>}
                                                        {e.dropDate && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Drop:</strong> {new Date(e.dropDate).toLocaleDateString("en-IN")}{e.dropTime ? ` ${e.dropTime}` : ""}{e.dropPlace ? ` · ${e.dropPlace}` : ""}</div>}
                                                        {e.pickupPlace && <div style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>Pickup Place:</strong> {e.pickupPlace}</div>}
                                                        {e.fitStates?.length > 0 && (
                                                            <div style={{ marginTop: "10px" }}>
                                                                <div style={{ fontSize: "13px", marginBottom: "6px" }}>FIT States:</div>
                                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                                                    {e.fitStates.map((s, idx) => <span key={idx} style={{ background: "#E6F1FB", color: "#0C447C", padding: "4px 10px", borderRadius: "20px", fontSize: "12px" }}>{s}</span>)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {/* Cancellation Details */}
                                                {e.isCancelled && (
                                                    <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "1px solid #FECDD3", marginBottom: "12px" }}>
                                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#9F1239", marginBottom: "10px" }}>🚫 Cancellation Details</div>
                                                        {cancelRows(e).map(([k, v]) => (
                                                            <div key={k} style={{ padding: "6px 0", borderBottom: "0.5px solid #f1f5f9" }}><strong>{k}:</strong> {v}</div>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* Zone + Forward history */}
                                                {zonesOfEnq(e).length > 0 && <div style={{ marginBottom: "12px" }}><EnquiryZones e={e} mobile /></div>}
                                                {e.delegations?.length > 0 && <div style={{ marginBottom: "12px" }}><ForwardHistory list={e.delegations} /></div>}
                                                {/* Activity — yaaru enna panna */}
                                                {activityOf(e).length > 0 && <div style={{ marginBottom: "12px" }}><ActivityList e={e} /></div>}
                                                {/* Special Requests */}
                                                {e.specialRequests && (
                                                    <div style={{ background: "#fff", borderRadius: "10px", padding: "14px", border: "0.5px solid #e2e8f0", marginBottom: "16px" }}>
                                                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed", marginBottom: "8px" }}>Special Requests</div>
                                                        <div style={{ fontStyle: "italic", color: "#475569" }}>"{e.specialRequests}"</div>
                                                    </div>
                                                )}
                                                {/* Enquired info */}
                                                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "16px" }}>
                                                    Enquired on: {new Date(e.createdAt).toLocaleDateString("en-IN")} {new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                    <span style={{ marginLeft: "8px", background: e.raisedBy === "admin" ? "#FFF7ED" : "#EDE9FE", color: e.raisedBy === "admin" ? "#9A3412" : "#5B21B6", padding: "2px 8px", borderRadius: "20px", fontSize: "11px" }}>
                                                        {raisedByLabel(e)}
                                                    </span>
                                                </div>
                                                {/* Action Buttons (Admin view-only la illa) */}
                                                {!viewOnly && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                                    <button onClick={(ev) => { ev.stopPropagation(); if (!isEditBlocked) setEditModal({ open: true, data: e }); }}
                                                        disabled={isEditBlocked}
                                                        style={{ flex: 1, minWidth: "80px", padding: "12px", background: isEditBlocked ? "#f1f5f9" : "#EEF2FF", color: isEditBlocked ? "#cbd5e1" : "#4338CA", border: "none", borderRadius: "10px", fontWeight: 600, cursor: isEditBlocked ? "not-allowed" : "pointer" }}>
                                                        ✎ Edit
                                                    </button>
                                                    {/* Pending → Pick up (login la irukkuravanga per la) */}
                                                    {stageOf(e) === "pending" && (
                                                        <button onClick={(ev) => { ev.stopPropagation(); openModal("pickup", e._id, e.fullName, e.fitCode || ""); }}
                                                            style={{ flex: 1, minWidth: "100px", padding: "12px", background: "#E0F2FE", color: "#075985", border: "1px solid #BAE6FD", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                                                            ✋ Pick up
                                                        </button>
                                                    )}
                                                    {/* Pickup → Rate Shared */}
                                                    {stageOf(e) === "pickup" && (
                                                        <button onClick={(ev) => { ev.stopPropagation(); openModal("ratePassed", e._id, e.fullName, e.fitCode || ""); }}
                                                            style={{ flex: 1, minWidth: "120px", padding: "12px", background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                                                            💰 Rate Shared
                                                        </button>
                                                    )}
                                                    {e.status === "pending" && e.isRatePassed && (
                                                        <button onClick={(ev) => { ev.stopPropagation(); openModal("accept", e._id, e.fullName, e.fitCode || ""); }}
                                                            style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#EAF3DE", color: "#3B6D11", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                                                            ✓ Accept
                                                        </button>
                                                    )}
                                                    {/* Accepted (not yet closed) → Close button */}
                                                    {stageOf(e) === "accepted" && (
                                                        <button onClick={(ev) => { ev.stopPropagation(); openModal("close", e._id, e.fullName, e.fitCode || ""); }}
                                                            style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#E2E8F0", color: "#334155", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                                                            🔒 Close
                                                        </button>
                                                    )}
                                                    {/* Accepted → Cancel Trip (charge + reason) */}
                                                    {stageOf(e) === "accepted" && (
                                                        <button onClick={(ev) => { ev.stopPropagation(); openModal("cancel", e._id, e.fullName, e.fitCode || ""); }}
                                                            style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#FFE4E6", color: "#9F1239", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                                                            🚫 Cancel
                                                        </button>
                                                    )}
                                                    {/* Closed → Reopen (Accepted ku) */}
                                                    {stageOf(e) === "closed" && (
                                                        <button onClick={(ev) => { ev.stopPropagation(); openModal("reopenClosed", e._id, e.fullName, e.fitCode || ""); }}
                                                            style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#E0E7FF", color: "#3730A3", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                                                            ↺ Reopen
                                                        </button>
                                                    )}
                                                    {/* Forward — Closed / Cancelled thavira */}
                                                    {canForward(e) && (
                                                        <button onClick={(ev) => { ev.stopPropagation(); setForwarding(e); }}
                                                            style={{ flex: 1, minWidth: "90px", padding: "12px", background: "#ECFEFF", color: "#0E7490", border: "1px solid #A5F3FC", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                                                            ↪ Forward
                                                        </button>
                                                    )}
                                                    {/* Rejected → Reopen button (goes back to the stage before reject) */}
                                                    {e.status === "rejected" ? (
                                                        <button onClick={(ev) => { ev.stopPropagation(); openReopen(e); }}
                                                            style={{ flex: 1, minWidth: "80px", padding: "12px", background: "#E0E7FF", color: "#3730A3", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>
                                                            ↺ Reopen
                                                        </button>
                                                    ) : (
                                                        <button onClick={(ev) => { ev.stopPropagation(); !isDone && openModal("reject", e._id, e.fullName, e.fitCode || ""); }} disabled={isDone}
                                                            style={{ flex: 1, minWidth: "80px", padding: "12px", background: isDone ? "#f1f5f9" : "#FCEBEB", color: isDone ? "#cbd5e1" : "#A32D2D", border: "none", borderRadius: "10px", fontWeight: 600, cursor: isDone ? "not-allowed" : "pointer" }}>
                                                            ✕ Reject
                                                        </button>
                                                    )}
                                                </div>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", paddingTop: "8px" }}>
                            Showing <strong>{filtered.length}</strong> of <strong>{tabList.length}</strong> enquiries
                        </div>
                    </div>

                    {/* ── DESKTOP + TAB TABLE ── */}
                    <div className="eq-desk" style={{ width: "100%" }}>
                        <div style={{ background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "14px", overflow: "hidden" }}>
                            <div style={{ display: "grid", gridTemplateColumns: col, background: "#e3effaff", borderBottom: "0.5px solid #e2e8f0" }}>
                                {headers.map((h) => (
                                    <div key={h} style={{ padding: P, fontSize: "11px", fontWeight: 700, color: "#616975ff", letterSpacing: "0.04em", textTransform: h === "S.No" ? "none" : "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h}</div>
                                ))}
                            </div>

                            {enquiryLoading ? (
                                <div style={{ padding: "50px", textAlign: "center" }}>
                                    <div style={{ width: "28px", height: "28px", border: "3px solid #e2e8f0", borderTop: "3px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                                    <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div style={{ padding: "50px", textAlign: "center" }}>
                                    <div style={{ fontSize: "36px", marginBottom: "8px" }}>📭</div>
                                    <p style={{ color: "#94a3b8", fontSize: "14px" }}>No enquiries found</p>
                                </div>
                            ) : filtered.map((e, i) => {
                                const sc = statusConfig[stageOf(e)] || statusConfig.pending;
                                const isDone = e.status !== "pending";
                                const isEditBlocked = e.status === "rejected";
                                const isExp = expandedId === e._id;
                                const total = (e.adults || 0) + (e.children || 0) + (e.infants || 0);
                                const isLoading = ["accept", "reject", "close", "reopen", "cancel", "pickup"].some((t) => loadingId === e._id + "_" + t);
                                const isRatePassedLoading = loadingId === e._id + "_ratePassed";
                                return (
                                    <div key={e._id} style={{ borderBottom: "0.5px solid #f1f5f9" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: col, alignItems: "center", background: isExp ? "#f8fafc" : stageOf(e) === "accepted" ? "#f0fdf4" : "#fff", transition: "background 0.1s", cursor: "pointer" }}
                                            onMouseEnter={(ev) => { if (!isExp) ev.currentTarget.style.background = stageOf(e) === "accepted" ? "#f0fdf4" : "#f8fafc"; }}
                                            onMouseLeave={(ev) => { if (!isExp) ev.currentTarget.style.background = stageOf(e) === "accepted" ? "#f0fdf4" : "#fff"; }}
                                            onClick={() => setExpandedId(isExp ? null : e._id)}>

                                            <div style={{ padding: P, display: "flex", alignItems: "center", gap: "4px" }}>
                                                <span style={{ fontSize: "9px", color: isExp ? "#2563eb" : "#cbd5e1", display: "inline-block", transform: isExp ? "rotate(90deg)" : "none", transition: "transform 0.2s", fontWeight: 700 }}>▶</span>
                                                <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>{i + 1}</span>
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.fullName}</div>
                                                <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📞 {e.mobileNumber}</div>
                                            </div>
                                            <div style={{ padding: P, overflow: "visible" }}>
                                                {e.fitCode
                                                    ? <span style={{ background: "#E6F1FB", color: "#0C447C", padding: "3px 7px", borderRadius: "5px", fontSize: "10px", fontWeight: 700, letterSpacing: "0.3px", whiteSpace: "nowrap", display: "inline-block" }}>{e.fitCode}</span>
                                                    : <span style={{ color: "#cbd5e1", fontSize: "12px" }}>—</span>}
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#711c66ff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{destFmt(e.destination)}</div>
                                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>{e.numberOfDays || 0}D/{e.numberOfNights || 0}N</div>
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <div style={{ fontSize: "12px", color: "#475569", whiteSpace: "nowrap" }}>
                                                    {e.preferredTravelDate ? new Date(e.preferredTravelDate).toLocaleDateString("en-IN") : "—"}
                                                </div>
                                                {e.pickupDate && (
                                                    <div style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600, whiteSpace: "nowrap" }}>
                                                        🚐 {new Date(e.pickupDate).toLocaleDateString("en-IN")}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 500, whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleDateString("en-IN")}</div>
                                                <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{new Date(e.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                <span style={{ background: e.raisedBy === "admin" ? "#FFF7ED" : "#EDE9FE", color: e.raisedBy === "admin" ? "#9A3412" : "#5B21B6", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "middle" }} title={raisedByLabel(e)}>
                                                    {raisedByLabel(e)}
                                                </span>
                                            </div>
                                            <div style={{ padding: P, overflow: "hidden" }}>
                                                {e.status === "pending" && e.isRatePassed ? (
                                                    <span style={{ background: "#FEF3C7", color: "#92400E", padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
                                                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#EAB308", display: "inline-block", flexShrink: 0 }} /> Rate Shared
                                                    </span>
                                                ) : (
                                                    <span style={{ background: sc.bg, color: sc.color, padding: "3px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
                                                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dot, display: "inline-block", flexShrink: 0 }} />{sc.label}
                                                    </span>
                                                )}
                                                {(() => {
                                                    // Status keezha 3 chinna lines: yaar panna · zones · (forward / vera aal kitta na) yaar kitta
                                                    const who = stageWho(e);
                                                    const zs = zonesOfEnq(e);
                                                    const own = ownerOfEnq(e);
                                                    const ownName = ownerText(own);
                                                    const showOwner = own && (e.delegatedCount > 0 || !who || String(who).toLowerCase() !== String(ownName).toLowerCase());
                                                    const line = { fontSize: "10.5px", marginTop: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.35 };
                                                    return (
                                                        <>
                                                            {who && (
                                                                <div title={`${stageLabels[stageOf(e)]} by ${who}`} style={{ ...line, color: "#64748b" }}>
                                                                    by <b style={{ color: "#334155", fontWeight: 600 }}>{who}</b>
                                                                </div>
                                                            )}
                                                            {zs.length > 0 && (
                                                                <div title={zs.map((z) => `${z.name}: ${zoneSummary(z)}`).join("\n")} style={{ ...line, color: "#0C447C", fontWeight: 600 }}>
                                                                    🗺 {zs.map((z) => z.name).join(" · ")}
                                                                </div>
                                                            )}
                                                            {showOwner && (
                                                                <div title={`Only ${ownName} can see and work on this${e.delegatedCount > 0 ? " (forwarded)" : ""}`} style={{ ...line, color: "#0E7490", fontWeight: 600 }}>
                                                                    {e.delegatedCount > 0 ? "↪ with" : "👤 with"} {ownName}
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        {/* Expanded Row */}
                                        {isExp && (
                                            <div style={{ background: "#f8fafc", borderTop: "0.5px solid #e2e8f0", padding: "12px 24px" }}>
                                            <div data-no-toggle onClick={(ev) => ev.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", background: "#fff", border: "0.5px solid #e2e8f0", borderRadius: "10px", padding: "10px 14px", marginBottom: "10px" }}>
                                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>Actions</span>
                                                {viewOnly ? (
                                                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>👁 View</span>
                                                ) : isLoading || isRatePassedLoading ? (
                                                    <div style={{ width: "14px", height: "14px", border: "2px solid #e2e8f0", borderTop: "2px solid #2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                                                ) : (
                                                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                        <button onClick={(ev) => { ev.stopPropagation(); if (!isEditBlocked) setEditModal({ open: true, data: e }); }}
                                                            disabled={isEditBlocked} title="Edit"
                                                            style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "none", background: isEditBlocked ? "#f1f5f9" : "#EEF2FF", color: isEditBlocked ? "#cbd5e1" : "#4338CA", cursor: isEditBlocked ? "not-allowed" : "pointer", opacity: isEditBlocked ? 0.4 : 1, fontSize: "12.5px" }}>✎ Edit</button>
                                                        {/* Pending → Pick up */}
                                                        {stageOf(e) === "pending" && (
                                                            <button onClick={(ev) => { ev.stopPropagation(); openModal("pickup", e._id, e.fullName, e.fitCode || ""); }} title="Pick up"
                                                                style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "1px solid #BAE6FD", background: "#E0F2FE", color: "#075985", cursor: "pointer", fontSize: "12.5px" }}>✋ Pick up</button>
                                                        )}
                                                        {/* Pickup → Rate Shared */}
                                                        {stageOf(e) === "pickup" && (
                                                            <button onClick={(ev) => { ev.stopPropagation(); openModal("ratePassed", e._id, e.fullName, e.fitCode || ""); }} title="Mark Rate Shared"
                                                                style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "1px solid #FDE68A", background: "#FFFBEB", color: "#92400E", cursor: "pointer", fontSize: "12.5px" }}>💰 Rate shared</button>
                                                        )}
                                                        {e.status === "pending" && e.isRatePassed && (
                                                            <button onClick={(ev) => { ev.stopPropagation(); openModal("accept", e._id, e.fullName, e.fitCode || ""); }} title="Accept"
                                                                style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "none", background: "#EAF3DE", color: "#3B6D11", cursor: "pointer", fontSize: "12.5px" }}>✓ Accept</button>
                                                        )}
                                                        {/* Accepted (not yet closed) → Close button */}
                                                        {stageOf(e) === "accepted" && (
                                                            <button onClick={(ev) => { ev.stopPropagation(); openModal("close", e._id, e.fullName, e.fitCode || ""); }} title="Close Enquiry"
                                                                style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "none", background: "#E2E8F0", color: "#334155", cursor: "pointer", fontSize: "12.5px" }}>🔒 Close</button>
                                                        )}
                                                        {/* Accepted → Cancel Trip (charge + reason) */}
                                                        {stageOf(e) === "accepted" && (
                                                            <button onClick={(ev) => { ev.stopPropagation(); openModal("cancel", e._id, e.fullName, e.fitCode || ""); }} title="Cancel Trip"
                                                                style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "none", background: "#FFE4E6", color: "#9F1239", cursor: "pointer", fontSize: "12.5px" }}>🚫 Cancel Trip</button>
                                                        )}
                                                        {/* Closed → Reopen (Accepted ku) */}
                                                        {stageOf(e) === "closed" && (
                                                            <button onClick={(ev) => { ev.stopPropagation(); openModal("reopenClosed", e._id, e.fullName, e.fitCode || ""); }} title="Reopen → Accepted"
                                                                style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "none", background: "#E0E7FF", color: "#3730A3", cursor: "pointer", fontSize: "12.5px" }}>↺ Reopen</button>
                                                        )}
                                                        {/* Forward — Closed / Cancelled thavira */}
                                                        {canForward(e) && (
                                                            <button onClick={(ev) => { ev.stopPropagation(); setForwarding(e); }} title="Forward"
                                                                style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "1px solid #A5F3FC", background: "#ECFEFF", color: "#0E7490", cursor: "pointer", fontSize: "12.5px" }}>↪ Forward</button>
                                                        )}
                                                        {/* Rejected → Reopen button (goes back to the stage before reject) */}
                                                        {e.status === "rejected" ? (
                                                            <button onClick={(ev) => { ev.stopPropagation(); openReopen(e); }} title={`Reopen → ${stageLabels[restoreStageOf(e)]}`}
                                                                style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "none", background: "#E0E7FF", color: "#3730A3", cursor: "pointer", fontSize: "12.5px" }}>↺ Reopen</button>
                                                        ) : (
                                                            <button onClick={(ev) => { ev.stopPropagation(); !isDone && openModal("reject", e._id, e.fullName, e.fitCode || ""); }} disabled={isDone} title="Reject"
                                                                style={{ height: "34px", padding: "0 12px", display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 600, borderRadius: "6px", border: "none", background: isDone ? "#f1f5f9" : "#FCEBEB", color: isDone ? "#cbd5e1" : "#A32D2D", cursor: isDone ? "not-allowed" : "pointer", opacity: isDone ? 0.4 : 1, fontSize: "12.5px" }}>✕ Reject</button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
                                                    {[
                                                        {
                                                            head: "📞 Contact", color: "#0ea5e9",
                                                            rows: [["Full name", e.fullName], ["Mobile", e.mobileNumber], ["Email", e.email || "—"], ["City", e.city || "—"], ["FIT Code", e.fitCode || "—"]],
                                                        },
                                                        {
                                                            head: "✈️ Trip", color: "#059669",
                                                            rows: [["Destination", destFmt(e.destination)], ["Tour type", e.tourType], ["Travel date", e.preferredTravelDate ? new Date(e.preferredTravelDate).toLocaleDateString("en-IN") : "—"], ["Duration", `${e.numberOfDays || 0}D/${e.numberOfNights || 0}N`], ["Pax", `${total}(${e.adults || 0}A ${e.children || 0}C ${e.infants || 0}I)`]],
                                                            pickupDate: e.pickupDate,
                                                            pickupTime: e.pickupTime,
                                                        },
                                                        {
                                                            head: e.status === "accepted" ? (e.isCancelled ? "🚫 Acceptance (Cancelled)" : e.isClosed ? "🔒 Acceptance (Closed)" : "✅ Acceptance") : "👥 More Info", color: e.isCancelled ? "#9F1239" : e.status === "accepted" ? "#3B6D11" : "#7c3aed",
                                                            rows: e.status === "accepted"
                                                                ? [["Sales Value", e.salesValue ? `₹${e.salesValue.toLocaleString("en-IN")}` : "—"], ["Pickup Date", e.pickupDate ? new Date(e.pickupDate).toLocaleDateString("en-IN") : "—"], ["Pickup Time", e.pickupTime || "—"], ["Pickup Place", e.pickupPlace || "—"], ["Drop", e.dropDate ? `${new Date(e.dropDate).toLocaleDateString("en-IN")}${e.dropTime ? ` ${e.dropTime}` : ""}` : "—"], ["Drop Place", e.dropPlace || "—"], ...(gvShareOk && e.gvShare ? [["GV Share · Vinoth (GVEMP008)", gvShareText(e.gvShare.vinoth)], ["GV Share · Giridharan (GVEMP009)", gvShareText(e.gvShare.giridhar)]] : []), ["Source", e.source || "—"], ["Raised By", raisedByLabel(e)], ...(e.isClosed ? [["Closed On", e.closedAt ? `${new Date(e.closedAt).toLocaleDateString("en-IN")}${e.autoClosed ? " (auto)" : ""}` : "—"]] : []), ...(e.isCancelled ? cancelRows(e) : [])]
                                                                : [...(e.status === "rejected" ? [["Reopens To", stageLabels[restoreStageOf(e)]]] : []), ["Rate Shared", e.isRatePassed ? "💰 Yes" : "No"], ["Adults", `${e.adults || 0}`], ["Children", `${e.children || 0}`], ["Infants", `${e.infants || 0}`], ["Source", e.source || "—"], ["Raised By", raisedByLabel(e)]],
                                                            extra: e.specialRequests,
                                                            fitStates: e.status === "accepted" ? e.fitStates : null,
                                                        },
                                                    ].map((card) => (
                                                        <div key={card.head} style={{ background: "#fff", borderRadius: "10px", padding: "12px 14px", border: "0.5px solid #e2e8f0" }}>
                                                            <div style={{ fontSize: "11px", fontWeight: 700, color: card.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{card.head}</div>
                                                            {card.rows.map(([k, v]) => (
                                                                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f8fafc" }}>
                                                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{k}</span>
                                                                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", textAlign: "right", maxWidth: "60%", wordBreak: "break-word" }}>{v}</span>
                                                                </div>
                                                            ))}
                                                            {card.head.includes("Trip") && card.pickupDate && (
                                                                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "0.5px solid #f8fafc" }}>
                                                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Pickup date</span>
                                                                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626" }}>
                                                                        🚐 {new Date(card.pickupDate).toLocaleDateString("en-IN")}{card.pickupTime ? ` ${card.pickupTime}` : ""}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {card.fitStates?.length > 0 && (
                                                                <div style={{ marginTop: "6px" }}>
                                                                    <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "5px" }}>FIT STATES</div>
                                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                                                        {card.fitStates.map(s => <span key={s} style={{ background: "#E6F1FB", color: "#0C447C", padding: "3px 9px", borderRadius: "10px", fontSize: "11px", fontWeight: 500 }}>{s}</span>)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {card.extra && (
                                                                <div style={{ marginTop: "6px", background: "#f8fafc", borderRadius: "6px", padding: "6px 8px" }}>
                                                                    <div style={{ fontSize: "10px", color: "#eb3d09ff", marginBottom: "2px" }}>Special requests</div>
                                                                    <div style={{ fontSize: "11px", color: "#885dabff", fontStyle: "italic" }}>"{card.extra}"</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Zone + Forward history */}
                                                {(zonesOfEnq(e).length > 0 || e.delegations?.length > 0) && (
                                                    <div style={{ display: "grid", gridTemplateColumns: zonesOfEnq(e).length && e.delegations?.length ? "1fr 1fr" : "1fr", gap: "10px", marginTop: "10px" }}>
                                                        <EnquiryZones e={e} />
                                                        <ForwardHistory list={e.delegations} />
                                                    </div>
                                                )}
                                                {/* Activity — yaaru enna panna */}
                                                {activityOf(e).length > 0 && <div style={{ marginTop: "10px" }}><ActivityList e={e} /></div>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            <div style={{ padding: "8px 12px", borderTop: "0.5px solid #f1f5f9", fontSize: "11px", color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                                <span>Showing <strong>{filtered.length}</strong> of <strong>{tabList.length}</strong> enquiries</span>
                                <span>▶ click row to expand</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TripEnquiries;







